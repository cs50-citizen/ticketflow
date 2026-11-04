package com.ticketflow.event.repository;

import com.ticketflow.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT DISTINCT e FROM Event e LEFT JOIN FETCH e.ticketTiers WHERE e.status = 'ACTIVE' ORDER BY e.startTime ASC")
    List<Event> findAllActiveWithTiers();
}

