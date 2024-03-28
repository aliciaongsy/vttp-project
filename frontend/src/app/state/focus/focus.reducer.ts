import { createReducer, on } from "@ngrx/store"
import { FocusSession } from "../../model"
import { incFocusDuration, persistData, resetState } from "./focus.actions"

export interface FocusState {
    id: string,
    workspace: string,
    session: FocusSession[]
    loadStatus: 'NA' | 'pending' | 'complete'
    currentDate: string,
    todayFocusDuration: number
}

export const initialState: FocusState = {
    id: '',
    workspace: '',
    session: [],
    loadStatus: 'NA',
    currentDate: new Date().toISOString().split('T')[0],
    todayFocusDuration: 0
}

export const focusReducer = createReducer(
    initialState,
    on(persistData, (state, {id, workspace})=> ({
        ...state,
        id: id,
        workspace: workspace
    })),
    on(incFocusDuration, (state, {duration}) => ({
        ...state,
        todayFocusDuration: state.todayFocusDuration+duration
    })),
    on(resetState, (state)=>({
        id: '',
        workspace: '',
        session: [],
        loadStatus: 'NA' as const,
        currentDate: new Date().toISOString().split('T')[0],
        todayFocusDuration: 0
    }))
)