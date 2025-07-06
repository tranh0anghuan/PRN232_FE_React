export const QUIT_PLAN_API_ROUTES = {
  AUTO_GENERATE: "/QuitPlans/generate",
  GET_BY_USERNAME: "/QuitPlans/user",
  PHASES: {
    GET_BY_PLAN_ID: "/quit-plans/:id/phases",
    START_PHASE: "/quit-plans/:planId/phases/:phaseId/start",
    COMPLETE_PHASE: "/quit-plans/:planId/phases/:phaseId/complete",
  },
}
