package com.tickettriage.ticket_triage.controller;

import com.tickettriage.ticket_triage.dto.AuthResponse;
import com.tickettriage.ticket_triage.dto.LoginRequest;
import com.tickettriage.ticket_triage.dto.RegisterRequest;
import com.tickettriage.ticket_triage.entity.User;
import com.tickettriage.ticket_triage.repository.UserRepository;
import com.tickettriage.ticket_triage.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Customer sign up. Always creates a CUSTOMER account.
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(User.ROLE_CUSTOMER);

        return toResponse(userRepository.save(user));
    }

    // Customer login. Admin accounts must use /admin/login.
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {

        User user = authenticate(request);

        if (User.ROLE_ADMIN.equals(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "This is an admin account. Use the admin login.");
        }

        return toResponse(user);
    }

    // Admin login. A customer account is treated exactly like a wrong password.
    @PostMapping("/admin/login")
    public AuthResponse adminLogin(@Valid @RequestBody LoginRequest request) {

        User user = authenticate(request);

        if (!User.ROLE_ADMIN.equals(user.getRole())) {
            throw invalidCredentials();
        }

        return toResponse(user);
    }

    private User authenticate(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(
                        request.password(), user.getPasswordHash()))
                .orElseThrow(AuthController::invalidCredentials);
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
    }
}