import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import { useAuth } from '../context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function errorText(err, portal, mode) {
  const status = err.response?.status;

  if (!err.response) return 'Cannot reach the server. Check your connection and try again.';
  if (status === 401) return 'Incorrect email or password.';
  if (status === 403 && portal === 'customer') {
    return 'This is an admin account. Use the Admin tab to sign in.';
  }
  if (status === 409) return 'An account with this email already exists. Sign in instead.';
  if (status === 400) {
    return mode === 'register'
      ? `Enter your name, a valid email, and a password of at least ${MIN_PASSWORD_LENGTH} characters.`
      : 'Enter your email and password.';
  }
  return 'Something went wrong on our side. Try again in a moment.';
}

export default function LoginPage() {
  const { login, adminLogin, register } = useAuth();

  const [portal, setPortal] = useState('customer'); // 'customer' | 'admin'
  const [mode, setMode] = useState('login'); // 'login' | 'register' (customers only)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = portal === 'admin';
  const isRegister = !isAdmin && mode === 'register';

  const switchPortal = (_, value) => {
    setPortal(value);
    setMode('login');
    setError(null);
    setPassword('');
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setPassword('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();

    if (isRegister && !name.trim()) {
      setError('Enter your name.');
      return;
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Enter a valid email address, for example name@example.com.');
      return;
    }
    if (isRegister && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // On success AuthContext stores the session and App switches views
      if (isAdmin) await adminLogin(cleanEmail, password);
      else if (isRegister) await register(name.trim(), cleanEmail, password);
      else await login(cleanEmail, password);
    } catch (err) {
      setError(errorText(err, portal, mode));
      setLoading(false);
    }
  };

  const heading = isAdmin
    ? 'Admin sign in'
    : isRegister
      ? 'Create your account'
      : 'Sign in to your account';

  const subheading = isAdmin
    ? 'For support staff. Admin accounts are set up by the system administrator.'
    : isRegister
      ? 'Your tickets are saved to your account, so only you can see them.'
      : 'Sign in to send a request and follow its progress.';

  const submitLabel = isAdmin ? 'Sign in as admin' : isRegister ? 'Create account' : 'Sign in';
  const busyLabel = isRegister ? 'Creating your account' : 'Signing you in';

  return (
    <>
      <Box
        component="header"
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
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
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.08 }}
            >
              {isAdmin ? 'Welcome back to the queue.' : 'Tell us what went wrong.'}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 2, fontSize: 17, lineHeight: 1.6, maxWidth: 460 }}
            >
              {isAdmin
                ? 'Review incoming tickets, update their status, and handle incidents.'
                : 'Send one message. We sort it, send it to the right team, and give you a ticket number to follow.'}
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={submit}
            noValidate
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 1px 2px rgba(23,32,38,0.06)',
            }}
          >
            <Tabs
              value={portal}
              onChange={switchPortal}
              aria-label="Account type"
              sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab label="Customer" value="customer" />
              <Tab label="Admin" value="admin" />
            </Tabs>

            <Typography variant="h2" sx={{ fontSize: 24, mb: 0.5 }}>
              {heading}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {subheading}
            </Typography>

            {isRegister && (
              <TextField
                label="Full name"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
                sx={{ mb: 2 }}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            )}

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              sx={{ mb: 2 }}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              helperText={isRegister ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
              slotProps={{
                htmlInput: { maxLength: 100 },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((shown) => !shown)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

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
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} color="inherit" />
                  {busyLabel}
                </Box>
              ) : (
                submitLabel
              )}
            </Button>

            {!isAdmin && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: 'center' }}>
                {isRegister ? 'Already have an account? ' : 'New here? '}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  sx={{ fontWeight: 600, verticalAlign: 'baseline' }}
                >
                  {isRegister ? 'Sign in' : 'Create an account'}
                </Link>
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}