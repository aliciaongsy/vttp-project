import { createAction, props } from "@ngrx/store";
import { ChatDetails, ChatRoom, Task, UserDetails } from "../../model";

export const changeStatus = createAction(
    '[User Page] Change Login Status',
    props<{ currUser: UserDetails }>()
)

export const loadAllData = createAction(
    '[User Page] Load All Data'
)

export const addWorkspace = createAction(
    '[User Page] Add Workspace',
    props<{ workspace: string }>()
)

export const deleteWorkspace = createAction(
    '[User Page] Delete Workspace',
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

export const leaveChatRoom = createAction(
    '[User Page] Leave Chat Room',
    props<{ id: string, roomId: string }>()
)

export const getChatList = createAction(
    '[User Page] Reload Chats'
)

export const updateProfile = createAction(
    '[User Page] Update Profile',
    props<{ data: FormData }>()
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

export const loadTaskSummary = createAction(
    '[User Page] Load Task Summary',
    props<{ summary: any }>()
)

export const loadUserProfile = createAction(
    '[User Page] Load User Profile',
    props<{ currUser: UserDetails }>()
)

export const resetState = createAction(
    '[User Page] Reset State',
)