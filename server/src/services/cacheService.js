'use strict';

// Per-user dashboard cache
const dashboardCache = new Map();

// Global leaderboard cache
let leaderboardCache = null;
let leaderboardCacheExpiry = 0;

function getDashboardCache(userId) {
  const entry = dashboardCache.get(userId);
  if (entry) {
    // Cache dashboard queries for up to 5 minutes by default, but explicitly invalidated on data changes
    if (Date.now() < entry.expiry) {
      return entry.data;
    }
    dashboardCache.delete(userId);
  }
  return null;
}

function setDashboardCache(userId, data) {
  dashboardCache.set(userId, {
    data,
    expiry: Date.now() + 5 * 60 * 1000 // 5 minutes TTL fallback
  });
}

function invalidateDashboardCache(userId) {
  dashboardCache.delete(userId);
}

function getLeaderboardCache() {
  if (leaderboardCache && Date.now() < leaderboardCacheExpiry) {
    return leaderboardCache;
  }
  leaderboardCache = null;
  return null;
}

function setLeaderboardCache(data) {
  leaderboardCache = data;
  leaderboardCacheExpiry = Date.now() + 30000; // Cache for 30 seconds
}

function invalidateLeaderboardCache() {
  leaderboardCache = null;
  leaderboardCacheExpiry = 0;
}

module.exports = {
  getDashboardCache,
  setDashboardCache,
  invalidateDashboardCache,
  getLeaderboardCache,
  setLeaderboardCache,
  invalidateLeaderboardCache,
};
