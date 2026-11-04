package com.ticketflow.booking.dto;

import com.ticketflow.booking.model.OrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class BookingDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotNull(message = "Event ID is required")
        private Long eventId;

        @NotNull(message = "Ticket tier ID is required")
        private Long ticketTierId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long ticketTierId;
        private String tierName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderResponse {
        private Long orderId;
        private String orderNumber;
        private Long eventId;
        private String eventTitle;
        private String venue;
        private BigDecimal totalAmount;
        private OrderStatus status;
        private Instant expiresAt;
        private Instant createdAt;
        private List<OrderItemResponse> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayOrderRequest {
        @NotNull(message = "Order number is required")
        private String orderNumber;
        private String paymentMethod; // e.g. "MOCK_CARD", "STRIPE"
    }
}

