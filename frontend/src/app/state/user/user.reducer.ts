import { createReducer, on } from "@ngrx/store"
import { ChatDetails, Task, UserDetails } from "../../model"
import { addWorkspace, changeStatus, createChatRoom, deleteWorkspace, getChatList, joinChatRoom, leaveChatRoom, loadChats, loadOutstandingTasks, loadTaskSummary, loadUserProfile, loadWorkspaces, resetState, updateProfile } from "./user.actions"

export interface UserState {
    login: boolean
    user: UserDetails
    workspaces: string[]
    chats: ChatDetails[]
    outstandingTasks: Task[]
    taskSummary: any
}

export const initialState: UserState = {
    login: false,
    user: {
        id: '',
        name: '',
        email: '',
        createDate: 0,
        image: ''
    },
    workspaces: [],
    chats: [],
    outstandingTasks: [],
    taskSummary: ''
}

export const userReducer = createReducer(
    initialState,
    on(addWorkspace, (state, { workspace }) => ({
        ...state,
        workspaces: [...state.workspaces, workspace]
    })),
    on(deleteWorkspace, (state, { workspace }) => ({
        ...state,
        workspaces: state.workspaces.filter(w => w != workspace)
    })),
    on(createChatRoom, state => state),
    on(joinChatRoom, state => state),
    on(leaveChatRoom, state => state),
    on(getChatList, state => state),
    on(changeStatus, (state, { currUser }) => ({
        ...state,
        login: !(state.login),
        user: currUser,
    })),
    on(updateProfile, state => state),
    on(loadWorkspaces, (state, { workspaces }) => ({
        ...state,
        workspaces: workspaces
    })),
    on(loadChats, (state, { chats }) => ({
        ...state,
        chats: chats
    })),
    on(loadOutstandingTasks, (state, { tasks }) => ({
        ...state,
        outstandingTasks: tasks
    })),
    on(loadTaskSummary, (state, { summary }) => ({
        ...state,
        taskSummary: summary
    })),
    on(loadUserProfile, (state, { currUser }) => ({
        ...state,
        user: currUser,
    })),
    on(resetState, state => ({
        login: false,
        user: {
            id: '',
            name: '',
            email: '',
            createDate: 0,
            image: ''
        },
        workspaces: [],
        chats: [],
        outstandingTasks: [],
        taskSummary: ''
    }))
)