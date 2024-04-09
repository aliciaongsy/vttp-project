import { Injectable, inject } from "@angular/core";
import { Actions, act, createEffect, ofType } from "@ngrx/effects";
import { AppState } from "../app.state";
import { Store } from "@ngrx/store";
import { TaskService } from "../../service/task.service";
import { addWorkspace, changeStatus, createChatRoom, deleteWorkspace, joinChatRoom, leaveChatRoom, loadChats, loadOutstandingTasks, loadTaskSummary, loadUserProfile, loadWorkspaces, updateProfile } from "./user.actions";
import { from, map, switchMap, withLatestFrom } from "rxjs";
import { selectUser, selectUserDetails } from "./user.selectors";
import { ChatService } from "../../service/chat.service";
import { addTask } from "../tasks/task.actions";
import { UserService } from "../../service/user.service";
import { WebSocketService } from "../../service/websocket.service";
import { enterChatRoom } from "../chat/chat.actions";

@Injectable()
export class UserEffects {
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private taskSvc = inject(TaskService)
    private chatSvc = inject(ChatService)
    private userSvc = inject(UserService)
    private webSocketSvc = inject(WebSocketService)

    loadWorkspaces$ = createEffect(() =>
        this.actions$.pipe(
            ofType(changeStatus, addWorkspace),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                from(this.taskSvc.retrieveWorkspaces(details.id)).pipe(
                    map((value) => loadWorkspaces({ workspaces: value }))
                    // catchError(() => )
                )

            )
        )
    )

    loadChats$ = createEffect(() =>
        this.actions$.pipe(
            ofType(changeStatus, createChatRoom, joinChatRoom),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.chatSvc.getChatList(details.id).pipe(
                    map((value) => loadChats({ chats: value }))
                )
            )
        )
    )

    loadOutstandingTasks$ = createEffect(() =>
        this.actions$.pipe(
            ofType(changeStatus, addTask),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.taskSvc.getAllOutstandingTasks(details.id).pipe(
                    map((value) => loadOutstandingTasks({ tasks: value }))
                )
            )
        )
    )

    loadTaskSummary$ = createEffect(() =>
        this.actions$.pipe(
            ofType(changeStatus),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.taskSvc.getTaskSummary(details.id).pipe(
                    map((value) => loadTaskSummary({ summary: value }))
                )
            )
        )
    )

    addWorkspace$ = createEffect(() =>
        this.actions$.pipe(
            ofType(addWorkspace),
            withLatestFrom(this.store.select(selectUser)),
            switchMap(([action, user]) =>
                this.taskSvc.addWorkspace(user.user.id, action.workspace)
            ),
        ),
        { dispatch: false }
    )

    deleteWorkspace$ = createEffect(() =>
        this.actions$.pipe(
            ofType(deleteWorkspace),
            withLatestFrom(this.store.select(selectUser)),
            switchMap(([action, user]) =>
                this.taskSvc.deleteWorkspace(user.user.id, action.workspace)
            ),
        ),
        { dispatch: false }
    )

    createChatRoom$ = createEffect(() =>
        this.actions$.pipe(
            ofType(createChatRoom),
            switchMap((action) =>
                this.chatSvc.createChatRoom(action.chat)
            ),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.chatSvc.getChatList(details.id).pipe(
                    map((value) => loadChats({ chats: value }))
                )
            )
        ),
    )

    joinChatRoom$ = createEffect(() =>
        this.actions$.pipe(
            ofType(joinChatRoom),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.chatSvc.joinChatRoom(details.id, details.name, action.roomId)
            ),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                
                this.chatSvc.getChatList(details.id).pipe(
                    map((value) => loadChats({ chats: value }))
                )
            )
        ),
    )

    leaveChatRoom$ = createEffect(() =>
        this.actions$.pipe(
            ofType(leaveChatRoom),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.chatSvc.leaveChatRoom(details.id, action.roomId)
            ),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.chatSvc.getChatList(details.id).pipe(
                    map((value) => loadChats({ chats: value }))
                )
            )
        ),
    )

    updateProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(updateProfile),
            withLatestFrom(this.store.select(selectUserDetails)),
            switchMap(([action, details]) =>
                this.userSvc.updateUser(details.id, action.data).pipe(
                    map((value) => loadUserProfile({ currUser: value }))
                )
            )
        )
    )

}