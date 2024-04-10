import { createReducer, on } from "@ngrx/store";
import { addEvent, changeAuthStatus, changeCalendarMode, loadAllEvents, loadAllEventsFromService, loadAllOutstandingTasks, loadAllOutstandingTasksFromService, resetAuthStatus, resetPlannerState } from "./planner.actions";
import { Event, Task } from "../../model";

export interface PlannerState {
    id: string, 
    events: Event[],
    loadStatus: 'NA' | 'pending' | 'complete',
    outstandingTasks : Task[],
    calendarMode: 'mongo' | 'google',
    authStatus: boolean,
    email: string
}

export const initialState: PlannerState = {
    id: '',
    events: [],
    loadStatus: 'NA', 
    outstandingTasks: [],
    calendarMode: 'mongo',
    authStatus: false,
    email: ''
}

export const plannerReducer = createReducer(
    initialState,
    on(addEvent, (state, { events }) => ({
        ...state,
        events: events,
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
    on(changeCalendarMode, (state) => ({
        ...state,
        calendarMode: 'google' as const
    })),
    on(changeAuthStatus, (state, { email }) => ({
        ...state,
        authStatus: true,
        email: email
    })),
    on(resetAuthStatus, (state) => ({
        ...state,
        authStatus: false,
        email: ''
    })),
    on(resetPlannerState, (state) => ({
        id: '',
        events: [],
        loadStatus: 'NA' as const,
        outstandingTasks: [],
        calendarMode: 'mongo' as const,
        authStatus: false,
        email: ''
    }))
)