import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { PlannerState } from "./planner.reducer";

export const selectPlanner = (state: AppState) => state.planner
export const selectAllEvents = createSelector(
    selectPlanner,
    (state: PlannerState) => state.events
)
export const selectLoadStatus = createSelector(
    selectPlanner,
    (state: PlannerState) => state.loadStatus
)
export const selectAllOutstandingTasks = createSelector(
    selectPlanner,
    (state: PlannerState) => state.outstandingTasks
)
export const selectCalendarMode  = createSelector(
    selectPlanner,
    (state: PlannerState) => state.calendarMode
)
export const selectAuthStatus  = createSelector(
    selectPlanner,
    (state: PlannerState) => state.authStatus
)
export const selectEmail  = createSelector(
    selectPlanner,
    (state: PlannerState) => state.email
)