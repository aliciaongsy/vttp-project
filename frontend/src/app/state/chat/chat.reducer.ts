import { createReducer, on } from "@ngrx/store";
import { ChatMessage, ChatRoom } from "../../model";
import { enterChatRoom, loadAllMessages, loadAllMessagesFromService, loadChatRoom, loadChatRoomFromService, sendMessage } from "./chat.actions";

export interface ChatState {
    roomId: string,
    name: string,
    messages: ChatMessage[]
    loadStatus: 'NA' | 'pending' | 'complete',
    chatRoom: ChatRoom
}

export const initialState: ChatState = {
    roomId: '',
    name: '',
    messages: [],
    loadStatus: 'NA',
    chatRoom: {
        roomId: '',
        ownerId: '',
        ownerName: '',
        name: '',
        users: [],
        userCount: 0,
        createDate: 0, 
        type: 'Private'
    }
}

export const chatReducer = createReducer(
    initialState,
    on(enterChatRoom, (state, {name}) => ({
        ...state,
        name: name
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
    })),
    on(loadChatRoom, (state, {roomId}) => ({
        ...state,
        roomId: roomId
    })),
    on(loadChatRoomFromService, (state, {chatRoom}) => ({
        ...state,
        chatRoom: chatRoom
    }))
) 