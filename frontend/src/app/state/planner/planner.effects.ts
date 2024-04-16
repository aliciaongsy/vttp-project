import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AppState } from "../app.state";
import { Store } from "@ngrx/store";
import { addEvent, loadAllEvents, loadAllEventsFromService, loadAllOutstandingTasks, loadAllOutstandingTasksFromService } from "./planner.actions";
import { map, switchMap, withLatestFrom } from "rxjs";
import { selectPlanner } from "./planner.selector";
import { PlannerService } from "../../service/planner.service";

@Injectable()
export class PlannerEffects {

    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private plannerSvc = inject(PlannerService)
    
    addEvent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addEvent),
            withLatestFrom(this.store.select(selectPlanner)),
            switchMap(([action, state]) => 
                this.plannerSvc.addEventToWorkspace(state.id, action.events)
            )
        ),
        {dispatch: false}
    )

    loadEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadAllEvents),
            withLatestFrom(this.store.select(selectPlanner)),
            switchMap(([action, state]) => 
                this.plannerSvc.getEventsOfWorkspace(state.id).pipe(
                    map(value => loadAllEventsFromService({events: value}))
                )
            )
        )
    )

    loadOutstandingTasks$ = createEffect(() => 
        this.actions$.pipe(
            ofType(loadAllOutstandingTasks),
            withLatestFrom(this.store.select(selectPlanner)),
            switchMap(([action, state]) =>
                this.plannerSvc.getAllOutstandingTasks(state.id, action.workspaces).pipe(
                    map(value => loadAllOutstandingTasksFromService({tasks: value}))
                )
            )
        )
    )
    
}