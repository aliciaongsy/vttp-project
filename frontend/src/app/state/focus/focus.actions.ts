import { createAction, props } from "@ngrx/store";
export const incFocusDuration = createAction(
    '[Focus Page] Increase Focus Duration',
    props<{ duration: number }>()
)

export const persistData = createAction(
    '[Focus Page] Persist Data To Backend',
    props<{ id: string, workspace: string}>()
)

export const resetState = createAction(
    '[Focus Page] Reset State',
    props<{ duration: number }>()
)
