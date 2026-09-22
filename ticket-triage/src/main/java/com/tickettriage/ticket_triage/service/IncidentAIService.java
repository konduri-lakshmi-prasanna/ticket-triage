package com.tickettriage.ticket_triage.service;

import com.tickettriage.ticket_triage.dto.IncidentAIResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class IncidentAIService {

    private final ChatClient chatClient;

    public IncidentAIService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public IncidentAIResult analyzeSimilarity(String ticket1, String ticket2) {

        String systemPrompt = """
                You are an incident detection assistant for a customer support system.

                Your task is to determine whether two customer support tickets
                describe the SAME underlying technical or business issue.

                Consider the meaning of the messages, not just matching words.

                Examples:

                Ticket 1:
                "My payment was deducted but the order was not placed"

                Ticket 2:
                "Money was deducted from my account but my order was not created"

                These describe the same underlying issue.

                Another example:

                Ticket 1:
                "My payment failed"

                Ticket 2:
                "I was charged twice for the same order"

                These describe different issues.

                Respond with ONLY a JSON object.
                Do not include markdown or explanation.

                The JSON must contain exactly these fields:
                - sameIncident: true or false
                - title: short title if they describe the same issue, otherwise empty string
                - description: short description if they describe the same issue, otherwise empty string
                """;

        String userPrompt = """
                Ticket 1:
                %s

                Ticket 2:
                %s
                """.formatted(ticket1, ticket2);

        return chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .entity(IncidentAIResult.class);
    }
}