import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { UserState } from "./user.reducer";

export const selectUser = (state: AppState) => state.user
export const selectStatus = createSelector(
    selectUser,
    (state: UserState) => state.login
)
export const selectUserDetails = createSelector(
    selectUser,
    (state: UserState) => state.user
)
export const selectWorkspaces = createSelector(
    selectUser,
    (state: UserState) => state.workspaces
)
export const selectChats = createSelector(
    selectUser,
    (state: UserState) => state.chats
)
export const selectOutstandingTasks = createSelector(
    selectUser,
    (state: UserState) => state.outstandingTasks
)
export const selectTaskSummary = createSelector(
    selectUser,
    (state: UserState) => state.taskSummary
)