package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.entity.Ticket;
import com.tickettriage.ticket_triage.repository.TicketRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;

    public TicketController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Map<String, String> request) {
        Ticket ticket = new Ticket();
        ticket.setMessage(request.get("message"));

        // Stubbed AI analysis — replace with real LLM call later
        ticket.setCategory("Payment");
        ticket.setDepartment("Billing");
        ticket.setPriority("HIGH");
        ticket.setSentiment("Negative");
        ticket.setSuggestedResponse("We are reviewing your issue and will get back to you shortly.");

        return ticketRepository.save(ticket);
    }
}