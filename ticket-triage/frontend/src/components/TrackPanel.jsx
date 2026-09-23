import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, TextField, Typography } from '@mui/material';
import { POLL_INTERVAL_MS, getTicket, saveRecentId } from '../lib';
import TicketStub from './TicketStub';

export default function TrackPanel({ ticket, onTicketChange, recentIds, onRecentChange }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill when the customer arrives from "Track this ticket"
  const [seenId, setSeenId] = useState(ticket?.id);
  if (ticket?.id !== seenId) {
    setSeenId(ticket?.id);
    if (ticket?.id) setInput(String(ticket.id));
  }

  const lookup = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      onTicketChange(null);
      try {
        const found = await getTicket(id);
        onTicketChange(found);
        setInput(String(id));
        onRecentChange(saveRecentId(found.id));
      } catch (err) {
        if (err.response?.status === 404) setError(`No ticket found with number ${id}. Check the number and try again.`);
        else if (!err.response) setError('Cannot reach the server. Check your connection and try again.');
        else setError('Something went wrong on our side. Try again in a moment.');
      } finally {
        setLoading(false);
      }
    },
    [onTicketChange, onRecentChange],
  );

  const submit = (e) => {
    e.preventDefault();
    const id = input.trim().replace(/^#/, '');
    if (!/^\d+$/.test(id)) {
      onTicketChange(null);
      setError('Enter the ticket number you received, for example 12.');
      return;
    }
    lookup(Number(id));
  };

  // Refresh the status while the ticket is still being worked on
  const id = ticket?.id;
  const status = ticket?.status;
  useEffect(() => {
    if (!id || status === 'RESOLVED') return undefined;
    const timer = setInterval(async () => {
      try {
        onTicketChange(await getTicket(id));
      } catch {
        // ignore transient errors; the next poll retries
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, status, onTicketChange]);

  return (
    <Box>
      <Box
        component="form"
        onSubmit={submit}
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          boxShadow: '0 1px 2px rgba(23,32,38,0.06)',
        }}
      >
        <Typography variant="h2" sx={{ fontSize: 24, mb: 0.5 }}>
          Check a ticket
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Enter the number you received when you sent your request.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            placeholder="Ticket number, e.g. 12"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Ticket number' } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !input.trim()}
            sx={{ minWidth: 150, flexShrink: 0 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Check status'}
          </Button>
        </Box>

        {recentIds.length > 0 && (
          <Box sx={{ mt: 2.5 }}>
            <Typography variant="caption" color="text.secondary">
              Tickets you sent from this device
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
              {recentIds.map((rid) => (
                <Chip
                  key={rid}
                  label={`#${rid}`}
                  onClick={() => lookup(rid)}
                  color="primary"
                  variant={ticket?.id === rid ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2.5 }} role="alert">
            {error}
          </Alert>
        )}
      </Box>

      {ticket && (
        <Box sx={{ mt: 3 }}>
          <TicketStub ticket={ticket} />
        </Box>
      )}
    </Box>
  );
}