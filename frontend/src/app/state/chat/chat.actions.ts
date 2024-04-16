import { createAction, props } from "@ngrx/store";
import { ChatMessage, ChatRoom } from "../../model";

export const enterChatRoom = createAction(
    '[Chat Page] Enter Chat Room',
    props<{ name: string }>()
)

export const sendMessage = createAction(
    '[Chat Page] Send Message',
    props<{ roomId: string, message: ChatMessage }>()
)

export const loadAllMessages = createAction(
    '[Chat Page] Load Messages',
    props<{ roomId: string }>()
)

export const loadAllMessagesFromService = createAction(
    '[Chat Page] Load Messages From Service',
    props<{ messages: ChatMessage[] }>()
)

export const loadChatRoom = createAction(
    '[Chat Page] Load Chat Room',
    props<{ roomId: string }>()
)

export const loadChatRoomError = createAction(
    '[Chat Page] Load Chat Room Error',
    props<{ error: string }>()
)

export const loadChatRoomFromService = createAction(
    '[Chat Page] Load Chat Room From Service',
    props<{ chatRoom: ChatRoom }>()
)

export const resetChatState = createAction(
    '[Chat Page] Reset Chat State'
)