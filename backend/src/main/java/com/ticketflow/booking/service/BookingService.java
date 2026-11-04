package com.ticketflow.booking.service;

import com.ticketflow.auth.model.User;
import com.ticketflow.booking.dto.BookingDto;
import com.ticketflow.booking.model.Order;
import com.ticketflow.booking.model.OrderItem;
import com.ticketflow.booking.model.OrderStatus;
import com.ticketflow.booking.repository.OrderRepository;
import com.ticketflow.common.BusinessException;
import com.ticketflow.event.model.Event;
import com.ticketflow.event.model.TicketTier;
import com.ticketflow.event.repository.EventRepository;
import com.ticketflow.event.repository.TicketTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final TicketTierRepository ticketTierRepository;

    @Value("${ticketflow.booking.order-hold-duration-seconds:600}")
    private long orderHoldDurationSeconds;

    /**
     * High-concurrency ticket lock:
     * Utilizes database-level atomic conditional deduction (UPDATE WHERE available >= qty)
     * eliminating race conditions and overselling without heavy distributed lock overhead.
     */
    @Transactional
    public BookingDto.OrderResponse createOrder(User user, BookingDto.CreateOrderRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new BusinessException("Event not found", HttpStatus.NOT_FOUND));

        TicketTier tier = ticketTierRepository.findById(request.getTicketTierId())
                .orElseThrow(() -> new BusinessException("Ticket tier not found", HttpStatus.NOT_FOUND));

        if (!tier.getEvent().getId().equals(event.getId())) {
            throw new BusinessException("Selected ticket tier does not belong to this event", HttpStatus.BAD_REQUEST);
        }

        // Atomic capacity reservation
        int updatedRows = ticketTierRepository.deductCapacityDirect(tier.getId(), request.getQuantity());
        if (updatedRows == 0) {
            throw new BusinessException("Sold out or insufficient tickets available for " + tier.getName(), HttpStatus.CONFLICT);
        }

        BigDecimal unitPrice = tier.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));
        Instant expiresAt = Instant.now().plusSeconds(orderHoldDurationSeconds);

        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .event(event)
                .totalAmount(subtotal)
                .status(OrderStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .ticketTier(tier)
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .build();

        order.getItems().add(orderItem);

        Order saved = orderRepository.save(order);
        log.info("Ticket reserved successfully. Order #{} created for user {} (expires in {}s)",
                saved.getOrderNumber(), user.getEmail(), orderHoldDurationSeconds);

        return mapToDto(saved);
    }

    @Transactional
    public BookingDto.OrderResponse payOrder(User user, BookingDto.PayOrderRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new BusinessException("Order not found: " + request.getOrderNumber(), HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Unauthorized access to this order", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Order is in state " + order.getStatus() + " and cannot be paid", HttpStatus.BAD_REQUEST);
        }

        if (Instant.now().isAfter(order.getExpiresAt())) {
            // Auto release capacity if expired
            releaseOrderCapacity(order);
            order.setStatus(OrderStatus.EXPIRED);
            orderRepository.save(order);
            throw new BusinessException("Order hold expired. Capacity has been released.", HttpStatus.GONE);
        }

        // Mock payment process success
        order.setStatus(OrderStatus.CONFIRMED);
        Order saved = orderRepository.save(order);
        log.info("Order #{} payment confirmed successfully.", saved.getOrderNumber());

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDto.OrderResponse> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto.OrderResponse getOrderByNumber(User user, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new BusinessException("Order not found: " + orderNumber, HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Unauthorized to view this order", HttpStatus.FORBIDDEN);
        }

        return mapToDto(order);
    }

    /**
     * Automatic sweep for expired hold orders: runs every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void cleanupExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findExpiredOrders(OrderStatus.PENDING, Instant.now());
        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("Found {} expired ticket reservations. Releasing capacity...", expiredOrders.size());
        for (Order order : expiredOrders) {
            try {
                releaseOrderCapacity(order);
                order.setStatus(OrderStatus.EXPIRED);
                orderRepository.save(order);
                log.info("Released capacity for expired order #{}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to release capacity for order #{}: {}", order.getOrderNumber(), e.getMessage());
            }
        }
    }

    private void releaseOrderCapacity(Order order) {
        for (OrderItem item : order.getItems()) {
            ticketTierRepository.releaseCapacityDirect(item.getTicketTier().getId(), item.getQuantity());
        }
    }

    private BookingDto.OrderResponse mapToDto(Order order) {
        List<BookingDto.OrderItemResponse> itemDtos = order.getItems().stream()
                .map(i -> BookingDto.OrderItemResponse.builder()
                        .ticketTierId(i.getTicketTier().getId())
                        .tierName(i.getTicketTier().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return BookingDto.OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .eventId(order.getEvent().getId())
                .eventTitle(order.getEvent().getTitle())
                .venue(order.getEvent().getVenue())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
