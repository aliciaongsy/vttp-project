import { createAction, props } from "@ngrx/store";
import { ChatDetails, ChatRoom, Task, UserDetails } from "../../model";

export const changeStatus = createAction(
    '[User Page] Change Login Status',
    props<{ currUser: UserDetails }>()
)

export const addWorkspace = createAction(
    '[User Page] Add Workspace',
    props<{ workspace: string }>()
)

export const createChatRoom = createAction(
    '[User Page] Create Chat Room',
    props<{ chat: ChatRoom }>()
)

export const joinChatRoom = createAction(
    '[User Page] Join Chat Room',
    props<{ id: string, roomId: string }>()
)

export const getChatList = createAction(
    '[User Page] Reload Chats'
)

// this action is triggered by change status
export const loadWorkspaces = createAction(
    '[User Page] Load Workspaces',
    props<{ workspaces: string[] }>()
)

export const loadChats = createAction(
    '[User Page] Load Chats',
    props<{ chats: ChatDetails[] }>()
)

export const loadOutstandingTasks = createAction(
    '[User Page] Load Outstanding Tasks',
    props<{ tasks: Task[] }>()
)

export const resetState = createAction(
    '[User Page] Reset State',
)