import { createReducer, on } from "@ngrx/store";
import { addEvent, loadAllEvents, loadAllEventsFromService, loadAllOutstandingTasks, loadAllOutstandingTasksFromService, resetPlannerState } from "./planner.actions";
import { Event, Task } from "../../model";

export interface PlannerState {
    id: string, 
    events: Event[],
    loadStatus: 'NA' | 'pending' | 'complete',
    outstandingTasks : Task[]
}

export const initialState: PlannerState = {
    id: '',
    events: [],
    loadStatus: 'NA', 
    outstandingTasks: []
}

export const plannerReducer = createReducer(
    initialState,
    on(addEvent, (state, { events }) => ({
        id: state.id,
        events: events,
        loadStatus: state.loadStatus,
        outstandingTasks: state.outstandingTasks
    })),
    on(loadAllOutstandingTasks, (state, { id }) => ({
        ...state,
       id: id,
    })),
    on(loadAllOutstandingTasksFromService, (state, { tasks }) => ({
        ...state,
       outstandingTasks: tasks,
    })),
    on(loadAllEvents, (state, { id }) => ({
        ...state,
        id: id,
        loadStatus: 'pending' as const
    })),
    on(loadAllEventsFromService, (state, { events }) => ({
        ...state,
        events: events,
        loadStatus: 'complete' as const
    })),
    on(resetPlannerState, (state) => ({
        id: '',
        events: [],
        loadStatus: 'NA' as const,
        outstandingTasks: []
    }))
)