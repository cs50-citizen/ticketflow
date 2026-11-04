package com.ticketflow.booking;

import com.ticketflow.auth.model.Role;
import com.ticketflow.auth.model.User;
import com.ticketflow.auth.repository.UserRepository;
import com.ticketflow.booking.dto.BookingDto;
import com.ticketflow.booking.service.BookingService;
import com.ticketflow.event.model.Event;
import com.ticketflow.event.model.TicketTier;
import com.ticketflow.event.repository.EventRepository;
import com.ticketflow.event.repository.TicketTierRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
public class BookingConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TicketTierRepository ticketTierRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Verify Zero Overselling: 50 concurrent threads competing for 10 tickets")
    void testConcurrentBookingZeroOversell() throws InterruptedException {
        // 1. Arrange a flash sale event with ONLY 10 tickets
        User user = userRepository.save(User.builder()
                .email("concurrency_tester@ticketflow.io")
                .passwordHash("hashed")
                .fullName("Tester")
                .role(Role.CUSTOMER)
                .build());

        Event event = eventRepository.save(Event.builder()
                .title("Flash Sale VIP Concert")
                .venue("Sydney Opera House")
                .city("Sydney")
                .category("Concert")
                .startTime(Instant.now().plus(7, ChronoUnit.DAYS))
                .endTime(Instant.now().plus(7, ChronoUnit.DAYS).plus(3, ChronoUnit.HOURS))
                .status("ACTIVE")
                .build());

        final int initialCapacity = 10;
        TicketTier tier = ticketTierRepository.save(TicketTier.builder()
                .event(event)
                .name("Exclusive Front Row")
                .price(new BigDecimal("99.00"))
                .totalCapacity(initialCapacity)
                .availableCapacity(initialCapacity)
                .build());

        final int totalThreads = 50;
        ExecutorService executor = Executors.newFixedThreadPool(totalThreads);
        CountDownLatch readyLatch = new CountDownLatch(totalThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < totalThreads; i++) {
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // ensure simultaneous firing
                    BookingDto.CreateOrderRequest req = new BookingDto.CreateOrderRequest(event.getId(), tier.getId(), 1);
                    bookingService.createOrder(user, req);
                    successCount.incrementAndGet();
                } catch (Exception ex) {
                    failCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown(); // FIRE ALL THREADS AT ONCE
        doneLatch.await();
        executor.shutdown();

        // 3. Assertions
        TicketTier finalTier = ticketTierRepository.findById(tier.getId()).orElseThrow();

        assertThat(successCount.get()).isEqualTo(10);
        assertThat(failCount.get()).isEqualTo(40);
        assertThat(finalTier.getAvailableCapacity()).isEqualTo(0);
    }
}
