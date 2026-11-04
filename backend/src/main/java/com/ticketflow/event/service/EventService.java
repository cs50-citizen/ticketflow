package com.ticketflow.event.service;

import com.ticketflow.common.BusinessException;
import com.ticketflow.event.dto.EventDto;
import com.ticketflow.event.model.Event;
import com.ticketflow.event.model.TicketTier;
import com.ticketflow.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<EventDto.EventResponse> getAllActiveEvents() {
        return eventRepository.findAllActiveWithTiers().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDto.EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new BusinessException("Event not found with ID: " + eventId, HttpStatus.NOT_FOUND));
        return mapToDto(event);
    }

    private EventDto.EventResponse mapToDto(Event event) {
        List<EventDto.TicketTierResponse> tierDtos = event.getTicketTiers().stream()
                .map(t -> EventDto.TicketTierResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .price(t.getPrice())
                        .totalCapacity(t.getTotalCapacity())
                        .availableCapacity(t.getAvailableCapacity())
                        .build())
                .collect(Collectors.toList());

        return EventDto.EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .city(event.getCity())
                .category(event.getCategory())
                .imageUrl(event.getImageUrl())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .ticketTiers(tierDtos)
                .build();
    }
}
