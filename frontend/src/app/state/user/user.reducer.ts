import { createReducer, on } from "@ngrx/store"
import { ChatDetails, Task, UserDetails } from "../../model"
import { addWorkspace, changeStatus, createChatRoom, getChatList, joinChatRoom, loadChats, loadOutstandingTasks, loadWorkspaces, resetState } from "./user.actions"

export interface UserState {
    login: boolean
    user: UserDetails
    workspaces: string[]
    chats: ChatDetails[]
    outstandingTasks: Task[]
}

export const initialState: UserState = {
    login: false,
    user: {
        id: '',
        name: '',
        email: ''
    },
    workspaces: [],
    chats: [],
    outstandingTasks: []
}

export const userReducer = createReducer(
    initialState,
    on(addWorkspace, (state, { workspace }) => ({
        ...state,
        workspaces: [...state.workspaces, workspace]
    })),
    on(createChatRoom, state => state),
    on(joinChatRoom, state => state),
    on(getChatList, state => state),
    on(changeStatus, (state, { currUser }) => ({
        ...state,
        login: !(state.login),
        user: currUser,
    })),
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
    on(resetState, state => ({
        login: false,
        user: {
            id: '',
            name: '',
            email: ''
        },
        workspaces: [],
        chats: [],
        outstandingTasks: []

    }))
)