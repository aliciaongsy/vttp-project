import { createReducer, on } from "@ngrx/store";
import { addEvent, loadAllEvents, loadAllEventsFromService, resetPlannerState } from "./planner.actions";
import { Event } from "../../model";

export interface PlannerState {
    id: string, 
    workspace: string,
    events: Event[],
    loadStatus: 'NA' | 'pending' | 'complete'
}

export const initialState: PlannerState = {
    id: '',
    workspace: '',
    events: [],
    loadStatus: 'NA'
}

export const plannerReducer = createReducer(
    initialState,
    on(addEvent, (state, { events }) => ({
        id: state.id,
        workspace: state.workspace,
        events: events,
        loadStatus: state.loadStatus
    })),
    on(loadAllEvents, (state, { id, workspace}) => ({
        ...state,
        id: id,
        workspace: workspace,
        loadStatus: 'pending' as const
    })),
    on(loadAllEventsFromService, (state, { events }) => ({
        ...state,
        events: events,
        loadStatus: 'complete' as const
    })),
    on(resetPlannerState, (state) => ({
        id: '',
        workspace: '',
        events: [],
        loadStatus: 'NA' as const
    }))
)