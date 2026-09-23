import { useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, TextField, Typography } from '@mui/material';
import { EXAMPLES, MAX_MESSAGE_LENGTH, createTicket } from '../lib';
import TicketStub from './TicketStub';

function errorText(err) {
  if (err.response?.status === 400) {
    return `Enter a message of up to ${MAX_MESSAGE_LENGTH} characters.`;
  }
  if (!err.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  return 'Something went wrong on our side. Try again in a moment.';
}

export default function SubmitPanel({ submitted, onSubmitted, onTrack, onReset }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e?.preventDefault();
    if (loading || !message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const ticket = await createTicket(message.trim());
      onSubmitted(ticket);
      setMessage('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit(e);
  };

  if (submitted) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }} role="status">
          Request received. Keep ticket number <strong>#{submitted.id}</strong> to check progress later.
        </Alert>
        <TicketStub ticket={submitted} animate />
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={onTrack}>
            Track this ticket
          </Button>
          <Button variant="outlined" onClick={onReset}>
            Submit another request
          </Button>
        </Box>
      </Box>
    );
  }

  const nearLimit = message.length > MAX_MESSAGE_LENGTH * 0.9;

  return (
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
        Describe your issue
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Include what happened and when. Do not include passwords or card numbers.
      </Typography>

      <TextField
        multiline
        minRows={6}
        maxRows={14}
        fullWidth
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={loading}
        placeholder="For example: I was charged twice for order 4821 on Monday."
        slotProps={{
          htmlInput: { maxLength: MAX_MESSAGE_LENGTH, 'aria-label': 'Describe your issue' },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {EXAMPLES.map((example) => (
            <Chip
              key={example.label}
              size="small"
              variant="outlined"
              label={example.label}
              disabled={loading}
              onClick={() => setMessage(example.text)}
            />
          ))}
        </Box>
        <Typography
          variant="caption"
          color={nearLimit ? 'error' : 'text.secondary'}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {message.length}/{MAX_MESSAGE_LENGTH}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} role="alert">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !message.trim()}
        sx={{ mt: 3, py: 1.5 }}
      >
        {loading ? (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={20} color="inherit" />
            Reading your message
          </Box>
        ) : (
          'Send request'
        )}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
        Tip: press Ctrl + Enter to send.
      </Typography>
    </Box>
  );
}