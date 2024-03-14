import { createReducer, on } from "@ngrx/store"
import { UserDetails } from "../../model"
import { addWorkspace, changeStatus, loadWorkspaces, resetState } from "./user.actions"

export interface UserState {
    login: boolean
    user: UserDetails
    workspaces: string[]
}

export const initialState: UserState = {
    login: false,
    user: {
        id: '',
        name: '',
        email: ''
    },
    workspaces: []
}

export const userReducer = createReducer(
    initialState,
    on(addWorkspace, (state, { workspace }) => ({
        ...state,
        workspaces: [...state.workspaces, workspace]
    })),
    on(changeStatus, (state, { currUser }) => ({
        login: !(state.login),
        user: currUser,
        workspaces: state.workspaces
    })),
    on(resetState, state => ({
        login: false,
        user: {
            id: '',
            name: '',
            email: ''
        },
        workspaces: []
    })),
    on(loadWorkspaces, (state, {workspaces}) => ({
        login: state.login,
        user: state.user,
        workspaces: workspaces
    }))
)