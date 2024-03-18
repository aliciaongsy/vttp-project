import { createReducer, on } from "@ngrx/store"
import { Task } from "../../model"
import { addTask, addTaskError, addTaskSuccess, changeCompleteStatus, changeCompleteStatusSuccess, deleteTask, deleteTaskError, deleteTaskSuccess, loadAllTasks, loadAllTasksFromService, resetTaskState, updateTask, updateTaskError, updateTaskSuccess } from "./task.actions"

export interface TaskState {
    id: string // user id
    workspace: string
    tasks: Task[]
    completedTask: number
    incompletedTask: number
    totalTask: number
    error: any
}

export const initialState: TaskState = {
    id: '',
    workspace: '',
    tasks: [],
    completedTask: 0,
    incompletedTask: 0,
    totalTask: 0,
    error: null
}

export const taskReducer = createReducer(
    initialState,
    on(addTask, (state) => ({...state})),
    on(addTaskSuccess, (state, { task }) => ({
        ...state,
        tasks: [...state.tasks, task],
        completedTask: task.completed == true ? state.completedTask+1 : state.completedTask-1,
        incompletedTask: task.completed == false ? state.completedTask+1 : state.completedTask-1,
        totalTask: state.totalTask + 1
    })),
    on(addTaskError, (state, { error }) => ({
        ...state,
        error: error
    })),
    on(deleteTask, (state) => ({...state})),
    on(deleteTaskSuccess, (state, { taskId, completed }) => ({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== taskId),
        completedTask: completed == true ? state.completedTask-1 : state.completedTask,
        incompletedTask: completed == false ? state.completedTask-1 : state.completedTask,
        totalTask: state.totalTask - 1
    })),
    on(deleteTaskError, (state, { error }) => ({
        ...state,
        error: error
    })),
    on(updateTask, state => ({...state})),
    on(updateTaskSuccess, (state, { taskId, task }) => ({
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
    })),
    on(updateTaskError, (state, { error }) => ({
        ...state,
        error: error
    })),
    on(changeCompleteStatus, (state) => ({...state})),
    on(changeCompleteStatusSuccess, (state, { taskId, task }) => ({
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        completedTask: task.completed == true ? state.completedTask+1 : state.completedTask-1,
        incompletedTask: task.completed == false ? state.completedTask+1 : state.completedTask-1,
    })),
    on(loadAllTasks, (state, { id, workspace }) => ({
        ...state,
        id: id,
        workspace: workspace
    })),
    on(loadAllTasksFromService, (state, { tasks }) => ({
        ...state,
        tasks: tasks,
        completedTask: tasks.filter(t => t.completed == true).length,
        incompletedTask: tasks.filter(t=>t.completed==false).length,
    })),
    on(resetTaskState, state => ({
        id: '',
        workspace: '',
        tasks: [],
        completedTask: 0,
        incompletedTask: 0,
        totalTask: 0,
        error: null
    }))
)