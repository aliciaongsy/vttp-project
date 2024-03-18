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
export const selectActionStatus = createSelector(
    selectTask,
    (state: TaskState) => state.actionStatus
)
export const selectError = createSelector(
    selectTask,
    (state: TaskState) => state.error
)
export const selectTaskSize = createSelector(
    selectTask,
    (state: TaskState) => state.totalTask
)
export const selectIncompletedTaskSize = createSelector(
    selectTask,
    (state: TaskState) => state.incompletedTask
)
export const selectCompletedTaskSize = createSelector(
    selectTask,
    (state: TaskState) => state.completedTask
)