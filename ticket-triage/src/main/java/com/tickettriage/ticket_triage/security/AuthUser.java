package com.tickettriage.ticket_triage.security;

// The logged-in user, rebuilt from the JWT on every request.
// Controllers receive it with @AuthenticationPrincipal.
public record AuthUser(Long id, String email, String name, String role) {

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}