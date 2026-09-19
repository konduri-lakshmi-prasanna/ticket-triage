package com.tickettriage.ticket_triage.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class RoutingService {

    private static final Map<String, String> CATEGORY_TO_DEPARTMENT = Map.of(
            "Payment", "Billing",
            "Login", "Account",
            "Technical", "Technical",
            "Delivery", "Logistics",
            "Other", "Technical"
    );

    public String routeDepartment(String category) {
        return CATEGORY_TO_DEPARTMENT.getOrDefault(category, "Technical");
    }
}