package com.tickettriage.ticket_triage.repository;

import com.tickettriage.ticket_triage.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Optional<Incident> findByCategoryAndStatus(String category, String status);
}