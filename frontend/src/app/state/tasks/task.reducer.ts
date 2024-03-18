import { createReducer, on } from "@ngrx/store"
import { Task } from "../../model"
import { addTask, addTaskError, addTaskSuccess, changeCompleteStatus, changeCompleteStatusError, changeCompleteStatusSuccess, deleteTask, deleteTaskError, deleteTaskSuccess, loadAllTasks, loadAllTasksFromService, resetTaskState, updateTask, updateTaskError, updateTaskSuccess } from "./task.actions"

export interface TaskState {
    id: string; // user id
    workspace: string;
    tasks: Task[];
    completedTask: number;
    incompletedTask: number;
    totalTask: number;
    actionStatus: 'success' | 'error' | 'pending' | 'nil';
    error: any;
}

export const initialState: TaskState = {
    id: '',
    workspace: '',
    tasks: [],
    completedTask: 0,
    incompletedTask: 0,
    totalTask: 0,
    actionStatus: 'nil',
    error: null
}

export const taskReducer = createReducer(
    initialState,
    on(addTask, (state) => ({
        ...state,
        actionStatus: 'pending' as const
    })),
    on(addTaskSuccess, (state, { task }) => ({
        ...state,
        tasks: [...state.tasks, task],
        completedTask: task.completed == true ? state.completedTask+1 : state.completedTask-1,
        incompletedTask: task.completed == false ? state.completedTask+1 : state.completedTask-1,
        totalTask: state.totalTask + 1,
        actionStatus: 'success' as const
    })),
    on(addTaskError, (state, { error }) => ({
        ...state,
        error: error,
        actionStatus: 'error' as const
    })),
    on(deleteTask, (state) => ({
        ...state,
        actionStatus: 'pending' as const
    })),
    on(deleteTaskSuccess, (state, { taskId, completed }) => ({
        ...state,
        tasks: state.tasks.filter((task) => task.id !== taskId),
        completedTask: completed == true ? state.completedTask-1 : state.completedTask,
        incompletedTask: completed == false ? state.completedTask-1 : state.completedTask,
        totalTask: state.totalTask - 1,
        actionStatus: 'success' as const
    })),
    on(deleteTaskError, (state, { error }) => ({
        ...state,
        error: error,
        actionStatus: 'error' as const
    })),
    on(updateTask, state => ({
        ...state,
        actionStatus: 'pending' as const
    })),
    on(updateTaskSuccess, (state, { taskId, task }) => ({
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        actionStatus: 'success' as const
    })),
    on(updateTaskError, (state, { error }) => ({
        ...state,
        error: error,
        actionStatus: 'error' as const
    })),
    on(changeCompleteStatus, (state) => ({
        ...state,
        actionStatus: 'pending' as const
    })),
    on(changeCompleteStatusSuccess, (state, { taskId, task }) => ({
        ...state,
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        completedTask: task.completed == true ? state.completedTask+1 : state.completedTask-1,
        incompletedTask: task.completed == false ? state.completedTask+1 : state.completedTask-1,
        actionStatus: 'success' as const
    })),
    on(changeCompleteStatusError, (state, { error }) => ({
        ...state,
        error: error,
        actionStatus: 'error' as const
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
        actionStatus: 'nil' as const,
        error: null
    }))
)