import { createAction, props } from "@ngrx/store";
import { FocusSession } from "../../model";

export const setCurrentDate = createAction(
    '[Focus Page] Set Current Date'
)

export const incFocusDuration = createAction(
    '[Focus Page] Increase Focus Duration',
    props<{ duration: number }>()
)

export const loadAllSessions = createAction(
    '[Focus Page] Load Sessions',
    props<{ id: string }>()
)

export const loadAllSessionsFromService = createAction(
    '[Focus Page] Load Sessions From Service',
    props<{ sessions: FocusSession[] }>()
)

export const resetFocusState = createAction(
    '[Focus Page] Reset Focus State',
)
