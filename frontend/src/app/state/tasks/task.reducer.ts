import { createReducer, on } from "@ngrx/store"
import { Task } from "../../model"
import { addTask, changeCompleteStatus, deleteTask, loadAllTasks, loadAllTasksFromService, resetTaskState, updateTask } from "./task.actions"

export interface TaskState {
    id: string // user id
    workspace: string
    tasks: Task[]
    completedTask: number
    incompletedTask: number
    totalTask: number
}

export const initialState: TaskState = {
    id: '',
    workspace: '',
    tasks: [],
    completedTask: 0,
    incompletedTask: 0,
    totalTask: 0
}

export const taskReducer = createReducer(
    initialState,
    on(addTask, (state, { task }) => ({
        ...state,
        tasks: [...state.tasks, task],
        completedTask: task.completed == true ? state.completedTask+1 : state.completedTask-1,
        incompletedTask: task.completed == false ? state.completedTask+1 : state.completedTask-1,
        totalTask: state.totalTask + 1
    })),
    on(deleteTask, (state, { taskId, completed }) => ({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== taskId),
        completedTask: completed == true ? state.completedTask-1 : state.completedTask,
        incompletedTask: completed == false ? state.completedTask-1 : state.completedTask,
        totalTask: state.totalTask - 1
    })),
    on(updateTask, (state, { taskId, task }) => ({
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
    })),
    on(changeCompleteStatus, (state, { taskId, task }) => ({
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
        totalTask: 0
    }))
)