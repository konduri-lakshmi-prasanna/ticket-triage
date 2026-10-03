package com.tickettriage.ticket_triage.repository;

import com.tickettriage.ticket_triage.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Tickets that belong to one customer, newest first
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
}