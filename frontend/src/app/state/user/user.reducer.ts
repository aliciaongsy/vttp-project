import { createReducer, on } from "@ngrx/store"
import { ChatDetails, ChatRoom, UserDetails } from "../../model"
import { addWorkspace, changeStatus, createChatRoom, getChatList, joinChatRoom, loadChats, loadWorkspaces, resetState } from "./user.actions"

export interface UserState {
    login: boolean
    user: UserDetails
    workspaces: string[]
    chats: ChatDetails[]
}

export const initialState: UserState = {
    login: false,
    user: {
        id: '',
        name: '',
        email: ''
    },
    workspaces: [],
    chats: []
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
    on(resetState, state => ({
        login: false,
        user: {
            id: '',
            name: '',
            email: ''
        },
        workspaces: [],
        chats: []
    })),
    on(loadWorkspaces, (state, {workspaces}) => ({
        ...state,
        workspaces: workspaces
    })),
    on(loadChats, (state, {chats}) => ({
        ...state,
        chats: chats
    }))
)