package com.tickettriage.ticket_triage.repository;

import com.tickettriage.ticket_triage.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}