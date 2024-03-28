import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { state } from "@angular/animations";

export const selectFocus = (state: AppState) => state.focus
export const selectCurrentDate = createSelector(
    selectFocus,
    (state) => state.currentDate
)
export const selectSessions = createSelector(
    selectFocus,
    (state) => state.session
)
export const selectDuration = createSelector(
    selectFocus,
    (state) => state.todayFocusDuration
)