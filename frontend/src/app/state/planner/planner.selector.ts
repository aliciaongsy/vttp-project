import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { PlannerState } from "./planner.reducer";

export const selectPlanner = (state: AppState) => state.planner
export const selectAllEvents = createSelector(
    selectPlanner,
    (state: PlannerState) => state.events
)