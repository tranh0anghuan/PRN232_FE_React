export const USER_ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    COACH_PROFILE: "/coach-profile",
    SESSIONS: "/sessions",
    ADMIN: "/admin",
  }
  
  export const API_ENDPOINTS = {
    COACH_PROFILES: {
      CREATE: "/CoachProfiles/create",
      UPDATE: "/CoachProfiles/update",
      VERIFY: "/CoachProfiles/verify",
      GET_BY_USERNAME: "/CoachProfiles/get-by-username",
      GET_ALL: "/CoachProfiles/get-all",
      DELETE: "/CoachProfiles/delete",
    },
    COACH_SESSIONS: {
      CREATE: "/CoachSessions/create",
      UPDATE: "/CoachSessions/update",
      DELETE: "/CoachSessions/delete",
      JOIN: "/CoachSessions/join",
      GET_ALL: "/CoachSessions/get-all",
      GET_BY_ID: "/CoachSessions/get-by-id",
    },
    RATINGS: {
      CREATE: "/Ratings/create",
      GET_BY_ID: "/Ratings/get-by-id",
    },
    AUTH: {
      LOGIN: "/Authen/login",
      REGISTER: "/Authen/register",
      REFRESH_TOKEN: "/Authen/refresh-token",
    },
  }
  