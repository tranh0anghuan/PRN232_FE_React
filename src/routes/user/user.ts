export const USER_ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  USER_SESSION: "/user-session",
  SESSION_MANAGEMENT: "/session-management",
  COACH_PROFILE: "/coach-profile",
  SESSION_DETAIL: "/session-detail/:id",
  COACH_STATISTIC: "/coach-statistic",
  SMOKE_STATUS: "/smoke-status",
  QUIT_PLANS: "/quit-plans",
  QUIT_PLAN_PHASES: "/quit-plans/:id/phases",
  SMOKE_STATUS_DETAIL: "/smoke-status/detail",
  PROGRESS_TRACKING: {
    DASHBOARD:"/progress-tracking/dashboard",
    DAILY_LOG:"/progress-tracking/daily-log",
    HISTORY:"/progress-tracking/history",
    IMPROVEMENTS:"/progress-tracking/improvements",
  },
  COMMUNITY:{
    MAIN:"/community",
    DETAIL:"/community/:id",
  },
  ACHIEVEMENT:"/achievements",
  NOTIFICATION:{
    MAIN:"/notification",
    SETTINGS:"/notification/settings",
  },
  BLOG_POST:"/blog/:id",
  PAYMENT:{
    HANDLER: "/payment/handler"
  },
};
