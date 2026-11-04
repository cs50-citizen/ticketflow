package com.ticketflow.event.repository;

import com.ticketflow.event.model.TicketTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTierRepository extends JpaRepository<TicketTier, Long> {

    List<TicketTier> findByEventId(Long eventId);

    /**
     * Direct atomic inventory deduction at DB layer - guaranteed safe against race conditions!
     */
    @Modifying
    @Query("UPDATE TicketTier t SET t.availableCapacity = t.availableCapacity - :qty " +
           "WHERE t.id = :tierId AND t.availableCapacity >= :qty")
    int deductCapacityDirect(@Param("tierId") Long tierId, @Param("qty") int qty);

    /**
     * Release capacity back upon cancellation/expiry
     */
    @Modifying
    @Query("UPDATE TicketTier t SET t.availableCapacity = t.availableCapacity + :qty " +
           "WHERE t.id = :tierId")
    int releaseCapacityDirect(@Param("tierId") Long tierId, @Param("qty") int qty);
}

