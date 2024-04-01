import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectChats, selectUserDetails } from '../../state/user/user.selectors';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatDetails, ChatMessage, ChatRoom } from '../../model';
import { ActivatedRoute } from '@angular/router';
import { createChatRoom, joinChatRoom } from '../../state/user/user.actions';
import { loadAllMessages, sendMessage } from '../../state/chat/chat.actions';
import { selectChat, selectMessages } from '../../state/chat/chat.selector';

@Component({
  selector: 'app-collab',
  templateUrl: './collab.component.html',
  styleUrl: './collab.component.css'
})
export class CollabComponent implements OnInit, OnDestroy{

  private ngrxStore = inject(Store)
  private messageSvc = inject(MessageService)
  private fb = inject(FormBuilder)
  private activatedRoute = inject(ActivatedRoute)

  joinRoomVisible: boolean = false
  createRoomVisible: boolean = false
  roomId!: string
  currentChatRoom!: string

  form!: FormGroup
  types: string[] = ['Public', 'Private']
  messageForm!: FormGroup

  chatList$!: Observable<ChatDetails[]>
  route$!: Subscription
  messageSub$!: Subscription
  messageList: any[] = [];
  loadStatus$!: Subscription

  uid!: string
  name!: string

  ngOnInit(): void {

    this.messageSvc.initSocketConnection()

    this.route$ = this.activatedRoute.params.subscribe(params=>{
      this.currentChatRoom = params['roomId']

      if (this.currentChatRoom){
        this.messageSvc.joinRoom(this.currentChatRoom)
        this.ngrxStore.dispatch(loadAllMessages({roomId: this.currentChatRoom}))
        this.loadStatus$ = this.ngrxStore.select(selectChat).subscribe(
          (value) => {
            if (value.loadStatus === 'complete'&&value.roomId === this.currentChatRoom){
              this.messageSub$=this.ngrxStore.select(selectMessages).subscribe(
                (value) => this.messageList = value
              )
            }
          }
        )
      }
    })

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      console.info(value)
      this.messageSvc.name=value.name
      this.name=value.name
      this.uid=value.id
    })

    this.chatList$ = this.ngrxStore.select(selectChats)

    this.form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      type: this.fb.control<string>('', [Validators.required])
    })

    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required])
    })
    
    this.listenForMessage()
  }

  ngOnDestroy(): void {
    this.route$.unsubscribe()
    this.messageSvc.disconnect()
    if (this.messageSub$) {
      this.messageSub$.unsubscribe();
    }
    if(this.loadStatus$){
      this.loadStatus$.unsubscribe()
    }
  }

  // create new room
  create(){
    this.createRoomVisible = true
  }

  createChannel(){
    var users: string[] = []
    users.push(this.uid)
    const room: ChatRoom = {
      ownerId: this.uid,
      ownerName: this.name,
      name: this.form.value['name'],
      users: users,
      userCount: 1,
      createDate: new Date().getTime(),
      type: this.form.value['type']
    }
    this.ngrxStore.dispatch(createChatRoom({chat: room}))
    this.form.reset()
    this.createRoomVisible = false
  }

  // join existing room
  join(){
    this.joinRoomVisible = true
  }

  joinRoom(){
    this.joinRoomVisible = false
    this.messageSvc.joinRoom(this.roomId);
    this.ngrxStore.dispatch(joinChatRoom({id: this.uid, roomId: this.roomId}))
    this.roomId=''
  }

  sendMessage(){
    const data = this.messageForm.value['message'].trim() as string
    // only send message if it is not empty
    if(data.length!=0){
      const message: ChatMessage = {
        content: data,
        sender: this.name,
        type: 'CHAT',
        timestamp: new Date().getTime()
      }
      this.ngrxStore.dispatch(sendMessage({roomId: this.currentChatRoom, message}))
    }
    this.messageForm.reset()
  }

  listenForMessage() {
    this.messageSvc.getMessageSubject().subscribe((messages: ChatMessage[]) => {
      this.ngrxStore.dispatch(loadAllMessages({roomId: this.currentChatRoom}))
    });
  }
}
