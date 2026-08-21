const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const MANAGER_ID = 7487347;

export const fplService = {
  // Bootstrap & static data
  getBootstrap: () => fetchJson('/api/fpl/bootstrap'),
  getPlayers: () => fetchJson('/api/fpl/players'),
  getTeams: () => fetchJson('/api/fpl/teams'),
  getGameweeks: () => fetchJson('/api/fpl/gameweeks'),
  getCurrentGameweek: () => fetchJson('/api/fpl/current-gameweek'),
  
  // Manager data
  getTeam: (id = MANAGER_ID) => fetchJson(`/api/fpl/team/${id}`),
  getTeamHistory: (id = MANAGER_ID) => fetchJson(`/api/fpl/team/${id}/history`),
  getTeamPicks: (gw, id = MANAGER_ID) => fetchJson(`/api/fpl/team/${id}/picks/${gw}`),
  getTeamTransfers: (id = MANAGER_ID) => fetchJson(`/api/fpl/team/${id}/transfers`),
  getMyTeam: (id = MANAGER_ID) => fetchJson(`/api/fpl/my-team/${id}`),
  
  // Live data
  getLiveEvent: (gw) => fetchJson(`/api/fpl/live/${gw}`),
  getFixtures: (event) => fetchJson(`/api/fpl/fixtures${event ? `?event=${event}` : ''}`),
  getEventStatus: () => fetchJson('/api/fpl/event-status'),
  
  // Player data
  getPlayer: (playerId) => fetchJson(`/api/fpl/player/${playerId}`),
  
  // League data
  getLeagueStandings: (leagueId, page = 1) => fetchJson(`/api/fpl/leagues/${leagueId}/standings?page=${page}`),
  getDreamTeam: (gw) => fetchJson(`/api/fpl/dream-team/${gw}`),
  
  // AI recommendations
  getCaptainPick: (id = MANAGER_ID) => fetchJson(`/api/fpl/ai/captain/${id}`),
  getTransferSuggestions: (id = MANAGER_ID) => fetchJson(`/api/fpl/ai/transfers/${id}`),
  getLineupOptimization: (id = MANAGER_ID) => fetchJson(`/api/fpl/ai/lineup/${id}`),
  getAnalysis: (id = MANAGER_ID) => fetchJson(`/api/fpl/ai/analyze/${id}`),
  
  // News
  getNews: () => fetchJson('/api/fpl/news'),
  refreshNews: () => fetchJson('/api/fpl/news/refresh', { method: 'POST' }),
  
  // Analysis history
  getAnalysisHistory: (id = MANAGER_ID) => fetchJson(`/api/fpl/analysis/${id}`),
  getAnalysisByGw: (gw, id = MANAGER_ID) => fetchJson(`/api/fpl/analysis/${id}/${gw}`),
  
  // Transfer plans
  getTransferPlans: (id = MANAGER_ID) => fetchJson(`/api/fpl/transfer-plans/${id}`),
  createTransferPlan: (plan) => fetchJson('/api/fpl/transfer-plans', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(plan) }),
  deleteTransferPlan: (planId) => fetchJson(`/api/fpl/transfer-plans/${planId}`, { method: 'DELETE' }),
  
  // Player notes
  getPlayerNotes: () => fetchJson('/api/fpl/player-notes'),
  createPlayerNote: (note) => fetchJson('/api/fpl/player-notes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(note) }),
  deletePlayerNote: (noteId) => fetchJson(`/api/fpl/player-notes/${noteId}`, { method: 'DELETE' }),
};

async function fetchJson(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`FPL API error: ${path}`, err);
    return null;
  }
}
