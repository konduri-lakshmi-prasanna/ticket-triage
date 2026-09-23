import { createTheme } from '@mui/material/styles';

const display = "'Bricolage Grotesque', 'Figtree', system-ui, sans-serif";

const theme = createTheme({
  palette: {
    primary: { main: '#0b5c63', dark: '#084349', contrastText: '#ffffff' },
    error: { main: '#b42318' },
    warning: { main: '#b45309' },
    success: { main: '#027a48' },
    text: { primary: '#172026', secondary: '#5b6770' },
    background: { default: '#f4f6f5', paper: '#ffffff' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Figtree', system-ui, 'Segoe UI', sans-serif",
    h1: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: display, fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: display, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, padding: '10px 20px' } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#fff' } },
    },
    MuiTab: {
      styleOverrides: { root: { fontSize: '0.95rem', minHeight: 56 } },
    },
  },
});

export default theme;