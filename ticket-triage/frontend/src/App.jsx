import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

const API_URL = 'http://localhost:8080/api/tickets';
const STORAGE_KEY = 'recentTicketIds';
const MAX_MESSAGE_LENGTH = 2000;
const POLL_INTERVAL_MS = 10000;

const STATUS_STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

/* ---------- helpers ---------- */

function loadRecentIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveRecentId(id) {
  const updated = [id, ...loadRecentIds().filter((existing) => existing !== id)].slice(0, 5);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable (private mode etc.) - tracking by number still works
  }
  return updated;
}

function priorityColor(priority) {
  if (priority === 'HIGH') return 'error';
  if (priority === 'MEDIUM') return 'warning';
  return 'default';
}

function sentimentColor(sentiment) {
  if (sentiment === 'Angry') return 'error';
  if (sentiment === 'Negative') return 'warning';
  if (sentiment === 'Positive') return 'success';
  return 'default';
}

function submitErrorMessage(err) {
  if (err.response?.status === 400) {
    return `Please enter a message (up to ${MAX_MESSAGE_LENGTH} characters).`;
  }
  if (!err.response) {
    return 'Cannot reach the server. Please check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

/* ---------- components ---------- */

function StatusTracker({ status }) {
  const index = STATUS_STEPS.indexOf(status);
  // Resolved is the last step, so mark every step as completed
  const activeStep = status === 'RESOLVED' ? STATUS_STEPS.length : Math.max(index, 0);

  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 3 }}>
      {STATUS_STEPS.map((step) => (
        <Step key={step}>
          <StepLabel>{STATUS_LABELS[step]}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

function TicketCard({ ticket, showTracker = false }) {
  return (
    <Card sx={{ mt: 3 }} variant="outlined">
      <CardContent>
        <Typography variant="h6">Ticket #{ticket.id}</Typography>

        {ticket.createdAt && (
          <Typography variant="caption" color="text.secondary">
            Submitted {new Date(ticket.createdAt).toLocaleString()}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, my: 1.5, flexWrap: 'wrap' }}>
          <Chip label={ticket.category} color="primary" />
          <Chip label={ticket.department} />
          <Chip label={`${ticket.priority} priority`} color={priorityColor(ticket.priority)} />
          <Chip label={ticket.sentiment} color={sentimentColor(ticket.sentiment)} variant="outlined" />
        </Box>

        {showTracker && <StatusTracker status={ticket.status} />}

        {!showTracker && (
          <Box sx={{ my: 1.5 }}>
            <Chip label={STATUS_LABELS[ticket.status] ?? ticket.status} variant="outlined" />
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Your message
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {ticket.message}
        </Typography>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Our response
        </Typography>
        <Typography variant="body2">{ticket.suggestedResponse}</Typography>
      </CardContent>
    </Card>
  );
}

function App() {
  const [tab, setTab] = useState(0);
  const [recentIds, setRecentIds] = useState(loadRecentIds);

  // Submit tab
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Track tab
  const [trackId, setTrackId] = useState('');
  const [tracked, setTracked] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitted(null);

    try {
      const response = await axios.post(API_URL, { message: message.trim() });
      setSubmitted(response.data);
      setRecentIds(saveRecentId(response.data.id));
      setMessage('');
    } catch (err) {
      setSubmitError(submitErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const lookupTicket = useCallback(async (id) => {
    setTracking(true);
    setTrackError(null);
    setTracked(null);

    try {
      const response = await axios.get(`${API_URL}/${id}`);
      setTracked(response.data);
      setTrackId(String(id));
      setRecentIds(saveRecentId(response.data.id));
    } catch (err) {
      if (err.response?.status === 404) {
        setTrackError(`No ticket found with number ${id}.`);
      } else if (!err.response) {
        setTrackError('Cannot reach the server. Please try again.');
      } else {
        setTrackError('Something went wrong. Please try again.');
      }
    } finally {
      setTracking(false);
    }
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const id = trackId.trim().replace(/^#/, '');
    if (!/^\d+$/.test(id)) {
      setTracked(null);
      setTrackError('Please enter a valid ticket number, for example 12.');
      return;
    }
    lookupTicket(Number(id));
  };

  const trackSubmittedTicket = () => {
    setTab(1);
    setTracked(submitted);
    setTrackId(String(submitted.id));
    setTrackError(null);
  };

  // Keep the status fresh while the ticket is still being worked on
  const trackedId = tracked?.id;
  const trackedStatus = tracked?.status;
  useEffect(() => {
    if (!trackedId || trackedStatus === 'RESOLVED') return undefined;

    const timer = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/${trackedId}`);
        setTracked(response.data);
      } catch {
        // ignore transient errors; the next poll will retry
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [trackedId, trackedStatus]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Customer Support
        </Typography>

        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
          <Tab label="Submit a ticket" />
          <Tab label="Track a ticket" />
        </Tabs>

        {tab === 0 && (
          <>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Describe your issue"
                multiline
                rows={4}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                slotProps={{ htmlInput: { maxLength: MAX_MESSAGE_LENGTH } }}
                helperText={`${message.length}/${MAX_MESSAGE_LENGTH}`}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || !message.trim()}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
              </Button>
            </form>

            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}

            {submitted && (
              <>
                <Alert severity="success" sx={{ mt: 3 }}>
                  Your ticket has been submitted. Save ticket number <strong>#{submitted.id}</strong> to
                  check its status later.
                </Alert>
                <TicketCard ticket={submitted} />
                <Button variant="outlined" sx={{ mt: 2 }} onClick={trackSubmittedTicket}>
                  Track this ticket
                </Button>
              </>
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <form onSubmit={handleTrackSubmit}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Ticket number"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={tracking || !trackId.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {tracking ? <CircularProgress size={24} color="inherit" /> : 'Check status'}
                </Button>
              </Box>
            </form>

            {recentIds.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Your recent tickets
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  {recentIds.map((id) => (
                    <Chip
                      key={id}
                      label={`#${id}`}
                      onClick={() => lookupTicket(id)}
                      variant={tracked?.id === id ? 'filled' : 'outlined'}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {trackError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {trackError}
              </Alert>
            )}

            {tracked && <TicketCard ticket={tracked} showTracker />}
          </>
        )}
      </Container>
    </>
  );
}

export default App;