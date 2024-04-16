import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { TaskService } from "../../service/task.service";
import { addTask, addTaskError, addTaskSuccess, changeCompleteStatus, changeCompleteStatusError, changeCompleteStatusSuccess, deleteTask, deleteTaskError, deleteTaskSuccess, loadAllTasks, loadAllTasksFromService, updateTask, updateTaskError, updateTaskSuccess } from "./task.actions";
import { catchError, map, of, switchMap, withLatestFrom } from "rxjs";
import { selectTask } from "./task.selector";

@Injectable()
export class TaskEffects {
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private taskSvc = inject(TaskService)

    addTask$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) =>
                this.taskSvc.addTasksToWorkspace(state.id, state.workspace, action.task)
                    .pipe(
                        map(() => addTaskSuccess({ task: action.task })),
                        catchError((error) => {
                            console.info('error', error)
                            return of(addTaskError({ error: error.message }))
                        })
                    ),
            ),
        )
    )

    deleteTask$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) =>
                this.taskSvc.deleteTask(state.id, state.workspace, action.taskId, action.completed)
                    .pipe(
                        map(() => deleteTaskSuccess({ taskId: action.taskId, completed: action.completed })),
                        catchError((error) => of(deleteTaskError({ error: error.message })))
                    )
            )
        )
    )

    updateTask$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateTask),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) =>
                this.taskSvc.updateTask(state.id, state.workspace, action.taskId, action.task, action.completeStatusChange)
                    .pipe(
                        map(() => updateTaskSuccess({ taskId: action.taskId, task: action.task })),
                        catchError((error) => of(updateTaskError({ error: error.message })))
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
                    .pipe(
                        map(() => changeCompleteStatusSuccess({ taskId: action.taskId, task: action.task, completed: action.completed })),
                        catchError((error) => of(changeCompleteStatusError({ error: error.message })))
                    )
            )
        )
    )

    loadTasks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(loadAllTasks, addTaskSuccess),
            withLatestFrom(this.store.select(selectTask)),
            switchMap(([action, state]) =>
                this.taskSvc.getTasksOfWorkspace(state.id, state.workspace).pipe(
                    map((value) => loadAllTasksFromService({ tasks: value }))
                )
            )
        )
    )

}