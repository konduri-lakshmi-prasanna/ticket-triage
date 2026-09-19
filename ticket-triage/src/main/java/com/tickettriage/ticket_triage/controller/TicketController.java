package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.dto.TicketAnalysisResult;
import com.tickettriage.ticket_triage.entity.Ticket;
import com.tickettriage.ticket_triage.repository.TicketRepository;
import com.tickettriage.ticket_triage.service.RoutingService;
import com.tickettriage.ticket_triage.service.TicketAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

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
}