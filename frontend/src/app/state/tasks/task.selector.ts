import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { TaskState } from "./task.reducer";

export const selectTask = (state: AppState) => state.task
export const selectId = createSelector(
    selectTask,
    (state: TaskState) => state.id
)
export const selectWorkspace = createSelector(
    selectTask,
    (state: TaskState) => state.workspace
)
export const selectAllTasks = createSelector(
    selectTask,
    (state: TaskState) => state.tasks
)