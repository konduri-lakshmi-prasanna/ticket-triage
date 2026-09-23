package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.dto.TicketAnalysisResult;
import com.tickettriage.ticket_triage.entity.Ticket;
import com.tickettriage.ticket_triage.repository.TicketRepository;
import com.tickettriage.ticket_triage.service.RoutingService;
import com.tickettriage.ticket_triage.service.TicketAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    // Matches the column length on Ticket.message
    private static final int MAX_MESSAGE_LENGTH = 2000;

    private final TicketRepository ticketRepository;
    private final TicketAnalysisService analysisService;
    private final RoutingService routingService;

    public TicketController(
            TicketRepository ticketRepository,
            TicketAnalysisService analysisService,
            RoutingService routingService) {

        this.ticketRepository = ticketRepository;
        this.analysisService = analysisService;
        this.routingService = routingService;
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Map<String, String> request) {

        String message = request.get("message");

        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        message = message.trim();

        if (message.length() > MAX_MESSAGE_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message must be at most " + MAX_MESSAGE_LENGTH + " characters");
        }

        TicketAnalysisResult analysis =
                analysisService.analyze(message);

        Ticket ticket = new Ticket();

        ticket.setMessage(message);
        ticket.setCategory(analysis.getCategory());
        ticket.setDepartment(
                routingService.routeDepartment(analysis.getCategory())
        );
        ticket.setPriority(analysis.getPriority());
        ticket.setSentiment(analysis.getSentiment());
        ticket.setSuggestedResponse(
                analysis.getSuggestedResponse()
        );

        return ticketRepository.save(ticket);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Lets the customer look up a single ticket and see its current status
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long id) {
        return ticketRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setStatus(request.get("status"));
                    Ticket updatedTicket = ticketRepository.save(ticket);
                    return ResponseEntity.ok(updatedTicket);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}