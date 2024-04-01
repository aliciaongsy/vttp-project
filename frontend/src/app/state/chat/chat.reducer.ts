import { createReducer, on } from "@ngrx/store";
import { ChatMessage } from "../../model";
import { enterChatRoom, loadAllMessages, loadAllMessagesFromService, sendMessage } from "./chat.actions";

export interface ChatState {
    roomId: string,
    name: string,
    messages: ChatMessage[]
    loadStatus: 'NA' | 'pending' | 'complete',
}

export const initialState: ChatState = {
    roomId: '',
    name: '',
    messages: [],
    loadStatus: 'NA'
}

export const chatReducer = createReducer(
    initialState,
    on(enterChatRoom, (state, {chatRoom}) => ({
        ...state,
        name: chatRoom
    })),
    on(sendMessage, (state, { message }) => ({
        ...state,
        messages: [...state.messages, message]
    })),
    on(loadAllMessages, (state, { roomId }) => ({
        ...state,
        roomId: roomId,
        loadStatus: 'pending' as const
    })),
    on(loadAllMessagesFromService, (state, { messages }) => ({
        ...state,
        messages: messages,
        loadStatus: 'complete' as const
    }))
) 