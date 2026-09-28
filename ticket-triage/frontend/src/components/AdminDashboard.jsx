import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

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
  const [resolvingIncidentId, setResolvingIncidentId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState('');

  // Search, filter and sorting state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

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

      if (
        selectedTicket &&
        selectedTicket.id === updatedTicket.id
      ) {
        setSelectedTicket(updatedTicket);
      }
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

  const resolveIncident = async (incidentId) => {
    try {
      setResolvingIncidentId(incidentId);
      setError('');

      const response = await fetch(
        `${INCIDENT_API_URL}/${incidentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'RESOLVED',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Unable to resolve incident');
      }

      const updatedIncident = await response.json();

      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.id === updatedIncident.id
            ? updatedIncident
            : incident
        )
      );
    } catch (err) {
      console.error(err);
      setError('Could not resolve the incident.');
    } finally {
      setResolvingIncidentId(null);
    }
  };

  const totalTickets = tickets.length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === 'HIGH'
  ).length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'OPEN'
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'IN_PROGRESS'
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === 'RESOLVED'
  ).length;

  const activeIncidents = incidents.filter(
    (incident) => incident.status === 'ACTIVE'
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === 'RESOLVED'
  ).length;

  const categories = [
    ...new Set(
      tickets
        .map((ticket) => ticket.category)
        .filter(Boolean)
    ),
  ].sort();

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

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'NEWEST') {
      return b.id - a.id;
    }

    if (sortBy === 'OLDEST') {
      return a.id - b.id;
    }

    const priorityOrder = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    if (sortBy === 'HIGH_TO_LOW') {
      return (
        (priorityOrder[b.priority] || 0) -
        (priorityOrder[a.priority] || 0)
      );
    }

    if (sortBy === 'LOW_TO_HIGH') {
      return (
        (priorityOrder[a.priority] || 0) -
        (priorityOrder[b.priority] || 0)
      );
    }

    return 0;
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

        {/* Error */}
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

        {/* Dashboard summary */}
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

        {/* Additional status summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          <MiniSummaryCard
            label="In progress"
            value={inProgressTickets}
          />

          <MiniSummaryCard
            label="Resolved tickets"
            value={resolvedTickets}
          />

          <MiniSummaryCard
            label="Resolved incidents"
            value={resolvedIncidents}
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

          {/* Search + filters + sorting */}
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
                  sm: 'repeat(2, 1fr)',
                  md: 'minmax(240px, 2fr) repeat(4, minmax(125px, 1fr)) auto',
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
                  <MenuItem value="ALL">
                    All statuses
                  </MenuItem>
                  <MenuItem value="OPEN">
                    Open
                  </MenuItem>
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
                  <MenuItem value="ALL">
                    All priorities
                  </MenuItem>
                  <MenuItem value="HIGH">
                    High
                  </MenuItem>
                  <MenuItem value="MEDIUM">
                    Medium
                  </MenuItem>
                  <MenuItem value="LOW">
                    Low
                  </MenuItem>
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
                  <MenuItem value="ALL">
                    All categories
                  </MenuItem>

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

              <FormControl
                size="small"
                sx={{
                  minWidth: 180,
                }}
              >
                <InputLabel>Sort by</InputLabel>

                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                >
                  <MenuItem value="NEWEST">
                    Newest first
                  </MenuItem>
                  <MenuItem value="OLDEST">
                    Oldest first
                  </MenuItem>
                  <MenuItem value="HIGH_TO_LOW">
                    Priority: High to Low
                  </MenuItem>
                  <MenuItem value="LOW_TO_HIGH">
                    Priority: Low to High
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="text"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Result count */}
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
          ) : sortedTickets.length === 0 ? (
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
              <Box sx={{ minWidth: 930 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      '60px minmax(230px, 1fr) 110px 100px 120px 230px',
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
                  <Box sx={{ textAlign: 'center' }}>
  <TableHeader>Actions</TableHeader>
</Box>
                </Box>

                {sortedTickets.map((ticket) => (
                  <Box
                    key={ticket.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '60px minmax(230px, 1fr) 110px 100px 120px 230px',
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

                    <Stack
  direction="row"
  spacing={1}
  flexWrap="wrap"
  justifyContent="center"
  alignItems="center"
>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          <VisibilityOutlinedIcon />
                        }
                        onClick={() =>
                          setSelectedTicket(ticket)
                        }
                      >
                        View
                      </Button>

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
                  Incidents
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
                      color={
                        incident.status === 'RESOLVED'
                          ? 'default'
                          : 'success'
                      }
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

                    {incident.ticketIds && (
                      <Chip
                        label={`Tickets: ${incident.ticketIds}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {incident.status === 'ACTIVE' && (
                    <Button
                      sx={{ mt: 2 }}
                      size="small"
                      variant="outlined"
                      startIcon={
                        <CheckCircleOutlineRoundedIcon />
                      }
                      onClick={() =>
                        resolveIncident(incident.id)
                      }
                      disabled={
                        resolvingIncidentId === incident.id
                      }
                    >
                      {resolvingIncidentId === incident.id
                        ? 'Resolving...'
                        : 'Resolve incident'}
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Ticket details dialog */}
      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        fullWidth
        maxWidth="md"
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              Ticket #{selectedTicket.id}
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Customer message
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 17,
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedTicket.message}
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <DetailItem
                    label="Category"
                    value={selectedTicket.category}
                  />

                  <DetailItem
                    label="Department"
                    value={selectedTicket.department}
                  />

                  <DetailItem
                    label="Priority"
                    value={selectedTicket.priority}
                  />

                  <DetailItem
                    label="Sentiment"
                    value={selectedTicket.sentiment}
                  />

                  <DetailItem
                    label="Status"
                    value={getStatusLabel(
                      selectedTicket.status
                    )}
                  />

                  <DetailItem
                    label="Created"
                    value={formatDate(
                      selectedTicket.createdAt
                    )}
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Suggested response
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: '#f8faf9',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                      }}
                    >
                      {selectedTicket.suggestedResponse ||
                        'No suggested response available.'}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </Button>

              {selectedTicket.status === 'OPEN' && (
                <Button
                  variant="outlined"
                  onClick={() =>
                    updateStatus(
                      selectedTicket.id,
                      'IN_PROGRESS'
                    )
                  }
                  disabled={
                    updatingId === selectedTicket.id
                  }
                >
                  Start ticket
                </Button>
              )}

              {selectedTicket.status === 'IN_PROGRESS' && (
                <Button
                  variant="contained"
                  onClick={() =>
                    updateStatus(
                      selectedTicket.id,
                      'RESOLVED'
                    )
                  }
                  disabled={
                    updatingId === selectedTicket.id
                  }
                >
                  Resolve ticket
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
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

function MiniSummaryCard({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 2.5,
        py: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontWeight: 600,
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
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