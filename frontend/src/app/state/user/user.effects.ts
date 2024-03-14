import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AppState } from "../app.state";
import { Store } from "@ngrx/store";
import { TaskService } from "../../service/task.service";
import { addWorkspace, changeStatus, loadWorkspaces } from "./user.actions";
import { catchError, from, map, switchMap, withLatestFrom } from "rxjs";
import { selectUser, selectUserDetails } from "./user.selectors";

@Injectable()
export class UserEffects {
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private taskSvc = inject(TaskService)

    loadWorkspaces$ = createEffect(() => 
        this.actions$.pipe(
            ofType(changeStatus),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details])=>
                from(this.taskSvc.retrieveWorkspaces(details.id)).pipe(
                    map((value) => loadWorkspaces({workspaces: value}))
                    // catchError(() => )
                )
                    
            )
        )
    )

    addWorkspace$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addWorkspace),
            withLatestFrom(this.store.select(selectUser)),
            switchMap(([action, user])=>
                this.taskSvc.addWorkspace(user.user.id, user.workspaces[user.workspaces.length - 1])
            )    
        ),
        { dispatch: false }
    )
}