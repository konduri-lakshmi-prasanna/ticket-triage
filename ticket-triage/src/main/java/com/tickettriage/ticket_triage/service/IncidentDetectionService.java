package com.tickettriage.ticket_triage.service;

import com.tickettriage.ticket_triage.entity.Incident;
import com.tickettriage.ticket_triage.entity.Ticket;
import com.tickettriage.ticket_triage.repository.IncidentRepository;
import com.tickettriage.ticket_triage.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IncidentDetectionService {

    private final TicketRepository ticketRepository;
    private final IncidentRepository incidentRepository;

    public IncidentDetectionService(
            TicketRepository ticketRepository,
            IncidentRepository incidentRepository) {

        this.ticketRepository = ticketRepository;
        this.incidentRepository = incidentRepository;
    }

    public List<Incident> detectIncidents() {

        List<Ticket> tickets = ticketRepository.findAll();

        Map<String, List<Ticket>> ticketsByCategory =
                tickets.stream()
                        .filter(ticket -> ticket.getCategory() != null)
                        .collect(Collectors.groupingBy(Ticket::getCategory));

        for (Map.Entry<String, List<Ticket>> entry : ticketsByCategory.entrySet()) {

            String category = entry.getKey();
            List<Ticket> relatedTickets = entry.getValue();

            if (relatedTickets.size() >= 2) {

                Incident incident = incidentRepository
                        .findByCategoryAndStatus(category, "ACTIVE")
                        .orElse(null);

                if (incident == null) {

                    // Create a new incident
                    incident = new Incident();

                    incident.setTitle(category + " related incident");

                    incident.setDescription(
                            "Multiple tickets have been detected in the "
                                    + category
                                    + " category."
                    );

                    incident.setCategory(category);
                    incident.setStatus("ACTIVE");
                }

                // Update the incident with the latest ticket information
                incident.setTicketCount(relatedTickets.size());

                incident.setPriority(
                        determinePriority(relatedTickets)
                );

                incidentRepository.save(incident);
            }
        }

        return incidentRepository.findAll();
    }

    private String determinePriority(List<Ticket> tickets) {

        boolean hasHighPriority = tickets.stream()
                .anyMatch(ticket ->
                        "HIGH".equalsIgnoreCase(ticket.getPriority()));

        if (hasHighPriority) {
            return "HIGH";
        }

        boolean hasMediumPriority = tickets.stream()
                .anyMatch(ticket ->
                        "MEDIUM".equalsIgnoreCase(ticket.getPriority()));

        if (hasMediumPriority) {
            return "MEDIUM";
        }

        return "LOW";
    }
}