import { Box, Typography } from '@mui/material';
import { PRIORITY, formatDate } from '../lib';
import StatusTimeline from './StatusTimeline';

const notch = {
  content: '""',
  position: 'absolute',
  bottom: -14,
  width: 28,
  height: 28,
  borderRadius: '50%',
  bgcolor: 'background.default',
  zIndex: 1,
};

function Row({ label, children }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.25 }}>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600, textAlign: 'right' }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function TicketStub({ ticket, animate = false }) {
  const priority = PRIORITY[ticket.priority] ?? { label: ticket.priority, color: '#5b6770' };

  return (
    <Box
      className={animate ? 'stub-reveal' : undefined}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgba(23,32,38,0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Stub header: the ticket number is the thing customers need to keep */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'primary.main',
          color: '#fff',
          px: { xs: 3, sm: 4 },
          pt: 3,
          pb: 3.5,
          '&::before': { ...notch, left: -14 },
          '&::after': { ...notch, right: -14 },
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Your ticket number
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: 44, sm: 56 }, lineHeight: 1.05, mt: 0.5 }}>
          #{ticket.id}
        </Typography>
        {ticket.createdAt && (
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
            Submitted {formatDate(ticket.createdAt)}
          </Typography>
        )}
      </Box>

      <Box sx={{ borderTop: '2px dashed', borderColor: 'divider' }} />

      <Box sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
        <Box component="dl" sx={{ m: 0, '& > div + div': { borderTop: '1px solid', borderColor: 'divider' } }}>
          <div>
            <Row label="Sent to">{ticket.department} team</Row>
          </div>
          <div>
            <Row label="Topic">{ticket.category}</Row>
          </div>
          <div>
            <Row label="Priority">
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <Box component="span" sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: priority.color }} />
                {priority.label}
              </Box>
            </Row>
          </div>
        </Box>

        <Box sx={{ mt: 3, p: 2.5, bgcolor: 'var(--teal-tint)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Our reply
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
            {ticket.suggestedResponse}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Your message
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, overflowWrap: 'anywhere' }}
          >
            {ticket.message}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <StatusTimeline status={ticket.status} />
        </Box>
      </Box>
    </Box>
  );
}