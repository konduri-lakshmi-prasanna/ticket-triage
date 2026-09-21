package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.entity.Incident;
import com.tickettriage.ticket_triage.repository.IncidentRepository;
import com.tickettriage.ticket_triage.service.IncidentDetectionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentRepository incidentRepository;
    private final IncidentDetectionService incidentDetectionService;

    public IncidentController(
            IncidentRepository incidentRepository,
            IncidentDetectionService incidentDetectionService) {

        this.incidentRepository = incidentRepository;
        this.incidentDetectionService = incidentDetectionService;
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @PostMapping("/detect")
    public List<Incident> detectIncidents() {
        return incidentDetectionService.detectIncidents();
    }
}