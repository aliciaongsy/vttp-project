import { createAction, props } from "@ngrx/store";
import { FocusSession } from "../../model";
export const incFocusDuration = createAction(
    '[Focus Page] Increase Focus Duration',
    props<{ duration: number }>()
)

export const persistData = createAction(
    '[Focus Page] Persist Data To Backend',
    props<{ id: string, workspace: string }>()
)

export const loadAllSessions = createAction(
    '[Focus Page] Load Sessions',
    props<{ id: string, workspace: string }>()
)

export const loadAllSessionsFromService = createAction(
    '[Focus Page] Load Sessions From Service',
    props<{ sessions: FocusSession[] }>()
)

export const resetState = createAction(
    '[Focus Page] Reset State',
    props<{ duration: number }>()
)

export const resetFocusState = createAction(
    '[Focus Page] Reset Focus State',
)
