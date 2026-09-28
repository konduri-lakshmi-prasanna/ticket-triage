import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import {
  API_URL,
  PRIORITY,
  formatDate,
} from '../lib';

const INCIDENT_API_URL = 'http://localhost:8080/api/incidents';

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [detectingIncidents, setDetectingIncidents] = useState(false);
  const [error, setError] = useState('');

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [ticketsResponse, incidentsResponse] = await Promise.all([
        fetch(API_URL),
        fetch(INCIDENT_API_URL),
      ]);

      if (!ticketsResponse.ok) {
        throw new Error('Unable to load tickets');
      }

      if (!incidentsResponse.ok) {
        throw new Error('Unable to load incidents');
      }

      const ticketsData = await ticketsResponse.json();
      const incidentsData = await incidentsResponse.json();

      setTickets(ticketsData);
      setIncidents(incidentsData);
    } catch (err) {
      console.error(err);
      setError(
        'Could not load dashboard data. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const updateStatus = async (ticketId, status) => {
    try {
      setUpdatingId(ticketId);
      setError('');

      const response = await fetch(`${API_URL}/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Unable to update ticket');
      }

      const updatedTicket = await response.json();

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
    } catch (err) {
      console.error(err);
      setError('Could not update the ticket status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const detectIncidents = async () => {
    try {
      setDetectingIncidents(true);
      setError('');

      const response = await fetch(`${INCIDENT_API_URL}/detect`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Unable to detect incidents');
      }

      const detectedIncidents = await response.json();

      setIncidents(detectedIncidents);
    } catch (err) {
      console.error(err);
      setError('Could not detect incidents. Please try again.');
    } finally {
      setDetectingIncidents(false);
    }
  };

  const totalTickets = tickets.length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === 'HIGH'
  ).length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'OPEN'
  ).length;

  const activeIncidents = incidents.filter(
    (incident) => incident.status === 'ACTIVE'
  ).length;

  /*
   * Create the category list dynamically from the tickets.
   */
  const categories = [
    ...new Set(
      tickets
        .map((ticket) => ticket.category)
        .filter(Boolean)
    ),
  ].sort();

  /*
   * Apply all search/filter conditions.
   */
  const filteredTickets = tickets.filter((ticket) => {
    const search = searchText.trim().toLowerCase();

    const matchesSearch =
      search === '' ||
      String(ticket.id).includes(search) ||
      (ticket.message || '').toLowerCase().includes(search) ||
      (ticket.category || '').toLowerCase().includes(search) ||
      (ticket.department || '').toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'ALL' ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'ALL' ||
      ticket.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === 'ALL' ||
      ticket.category === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return PRIORITY.HIGH.color;
    if (priority === 'MEDIUM') return PRIORITY.MEDIUM.color;
    return PRIORITY.LOW.color;
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PROGRESS') return 'In progress';
    if (status === 'RESOLVED') return 'Resolved';
    return 'Open';
  };

  const getStatusColor = (status) => {
    if (status === 'RESOLVED') return 'success';
    if (status === 'IN_PROGRESS') return 'primary';
    return 'warning';
  };

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setCategoryFilter('ALL');
  };

  const hasActiveFilters =
    searchText !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          width: 'min(1200px, calc(100% - 40px))',
          mx: 'auto',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            flexWrap: 'wrap',
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 32, md: 42 },
                lineHeight: 1.1,
              }}
            >
              Admin dashboard
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                fontSize: 16,
              }}
            >
              Monitor tickets, priorities and active incidents.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              loading ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshRoundedIcon />
              )
            }
            onClick={loadDashboard}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Error message */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              border: '1px solid',
              borderColor: 'error.main',
              color: 'error.main',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">
              {error}
            </Typography>
          </Paper>
        )}

        {/* Summary cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          <SummaryCard
            icon={<ConfirmationNumberOutlinedIcon />}
            label="Total tickets"
            value={totalTickets}
          />

          <SummaryCard
            icon={<PlayArrowRoundedIcon />}
            label="Open tickets"
            value={openTickets}
          />

          <SummaryCard
            icon={<PriorityHighRoundedIcon />}
            label="High priority"
            value={highPriorityTickets}
          />

          <SummaryCard
            icon={<ReportProblemOutlinedIcon />}
            label="Active incidents"
            value={activeIncidents}
          />
        </Box>

        {/* Tickets */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 4,
          }}
        >
          {/* Tickets heading */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h2" sx={{ fontSize: 24 }}>
              Recent tickets
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Review incoming support requests and update their status.
            </Typography>
          </Box>

          {/* Search and filters */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              bgcolor: '#fafcfb',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '2fr 1fr 1fr 1fr auto',
                },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search tickets..."
                InputProps={{
                  startAdornment: (
                    <SearchRoundedIcon
                      sx={{
                        color: 'text.secondary',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />

              <FormControl size="small">
                <InputLabel>Status</InputLabel>

                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <MenuItem value="ALL">All statuses</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">
                    In progress
                  </MenuItem>
                  <MenuItem value="RESOLVED">
                    Resolved
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Priority</InputLabel>

                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(event) =>
                    setPriorityFilter(event.target.value)
                  }
                >
                  <MenuItem value="ALL">All priorities</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small">
                <InputLabel>Category</InputLabel>

                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                >
                  <MenuItem value="ALL">All categories</MenuItem>

                  {categories.map((category) => (
                    <MenuItem
                      key={category}
                      value={category}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="text"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Filter result count */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Showing {filteredTickets.length} of {tickets.length}{' '}
              tickets
            </Typography>
          </Box>

          {loading ? (
            <Box
              sx={{
                py: 8,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : filteredTickets.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                No tickets found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Try changing your search or filters.
              </Typography>

              {hasActiveFilters && (
                <Button
                  sx={{ mt: 2 }}
                  variant="outlined"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 850 }}>
                {/* Table header */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      '70px minmax(260px, 1fr) 120px 120px 130px 180px',
                    gap: 2,
                    px: 3,
                    py: 1.5,
                    bgcolor: '#f8faf9',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Ticket</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Priority</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </Box>

                {filteredTickets.map((ticket) => (
                  <Box
                    key={ticket.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '70px minmax(260px, 1fr) 120px 120px 130px 180px',
                      gap: 2,
                      alignItems: 'center',
                      px: 3,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                      }}
                    >
                      #{ticket.id}
                    </Typography>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                        }}
                      >
                        {ticket.message}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDate(ticket.createdAt)}
                      </Typography>
                    </Box>

                    <Typography variant="body2">
                      {ticket.category || '—'}
                    </Typography>

                    <Chip
                      label={ticket.priority || 'LOW'}
                      size="small"
                      sx={{
                        width: 'fit-content',
                        fontWeight: 600,
                        color: getPriorityColor(
                          ticket.priority
                        ),
                        bgcolor: `${getPriorityColor(
                          ticket.priority
                        )}14`,
                      }}
                    />

                    <Chip
                      label={getStatusLabel(ticket.status)}
                      size="small"
                      color={getStatusColor(ticket.status)}
                      variant="outlined"
                      sx={{
                        width: 'fit-content',
                        fontWeight: 600,
                      }}
                    />

                    <Stack direction="row" spacing={1}>
                      {ticket.status === 'OPEN' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            updateStatus(
                              ticket.id,
                              'IN_PROGRESS'
                            )
                          }
                          disabled={
                            updatingId === ticket.id
                          }
                        >
                          Start
                        </Button>
                      )}

                      {ticket.status === 'IN_PROGRESS' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={
                            <CheckCircleOutlineRoundedIcon />
                          }
                          onClick={() =>
                            updateStatus(
                              ticket.id,
                              'RESOLVED'
                            )
                          }
                          disabled={
                            updatingId === ticket.id
                          }
                        >
                          Resolve
                        </Button>
                      )}

                      {ticket.status === 'RESOLVED' && (
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontWeight: 600,
                          }}
                        >
                          <CheckCircleOutlineRoundedIcon fontSize="small" />
                          Completed
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Incidents */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            overflow: 'hidden',
          }}
        >
          {/* Incident heading */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: {
                  xs: 'flex-start',
                  sm: 'center',
                },
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography
                  variant="h2"
                  sx={{ fontSize: 24 }}
                >
                  Active incidents
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  AI-detected groups of tickets that appear to
                  have the same underlying issue.
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={detectIncidents}
                disabled={detectingIncidents}
                startIcon={
                  detectingIncidents ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <ReportProblemOutlinedIcon />
                  )
                }
              >
                {detectingIncidents
                  ? 'Detecting...'
                  : 'Detect incidents'}
              </Button>
            </Box>
          </Box>

          {/* Incident list */}
          {incidents.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <Typography color="text.secondary">
                No incidents detected yet.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0}>
              {incidents.map((incident) => (
                <Box
                  key={incident.id}
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 17,
                        }}
                      >
                        {incident.title ||
                          'Untitled incident'}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          maxWidth: 750,
                        }}
                      >
                        {incident.description ||
                          'No description available.'}
                      </Typography>
                    </Box>

                    <Chip
                      label={incident.status || 'ACTIVE'}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mt: 2,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={
                        incident.category || 'Unknown'
                      }
                      size="small"
                    />

                    <Chip
                      label={`${incident.ticketCount || 0} tickets`}
                      size="small"
                    />

                    <Chip
                      label={incident.priority || 'LOW'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: getPriorityColor(
                          incident.priority
                        ),
                        bgcolor: `${getPriorityColor(
                          incident.priority
                        )}14`,
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: 'rgba(11, 92, 99, 0.08)',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          mb: 2,
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="h2"
        sx={{
          mt: 0.5,
          fontSize: 30,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function TableHeader({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </Typography>
  );
}

export default AdminDashboard;