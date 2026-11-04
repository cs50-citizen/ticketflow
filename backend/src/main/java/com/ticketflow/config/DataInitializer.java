package com.ticketflow.config;

import com.ticketflow.auth.model.Role;
import com.ticketflow.auth.model.User;
import com.ticketflow.auth.repository.UserRepository;
import com.ticketflow.event.model.Event;
import com.ticketflow.event.model.TicketTier;
import com.ticketflow.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial users (admin@ticketflow.io / demo@ticketflow.io)...");

            User admin = User.builder()
                    .email("admin@ticketflow.io")
                    .fullName("Platform Administrator")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();

            User demoUser = User.builder()
                    .email("demo@ticketflow.io")
                    .fullName("Demo Customer")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(Role.CUSTOMER)
                    .build();

            userRepository.saveAll(List.of(admin, demoUser));
        }

        if (eventRepository.count() == 0) {
            log.info("Seeding initial events & ticket tiers...");

            Event coldplay = Event.builder()
                    .title("Coldplay: Music of the Spheres World Tour")
                    .description("Experience the mesmerizing visual spectacle and timeless anthems live at Accor Stadium.")
                    .venue("Accor Stadium, Sydney Olympic Park")
                    .city("Sydney")
                    .category("Concert")
                    .imageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80")
                    .startTime(Instant.now().plus(14, ChronoUnit.DAYS))
                    .endTime(Instant.now().plus(14, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS))
                    .status("ACTIVE")
                    .build();

            TicketTier tier1 = TicketTier.builder()
                    .event(coldplay)
                    .name("General Admission Standing")
                    .price(new BigDecimal("149.00"))
                    .totalCapacity(5000)
                    .availableCapacity(5000)
                    .build();

            TicketTier tier2 = TicketTier.builder()
                    .event(coldplay)
                    .name("A-Reserve Seated")
                    .price(new BigDecimal("229.00"))
                    .totalCapacity(3000)
                    .availableCapacity(3000)
                    .build();

            coldplay.getTicketTiers().addAll(List.of(tier1, tier2));

            Event awsSummit = Event.builder()
                    .title("AWS Cloud Tech Summit 2026")
                    .description("The premier cloud computing conference connecting builders, architects, and engineering leaders.")
                    .venue("International Convention Centre (ICC)")
                    .city("Sydney")
                    .category("Conference")
                    .imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80")
                    .startTime(Instant.now().plus(30, ChronoUnit.DAYS))
                    .endTime(Instant.now().plus(31, ChronoUnit.DAYS))
                    .status("ACTIVE")
                    .build();

            TicketTier awsTier1 = TicketTier.builder()
                    .event(awsSummit)
                    .name("Standard Pass")
                    .price(new BigDecimal("299.00"))
                    .totalCapacity(2000)
                    .availableCapacity(2000)
                    .build();

            TicketTier awsTier2 = TicketTier.builder()
                    .event(awsSummit)
                    .name("Developer All-Access + Workshop")
                    .price(new BigDecimal("599.00"))
                    .totalCapacity(800)
                    .availableCapacity(800)
                    .build();

            awsSummit.getTicketTiers().addAll(List.of(awsTier1, awsTier2));

            Event f1 = Event.builder()
                    .title("Formula 1 Australian Grand Prix")
                    .description("High-octane motorsport racing returns to the scenic lakeside Albert Park circuit.")
                    .venue("Albert Park Grand Prix Circuit")
                    .city("Melbourne")
                    .category("Sports")
                    .imageUrl("https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80")
                    .startTime(Instant.now().plus(45, ChronoUnit.DAYS))
                    .endTime(Instant.now().plus(47, ChronoUnit.DAYS))
                    .status("ACTIVE")
                    .build();

            TicketTier f1Tier1 = TicketTier.builder()
                    .event(f1)
                    .name("Park Pass 4-Day")
                    .price(new BigDecimal("195.00"))
                    .totalCapacity(10000)
                    .availableCapacity(10000)
                    .build();

            f1.getTicketTiers().add(f1Tier1);

            eventRepository.saveAll(List.of(coldplay, awsSummit, f1));
            log.info("Seeding completed successfully.");
        }
    }
}

