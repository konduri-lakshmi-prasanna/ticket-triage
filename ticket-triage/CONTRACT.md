# API Contract

## POST /api/tickets
Request:
{ "message": "string" }

Response:
{
  "id": number,
  "message": "string",
  "category": "Payment | Login | Technical | Delivery | Other",
  "department": "Billing | Account | Technical | Logistics",
  "priority": "LOW | MEDIUM | HIGH",
  "sentiment": "Positive | Neutral | Negative | Angry",
  "status": "OPEN | IN_PROGRESS | RESOLVED",
  "suggestedResponse": "string",
  "createdAt": "ISO 8601 timestamp"
}