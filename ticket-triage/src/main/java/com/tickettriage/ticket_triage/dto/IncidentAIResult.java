package com.tickettriage.ticket_triage.dto;

public class IncidentAIResult {

    private boolean sameIncident;
    private String title;
    private String description;

    public boolean isSameIncident() {
        return sameIncident;
    }

    public void setSameIncident(boolean sameIncident) {
        this.sameIncident = sameIncident;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}