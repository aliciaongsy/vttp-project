import { createReducer, on } from "@ngrx/store"
import { FocusSession } from "../../model"
import { incFocusDuration, loadAllSessions, loadAllSessionsFromService, resetFocusState, setCurrentDate } from "./focus.actions"

export interface FocusState {
    id: string,
    workspace: string,
    sessions: FocusSession[]
    loadStatus: 'NA' | 'pending' | 'complete'
    currentDate: string,
}

export const initialState: FocusState = {
    id: '',
    workspace: '',
    sessions: [],
    loadStatus: 'NA',
    currentDate: new Date().toISOString().split('T')[0],
}

export const focusReducer = createReducer(
    initialState,
    on(setCurrentDate, (state) => ({
        ...state,
        currentDate: new Date().toISOString().split('T')[0],
    })),
    on(incFocusDuration, (state) => ({
        ...state,
    })),
    on(loadAllSessions, (state, { id }) => ({
        ...state,
        id: id,
        loadStatus: 'pending' as const
    })),
    on(loadAllSessionsFromService, (state, { sessions }) => ({
        ...state,
        sessions: sessions,
        loadStatus: 'complete' as const
    })),
    on(resetFocusState, (state) => ({
        id: '',
        workspace: '',
        sessions: [],
        loadStatus: 'NA' as const,
        currentDate: new Date().toISOString().split('T')[0],
    }))
)