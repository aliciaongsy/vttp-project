import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { FocusState } from "./focus.reducer";

export const selectFocus = (state: AppState) => state.focus
export const selectCurrentDate = createSelector(
    selectFocus,
    (state: FocusState) => state.currentDate
)
export const selectDuration = createSelector(
    selectFocus,
    (state: FocusState) => state.todayFocusDuration
)
export const selectSessions = createSelector(
    selectFocus,
    (state: FocusState) => state.sessions
)
export const selectLoadStatus = createSelector(
    selectFocus,
    (state: FocusState) => state.loadStatus
)