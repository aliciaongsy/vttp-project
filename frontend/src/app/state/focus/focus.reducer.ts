import { createReducer, on } from "@ngrx/store"
import { FocusSession } from "../../model"
import { incFocusDuration, loadAllSessions, loadAllSessionsFromService, persistData, resetFocusState, resetState } from "./focus.actions"

export interface FocusState {
    id: string,
    workspace: string,
    sessions: FocusSession[]
    loadStatus: 'NA' | 'pending' | 'complete'
    currentDate: string,
    todayFocusDuration: number
}

export const initialState: FocusState = {
    id: '',
    workspace: '',
    sessions: [],
    loadStatus: 'NA',
    currentDate: new Date().toISOString().split('T')[0],
    todayFocusDuration: 0
}

export const focusReducer = createReducer(
    initialState,
    on(persistData, (state, { id, workspace }) => ({
        ...state,
        id: id,
        workspace: workspace
    })),
    on(incFocusDuration, (state, { duration }) => ({
        ...state,
        todayFocusDuration: state.todayFocusDuration + duration
    })),
    on(loadAllSessions, (state, { id, workspace }) => ({
        ...state,
        id: id,
        workspace: workspace,
        loadStatus: 'pending' as const
    })),
    on(loadAllSessionsFromService, (state, { sessions }) => ({
        ...state,
        sessions: sessions,
        loadStatus: 'complete' as const
    })),
    on(resetState, (state) => ({
        id: '',
        workspace: '',
        sessions: [],
        loadStatus: 'NA' as const,
        currentDate: new Date().toISOString().split('T')[0],
        todayFocusDuration: 0
    })),
    on(resetFocusState, (state) => ({
        id: '',
        workspace: '',
        sessions: [],
        loadStatus: 'NA' as const,
        currentDate: new Date().toISOString().split('T')[0],
        todayFocusDuration: 0
    }))
)