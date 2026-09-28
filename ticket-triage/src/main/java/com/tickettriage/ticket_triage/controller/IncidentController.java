package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.entity.Incident;
import com.tickettriage.ticket_triage.repository.IncidentRepository;
import com.tickettriage.ticket_triage.service.IncidentDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateIncidentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        return incidentRepository.findById(id)
                .map(incident -> {

                    String status = request.get("status");

                    if (status == null || status.isBlank()) {
                        return ResponseEntity.badRequest().<Incident>build();
                    }

                    incident.setStatus(status);

                    Incident updatedIncident =
                            incidentRepository.save(incident);

                    return ResponseEntity.ok(updatedIncident);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}