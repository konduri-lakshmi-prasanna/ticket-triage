import { Box, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { STATUS_STEPS } from '../lib';

export default function StatusTimeline({ status }) {
  const current = Math.max(
    STATUS_STEPS.findIndex((s) => s.key === status),
    0,
  );
  const done = status === 'RESOLVED';

  return (
    <Box>
      <Box
        component="ol"
        aria-label="Ticket progress"
        sx={{ display: 'flex', listStyle: 'none', p: 0, m: 0 }}
      >
        {STATUS_STEPS.map((step, i) => {
          const complete = i < current || done;
          const active = i === current && !done;
          return (
            <Box
              component="li"
              key={step.key}
              aria-current={active ? 'step' : undefined}
              sx={{ flex: 1, position: 'relative', textAlign: 'center' }}
            >
              {i > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 13,
                    right: '50%',
                    width: '100%',
                    height: 2,
                    bgcolor: i <= current || done ? 'primary.main' : 'divider',
                  }}
                />
              )}
              <Box
                sx={{
                  position: 'relative',
                  mx: 'auto',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: complete ? 'primary.main' : '#fff',
                  color: '#fff',
                  border: '2px solid',
                  borderColor: complete || active ? 'primary.main' : 'divider',
                  boxShadow: active ? '0 0 0 5px rgba(11,92,99,0.15)' : 'none',
                }}
              >
                {complete ? (
                  <CheckRoundedIcon sx={{ fontSize: 18 }} />
                ) : active ? (
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                ) : null}
              </Box>
              <Typography
                variant="body2"
                sx={{ mt: 1, fontWeight: active || (done && i === 2) ? 600 : 500 }}
                color={complete || active ? 'text.primary' : 'text.secondary'}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }} aria-live="polite">
        {STATUS_STEPS[current].note}
      </Typography>
    </Box>
  );
}