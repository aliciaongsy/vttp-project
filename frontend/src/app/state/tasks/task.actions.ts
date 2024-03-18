import { createAction, props } from "@ngrx/store";
import { Task } from "../../model";

// --- add task ---
export const addTask = createAction(
    '[Task Page] Add Task',
    props<{ task: Task }>()
)

export const addTaskSuccess = createAction(
    '[Task Page] Add Task Success',
    props<{ task: Task }>()
)

export const addTaskError = createAction(
    '[Task Page] Add Task Error',
    props<{ error: string }>()
)

// --- delete task by id ---
export const deleteTask = createAction(
    '[Task Page] Delete Task',
    props<{ taskId: string, completed: boolean }>()
)

export const deleteTaskSuccess = createAction(
    '[Task Page] Delete Task Success',
    props<{ taskId: string, completed: boolean }>()
)

export const deleteTaskError = createAction(
    '[Task Page] Delete Task Error',
    props<{ error: string }>()
)

// --- update task ---
export const updateTask = createAction(
    '[Task Page] Update Task',
    props<{ taskId: string, task: Task }>()
)

export const updateTaskSuccess = createAction(
    '[Task Page] Update Task Success',
    props<{ taskId: string, task: Task }>()
)

export const updateTaskError = createAction(
    '[Task Page] Update Task Error',
    props<{ error: string }>()
)

//  --- change complete status
export const changeCompleteStatus = createAction(
    '[Task Page] Change Complete Status',
    props<{ taskId: string, task: Task, completed: boolean }>()
)

export const changeCompleteStatusSuccess = createAction(
    '[Task Page] Change Complete Status Success',
    props<{ taskId: string, task: Task, completed: boolean }>()
)

export const changeCompleteStatusError = createAction(
    '[Task Page] Change Complete Status Error',
    props<{ error: string }>()
)

// --- load task ---
export const loadAllTasks = createAction(
    '[Task Page] Load All Tasks',
    props<{ id: string, workspace: string }>()
)

// action is triggered by loadAllTasks
export const loadAllTasksFromService = createAction(
    '[Task Page] Load All Tasks From Service',
    props<{ tasks: Task[] }>()
)

export const resetTaskState = createAction(
    '[Task Page] Reset State'
)