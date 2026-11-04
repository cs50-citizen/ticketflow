package com.ticketflow.event.controller;

import com.ticketflow.common.ApiResponse;
import com.ticketflow.event.dto.EventDto;
import com.ticketflow.event.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Browse concerts, conferences, sports events and ticket tiers")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "Get all active events with ticket availability")
    public ResponseEntity<ApiResponse<List<EventDto.EventResponse>>> getActiveEvents() {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getAllActiveEvents()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event details and real-time ticket tier inventory")
    public ResponseEntity<ApiResponse<EventDto.EventResponse>> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.getEventById(id)));
    }
}

