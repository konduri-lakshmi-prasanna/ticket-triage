package com.tickettriage.ticket_triage.service;

import com.tickettriage.ticket_triage.dto.TicketAnalysisResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class TicketAnalysisService {

    private final ChatClient chatClient;

    public TicketAnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public TicketAnalysisResult analyze(String message) {

        String systemPrompt = """
                You are a customer support ticket classifier.
                Given a customer message, respond with ONLY a JSON object (no markdown, no explanation) with these exact fields:
                - category: one of Payment, Login, Technical, Delivery, Other
                - department: one of Billing, Account, Technical, Logistics
                - priority: one of LOW, MEDIUM, HIGH
                - sentiment: one of Positive, Neutral, Negative, Angry
                - suggestedResponse: a short, empathetic one-sentence response to the customer
                """;

        return chatClient.prompt()
                .system(systemPrompt)
                .user(message)
                .call()
                .entity(TicketAnalysisResult.class);
    }
}