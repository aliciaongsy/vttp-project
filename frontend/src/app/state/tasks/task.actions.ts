import { createAction, props } from "@ngrx/store";
import { Task } from "../../model";

export const addTask = createAction(
    '[Task Page] Add Task',
    props<{ task: Task }>()
)

// delete task by id
export const deleteTask = createAction(
    '[Task Page] Delete Task',
    props<{ taskId: string, completed: boolean }>()
)

export const updateTask = createAction(
    '[Task Page] Create Task',
    props<{ taskId: string, task: Task }>()
)

export const changeCompleteStatus = createAction(
    '[Task Page] Change complete status',
    props<{ taskId: string, task: Task, completed: boolean }>()
)

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