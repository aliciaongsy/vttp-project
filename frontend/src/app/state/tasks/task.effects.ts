import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { TaskService } from "../../service/task.service";
import { addTask, changeCompleteStatus, deleteTask, loadAllTasks, loadAllTasksFromService, updateTask } from "./task.actions";
import { map, switchMap, withLatestFrom } from "rxjs";
import { selectTask } from "./task.selector";

@Injectable()
export class TaskEffects{
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private taskSvc = inject(TaskService)

    addTask$ = createEffect(() => 
        this.actions$.pipe(
            ofType(addTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) => 
                this.taskSvc.addTasksToWorkspace(state.id, state.workspace, state.tasks[state.tasks.length - 1])
            )
        ),
        { dispatch: false }
    )

    deleteTask$ = createEffect(() => 
        this.actions$.pipe(
            ofType(deleteTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) => 
                this.taskSvc.deleteTask(state.id, state.workspace, action.taskId)
            )
        ),
        { dispatch: false }
    )

    updateTask$ = createEffect(() => 
        this.actions$.pipe(
            ofType(updateTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) => 
                this.taskSvc.updateTask(state.id, state.workspace, action.taskId, action.task)
            )
        ),
        { dispatch: false }
    )

    loadTasks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadAllTasks),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) => 
                this.taskSvc.getTasksOfWorkspace(state.id, state.workspace).pipe(
                    map((value) => loadAllTasksFromService({tasks: value}))
                )
            )
        )
    )

    updateCompleteStatus$ = createEffect(() => 
        this.actions$.pipe(
            ofType(changeCompleteStatus),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) => 
                this.taskSvc.updateCompleteStatus(state.id, state.workspace, action.taskId, action.completed)
            )
        ),
        { dispatch: false }
    )
}