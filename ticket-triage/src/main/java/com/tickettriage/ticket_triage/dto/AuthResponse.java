package com.tickettriage.ticket_triage.dto;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        String role) {
}