import { useState } from 'react';
import { Box, Container, CssBaseline, Tab, Tabs, ThemeProvider, Typography } from '@mui/material';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import theme from './theme';
import { loadRecentIds, saveRecentId } from './lib';
import SubmitPanel from './components/SubmitPanel';
import TrackPanel from './components/TrackPanel';

const HOW_IT_WORKS = [
  { title: 'You describe the problem', text: 'Write it in your own words, in any language.' },
  { title: 'We route it', text: 'Your request goes straight to the team that handles it.' },
  { title: 'You follow progress', text: 'Use your ticket number to see the status any time.' },
];

function App() {
  const [tab, setTab] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [tracked, setTracked] = useState(null);
  const [recentIds, setRecentIds] = useState(loadRecentIds);

  const handleSubmitted = (ticket) => {
    setSubmitted(ticket);
    setRecentIds(saveRecentId(ticket.id));
  };

  const handleTrack = () => {
    setTracked(submitted);
    setTab(1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <SupportAgentRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="h3" sx={{ fontSize: 20 }}>
              Support Center
            </Typography>
          </Box>

          <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Support sections">
            <Tab label="New request" />
            <Tab label="Track a ticket" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" component="main" sx={{ py: { xs: 4, md: 7 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 4, md: 8 },
            gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
            alignItems: 'start',
          }}
        >
          <Box component="section" sx={{ position: { md: 'sticky' }, top: 32 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.08 }}>
              {tab === 0 ? 'Tell us what went wrong.' : 'See where your request stands.'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17, lineHeight: 1.6, maxWidth: 460 }}>
              {tab === 0
                ? 'Send one message. We sort it, send it to the right team, and give you a ticket number to follow.'
                : 'Your ticket status updates on its own while this page is open.'}
            </Typography>

            <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 4, display: { xs: 'none', md: 'block' } }}>
              {HOW_IT_WORKS.map((step, i) => (
                <Box component="li" key={step.title} sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                  <Box
                    aria-hidden
                    sx={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'var(--teal-tint)',
                      color: 'primary.main',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{step.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Both panels stay mounted so a half-written message is not lost when switching tabs */}
          <Box hidden={tab !== 0}>
            <SubmitPanel
              submitted={submitted}
              onSubmitted={handleSubmitted}
              onTrack={handleTrack}
              onReset={() => setSubmitted(null)}
            />
          </Box>
          <Box hidden={tab !== 1}>
            <TrackPanel
              ticket={tracked}
              onTicketChange={setTracked}
              recentIds={recentIds}
              onRecentChange={setRecentIds}
            />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;