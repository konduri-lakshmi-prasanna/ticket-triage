package com.tickettriage.ticket_triage.dto;

public class TicketAnalysisResult {
    private String category;
    private String department;
    private String priority;
    private String sentiment;
    private String suggestedResponse;

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public String getSuggestedResponse() { return suggestedResponse; }
    public void setSuggestedResponse(String suggestedResponse) { this.suggestedResponse = suggestedResponse; }
}