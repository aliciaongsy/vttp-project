import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { ChatState } from "./chat.reducer";

export const selectChat = (state: AppState) => state.chat
export const selectRoomId = createSelector(
    selectChat,
    (state: ChatState) => state.roomId
)
export const selectMessages = createSelector(
    selectChat,
    (state: ChatState) => state.messages
)
export const selectLoadStatus = createSelector(
    selectChat,
    (state: ChatState) => state.loadStatus
)