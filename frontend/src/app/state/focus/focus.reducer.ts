import { createReducer } from "@ngrx/store"
import { FocusSession } from "../../model"

export interface FocusState {
    id: string,
    workspace: string,
    session: FocusSession[]
    loadStatus: 'NA' | 'pending' | 'complete'
}

export const initialState: FocusState = {
    id: '',
    workspace: '',
    session: [],
    loadStatus: 'NA'
}

export const focusReducer = createReducer(
    initialState
)