import { createAction, props } from "@ngrx/store";
import { Event } from "../../model";

export const addEvent = createAction(
    '[Planner Page] Add All Events',
    props<{ events: Event[] }>()
)

export const loadAllEvents = createAction(
    '[Planner Page] Load All Events',
    props<{ id: string, workspace: string }>()
)

export const loadAllEventsFromService = createAction(
    '[Planner Page] Load All Events From Service',
    props<{ events: Event[] }>()
)

export const resetPlannerState = createAction(
    '[Planner Page] Reset State'
)