import { createAction, props } from "@ngrx/store";
import { Event, Task } from "../../model";

export const addEvent = createAction(
    '[Planner Page] Add All Events',
    props<{ events: Event[] }>()
)

export const loadAllOutstandingTasks = createAction(
    '[Planner Page] Add Outstanding Tasks',
    props<{ id: string, workspaces: string[] }>()
)

export const loadAllOutstandingTasksFromService = createAction(
    '[Planner Page] Load All Outstanding Tasks From Service',
    props<{ tasks: Task[] }>()
)

export const loadAllEvents = createAction(
    '[Planner Page] Load All Events',
    props<{ id: string }>()
)

export const loadAllEventsFromService = createAction(
    '[Planner Page] Load All Events From Service',
    props<{ events: Event[] }>()
)

export const changeCalendarMode = createAction(
    '[Planner Page] Change Calendar Mode'
)

export const changeAuthStatus = createAction(
    '[Planner Page] Change Auth Status',
    props<{ email: string }>()
)

export const resetAuthStatus = createAction(
    '[Planner Page] Reset Auth Status'
)

export const resetPlannerState = createAction(
    '[Planner Page] Reset State'
)