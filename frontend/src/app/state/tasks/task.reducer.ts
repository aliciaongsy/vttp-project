import { createReducer, on } from "@ngrx/store"
import { Task } from "../../model"
import { addTask, changeCompleteStatus, deleteTask, loadAllTasks, loadAllTasksFromService, resetTaskState } from "./task.actions"

export interface TaskState {
    id: string // user id
    workspace: string
    tasks: Task[]
}

export const initialState: TaskState = {
    id: '',
    workspace: '',
    tasks: []
}

export const taskReducer = createReducer(
    initialState,
    on(addTask, (state, { task }) => ({
        ...state,
        tasks: [...state.tasks, task]
    })),
    on(deleteTask, (state, { id }) => ({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== id)
    })),
    on(changeCompleteStatus, (state, { id, task }) => ({
        id: state.id,
        workspace: state.workspace,
        tasks: state.tasks.map(t => t.id===id ? task : t)
    })),
    on(loadAllTasks, (state, { id, workspace }) => ({
        id: id,
        workspace: workspace,
        tasks: state.tasks
    })),
    on(loadAllTasksFromService, (state, { tasks }) => ({
        id: state.id,
        workspace: state.workspace,
        tasks: tasks
    })),
    on(resetTaskState, state => ({
        id: '',
        workspace: '',
        tasks: []
    }))
)