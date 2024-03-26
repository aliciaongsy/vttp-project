import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AppState } from "../app.state";
import { Store, select } from "@ngrx/store";
import { addEvent, loadAllEvents, loadAllEventsFromService } from "./planner.actions";
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
                this.plannerSvc.addEventToWorkspace(state.id, state.workspace ,action.events)
            )
        ),
        {dispatch: false}
    )

    loadEvents$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadAllEvents),
            withLatestFrom(this.store.select(selectPlanner)),
            switchMap(([action, state]) => 
                this.plannerSvc.getEventsOfWorkspace(state.id, state.workspace).pipe(
                    map(value => loadAllEventsFromService({events: value}))
                )
            )
        )
    )
    
}