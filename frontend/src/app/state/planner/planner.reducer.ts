import { createReducer, on } from "@ngrx/store";
import { addEvent, loadAllEvents, loadAllEventsFromService, resetPlannerState } from "./planner.actions";
import { Event } from "../../model";

export interface PlannerState {
    id: string, 
    workspace: string,
    events: Event[]
}

export const initialState: PlannerState = {
    id: '',
    workspace: '',
    events: []
}

export const plannerReducer = createReducer(
    initialState,
    on(addEvent, (state, { events }) => ({
        id: state.id,
        workspace: state.workspace,
        events: events
    })),
    on(loadAllEvents, (state, { id, workspace}) => ({
        ...state,
        id: id,
        workspace: workspace
    })),
    on(loadAllEventsFromService, (state, { events }) => ({
        ...state,
        events: events
    })),
    on(resetPlannerState, (state) => ({
        id: '',
        workspace: '',
        events: []
    }))
)