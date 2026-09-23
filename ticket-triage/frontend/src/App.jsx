import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  CssBaseline,
} from '@mui/material';

function App() {
  const [message, setMessage] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const response = await axios.post('http://localhost:8080/api/tickets', {
        message: message,
      });
      setTicket(response.data);
      setMessage('');
    } catch (err) {
  console.log("ERROR:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  setError('Something went wrong. Please try again.');
}finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Submit a Support Ticket
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Describe your issue"
            multiline
            rows={4}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !message.trim()}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
          </Button>
        </form>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {ticket && (
          <Card sx={{ mt: 3 }} variant="outlined">
            <CardContent>
              <Typography variant="h6">Ticket #{ticket.id}</Typography>
              <Box sx={{ display: 'flex', gap: 1, my: 1, flexWrap: 'wrap' }}>
                <Chip label={ticket.category} color="primary" />
                <Chip label={ticket.department} />
                <Chip
                  label={ticket.priority}
                  color={ticket.priority === 'HIGH' ? 'error' : 'default'}
                />
                <Chip label={ticket.sentiment} />
                <Chip label={ticket.status} variant="outlined" />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {ticket.suggestedResponse}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
}

export default App;