package com.ticketflow.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class EventDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketTierResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private Integer totalCapacity;
        private Integer availableCapacity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventResponse {
        private Long id;
        private String title;
        private String description;
        private String venue;
        private String city;
        private String category;
        private String imageUrl;
        private Instant startTime;
        private Instant endTime;
        private String status;
        private List<TicketTierResponse> ticketTiers;
    }
}
