export const PROGRESS_TRACKING_API_ROUTES = {
  // Entry CRUD operations
  ENTRY: {
    CREATE: "/ProgressTracking",
    GET_BY_ID: "/ProgressTracking/:id",
    UPDATE: "/ProgressTracking/:id",
    DELETE: "/ProgressTracking/:id",
  },

  // User-specific operations
  USER: {
    GET_ENTRIES: "/ProgressTracking/user/:username",
    GET_SUMMARY: "/ProgressTracking/user/:username/summary",
    CHECK_DATE_ENTRY: "/ProgressTracking/user/:username/check-date",
  },

  // Health improvements operations
  IMPROVEMENTS: {
    GET_ALL: "/ProgressTracking/user/:username/improvements",
    GET_UNACKNOWLEDGED:
      "/ProgressTracking/user/:username/improvements/unacknowledged",
    ACKNOWLEDGE:
      "/ProgressTracking/user/:username/improvements/:improvementId/acknowledge",
  },
};
