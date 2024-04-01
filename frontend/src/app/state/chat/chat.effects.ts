import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AppState } from "../app.state";
import { loadAllMessages, loadAllMessagesFromService, sendMessage } from "./chat.actions";
import { map, switchMap, withLatestFrom } from "rxjs";
import { selectRoomId } from "./chat.selector";
import { ChatService } from "../../service/chat.service";
import { MessageService } from "../../service/message.service";

@Injectable()
export class ChatEffects {
    private actions$ = inject(Actions)
    private store = inject(Store<AppState>)
    private chatSvc = inject(ChatService)
    private messageSvc = inject(MessageService)

    sendMessage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(sendMessage),
            withLatestFrom(this.store.select(selectRoomId)),
            map(([action, roomId]) =>
                this.messageSvc.sendMessage(roomId, action.message)
            )
        ),
        { dispatch: false }
    )

    loadMessage$ = createEffect(() => 
        this.actions$.pipe(
            ofType(loadAllMessages),
            withLatestFrom(this.store.select(selectRoomId)),
            switchMap(([action, roomId]) => 
                this.chatSvc.getAllMessages(roomId).pipe(
                    map((value) => loadAllMessagesFromService({messages: value})) 
                )
            )
        )
    )
}