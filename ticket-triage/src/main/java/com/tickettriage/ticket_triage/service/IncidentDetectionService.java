package com.tickettriage.ticket_triage.service;

import com.tickettriage.ticket_triage.dto.IncidentAIResult;
import com.tickettriage.ticket_triage.entity.Incident;
import com.tickettriage.ticket_triage.entity.Ticket;
import com.tickettriage.ticket_triage.repository.IncidentRepository;
import com.tickettriage.ticket_triage.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IncidentDetectionService {

    private final TicketRepository ticketRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentAIService incidentAIService;

    public IncidentDetectionService(
            TicketRepository ticketRepository,
            IncidentRepository incidentRepository,
            IncidentAIService incidentAIService) {

        this.ticketRepository = ticketRepository;
        this.incidentRepository = incidentRepository;
        this.incidentAIService = incidentAIService;
    }

    public List<Incident> detectIncidents() {

        // Get all tickets from the database
        List<Ticket> tickets = ticketRepository.findAll();

        // Group tickets by category
        Map<String, List<Ticket>> ticketsByCategory =
                tickets.stream()
                        .filter(ticket -> ticket.getCategory() != null)
                        .collect(Collectors.groupingBy(Ticket::getCategory));

        // Process each category separately
        for (Map.Entry<String, List<Ticket>> entry
                : ticketsByCategory.entrySet()) {

            String category = entry.getKey();
            List<Ticket> categoryTickets = entry.getValue();

            // At least two tickets are required
            // to detect an incident
            if (categoryTickets.size() < 2) {
                continue;
            }

            /*
             * Use the first ticket as the base ticket.
             *
             * Every other ticket in the same category
             * is compared with the base ticket using AI.
             */
            Ticket baseTicket = categoryTickets.get(0);

            List<Ticket> matchingTickets = new ArrayList<>();
            matchingTickets.add(baseTicket);

            String incidentTitle = null;
            String incidentDescription = null;

            for (int i = 1; i < categoryTickets.size(); i++) {

                Ticket currentTicket = categoryTickets.get(i);

                IncidentAIResult aiResult =
                        incidentAIService.analyzeSimilarity(
                                baseTicket.getMessage(),
                                currentTicket.getMessage()
                        );

                /*
                 * Add the ticket only if AI determines
                 * that it represents the same incident.
                 */
                if (aiResult.isSameIncident()) {

                    matchingTickets.add(currentTicket);

                    // Store the AI-generated incident information
                    if (incidentTitle == null) {
                        incidentTitle = aiResult.getTitle();
                    }

                    if (incidentDescription == null) {
                        incidentDescription =
                                aiResult.getDescription();
                    }
                }
            }

            /*
             * Create/update an incident only when
             * at least two tickets belong to it.
             */
            if (matchingTickets.size() >= 2) {

                Incident incident =
                        findExistingIncident(
                                category,
                                matchingTickets
                        );

                /*
                 * If no existing incident is found,
                 * create a new one.
                 */
                if (incident == null) {

                    incident = new Incident();

                    incident.setCategory(category);
                    incident.setStatus("ACTIVE");
                }

                // Set AI-generated title
                if (incidentTitle != null) {
                    incident.setTitle(incidentTitle);
                }

                // Set AI-generated description
                if (incidentDescription != null) {
                    incident.setDescription(
                            incidentDescription
                    );
                }

                /*
                 * Store the IDs of the tickets
                 * belonging to this incident.
                 *
                 * Example:
                 * 1,2
                 */
                String ticketIds = matchingTickets.stream()
                        .map(ticket ->
                                String.valueOf(ticket.getId()))
                        .collect(Collectors.joining(","));

                incident.setTicketIds(ticketIds);

                // Update the number of tickets
                incident.setTicketCount(
                        matchingTickets.size()
                );

                // Determine overall incident priority
                incident.setPriority(
                        determinePriority(matchingTickets)
                );

                // Save the incident
                incidentRepository.save(incident);
            }
        }

        // Return all incidents
        return incidentRepository.findAll();
    }

    /*
     * Finds an existing incident for the matching tickets.
     *
     * First, we look for an incident that already contains
     * one of the matching ticket IDs.
     *
     * Then, we handle old incidents that were created
     * before the ticketIds field was added.
     */
    private Incident findExistingIncident(
            String category,
            List<Ticket> matchingTickets) {

        List<Incident> incidents =
                incidentRepository.findAll();

        /*
         * STEP 1:
         * Look for an existing incident that already
         * contains one of the matching ticket IDs.
         */
        for (Incident incident : incidents) {

            if (!"ACTIVE".equalsIgnoreCase(
                    incident.getStatus())) {
                continue;
            }

            if (!category.equalsIgnoreCase(
                    incident.getCategory())) {
                continue;
            }

            String existingTicketIds =
                    incident.getTicketIds();

            if (existingTicketIds == null ||
                    existingTicketIds.isBlank()) {
                continue;
            }

            for (Ticket ticket : matchingTickets) {

                String ticketId =
                        String.valueOf(ticket.getId());

                if (existingTicketIds
                        .contains(ticketId)) {

                    return incident;
                }
            }
        }

        /*
         * STEP 2:
         * Handle legacy incidents.
         *
         * Incident #1 was created before we added
         * the ticketIds field, so its ticketIds value
         * is currently empty.
         *
         * Reuse that incident instead of creating
         * another duplicate incident.
         */
        for (Incident incident : incidents) {

            if (!"ACTIVE".equalsIgnoreCase(
                    incident.getStatus())) {
                continue;
            }

            if (!category.equalsIgnoreCase(
                    incident.getCategory())) {
                continue;
            }

            String existingTicketIds =
                    incident.getTicketIds();

            if (existingTicketIds == null ||
                    existingTicketIds.isBlank()) {

                return incident;
            }
        }

        // No existing incident found
        return null;
    }

    /*
     * Determines the overall priority of an incident
     * based on the priorities of its tickets.
     *
     * HIGH > MEDIUM > LOW
     */
    private String determinePriority(List<Ticket> tickets) {

        boolean hasHighPriority = tickets.stream()
                .anyMatch(ticket ->
                        "HIGH".equalsIgnoreCase(
                                ticket.getPriority()
                        )
                );

        if (hasHighPriority) {
            return "HIGH";
        }

        boolean hasMediumPriority = tickets.stream()
                .anyMatch(ticket ->
                        "MEDIUM".equalsIgnoreCase(
                                ticket.getPriority()
                        )
                );

        if (hasMediumPriority) {
            return "MEDIUM";
        }

        return "LOW";
    }
}