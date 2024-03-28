import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { incFocusDuration, persistData, resetState } from "./focus.actions";
import { map, of, switchMap, withLatestFrom } from "rxjs";
import { selectCurrentDate, selectDuration, selectFocus, selectSessions } from "./focus.selector";
import { FocusService } from "../../service/focus.service";

@Injectable()
export class FocusEffects {
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private focusSvc = inject(FocusService)
    
    resetState$ = createEffect(() => 
        this.actions$.pipe(
            ofType(resetState),
            map((action) => incFocusDuration({duration: action.duration}))
        )
    )

    persistData$ = createEffect(() => 
        this.actions$.pipe(
            ofType(persistData),
            withLatestFrom(this.store.select(selectFocus)),
            switchMap(([action, state]) => 
                this.focusSvc.addSessions(action.id, action.workspace, state.currentDate, state.todayFocusDuration).pipe(
                    map(() => resetState({duration: 0}))
                )
            )
        )
    )
}