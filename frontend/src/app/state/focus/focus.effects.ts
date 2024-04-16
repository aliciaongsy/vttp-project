import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { incFocusDuration, loadAllSessions, loadAllSessionsFromService } from "./focus.actions";
import { map, switchMap, withLatestFrom } from "rxjs";
import { selectFocus } from "./focus.selector";
import { FocusService } from "../../service/focus.service";

@Injectable()
export class FocusEffects {

    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private focusSvc = inject(FocusService)

    addFocusDuration$ = createEffect(() =>
        this.actions$.pipe(
            ofType(incFocusDuration),
            withLatestFrom(this.store.select(selectFocus)),
            switchMap(([action, state]) =>
                this.focusSvc.addSessions(state.id, state.currentDate, action.duration).pipe(
                    switchMap(() =>
                        this.focusSvc.getSessions(state.id).pipe(
                            map((value) => {
                                console.info('sess data: ', value)
                                return loadAllSessionsFromService({ sessions: value })
                            })
                        )
                    )
                )
            )
        )
    )

    loadData$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadAllSessions),
            withLatestFrom(this.store.select(selectFocus)),
            switchMap(([action, state]) =>
                this.focusSvc.getSessions(state.id).pipe(
                    map((value) => {
                        console.info('sess data: ', value)
                        return loadAllSessionsFromService({ sessions: value })
                    })
                )
            )
        )
    )
}