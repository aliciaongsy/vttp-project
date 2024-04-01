import { createAction, props } from "@ngrx/store";
import { ChatMessage } from "../../model";

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