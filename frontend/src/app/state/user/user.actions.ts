import { createAction, props } from "@ngrx/store";
import { UserDetails } from "../../model";

export const addWorkspace = createAction(
    '[User Page] Add Workspace',
    props<{ workspace: string }>()
)

export const changeStatus = createAction(
    '[User Page] Change Login Status',
    props<{ currUser: UserDetails }>()
)

export const resetState = createAction(
    '[User Page] Reset State',
)

// this action is triggered by change status
export const loadWorkspaces = createAction(
    '[User Page] Load Workspaces',
    props<{ workspaces: string[] }>()
)