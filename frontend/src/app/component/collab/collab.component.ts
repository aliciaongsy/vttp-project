import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectUserDetails } from '../../state/user/user.selectors';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatDetails, ChatMessage, ChatRoom } from '../../model';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../service/chat.service';
import { createChatRoom, getChatList, joinChatRoom } from '../../state/user/user.actions';

@Component({
  selector: 'app-collab',
  templateUrl: './collab.component.html',
  styleUrl: './collab.component.css'
})
export class CollabComponent implements OnInit, OnDestroy{

  private ngrxStore = inject(Store)
  private messageSvc = inject(MessageService)
  private chatSvc = inject(ChatService)
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
  chatList!: ChatRoom[]
  route$!: Subscription
  messageSub$!: Subscription
  messageList: any[] = [];

  uid!: string
  name!: string

  ngOnInit(): void {

    this.messageSvc.initSocketConnection()

    this.route$ = this.activatedRoute.params.subscribe(params=>{
      this.currentChatRoom = params['roomId']

      if (this.currentChatRoom){
        this.messageSvc.joinRoom(this.currentChatRoom)
        this.messageSub$ = this.chatSvc.getAllMessages(this.currentChatRoom).subscribe(
          (value) => {
          console.info(value)
          this.messageList = value
        })
      }
    })

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      console.info(value)
      this.messageSvc.name=value.name
      this.name=value.name
      this.uid=value.id
      // this.chatList$ = this.chatSvc.getChatList(this.uid).pipe(
      //   map((value) => {
      //     console.info(value)
      //     return [...value]
      //   })
      // )
    })

    this.chatList$ = this.ngrxStore.select(selectChats)

    this.form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      type: this.fb.control<string>('', [Validators.required])
    })

    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required])
    })
    
    // this.listenForMessage()
  }

  ngOnDestroy(): void {
    this.route$.unsubscribe()
    this.messageSvc.disconnect()
    if (this.messageSub$) {
      this.messageSub$.unsubscribe();
    }
  }

  // create new room
  create(){
    this.createRoomVisible = true
  }

  createChannel(){
    var users: string[] = []
    users.push(this.name)
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
    // this.chatSvc.createChatRoom(room)
    //   // .then(() => 
    //   //   this.chatList$ = this.chatSvc.getChatList(this.uid)
    //   // )
    //   .catch((error) => 
    //       alert(`error: ${error.error}`)
    //   )
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
    // this.chatSvc.joinChatRoom(this.uid, this.roomId)
    //   .then(() => {
    //     // if join successfully, add room to list of chats
    //     // this.chatList$ = this.chatSvc.getChatList(this.uid)
    //     this.ngrxStore.dispatch(getChatList())
    //     this.messageSvc.firstJoined(this.roomId)
    //   })
    //   .catch((error) => 
    //     alert(`error: ${error.error}`)
    //   )
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
      this.messageSvc.sendMessage(this.currentChatRoom, message)
    }
    this.messageForm.reset()
  }

  // listenForMessage() {
  //   this.messageSvc.getMessageSubject().subscribe((messages: ChatMessage[]) => {
  //     for (var m of messages){
  //       this.messageList.push(m)
  //     }
  //     this.messageList = messages.map((item: any)=> ({
  //       ...item,
  //       // message_side: item.user === this.name ? 'sender': 'receiver'
  //     }))
  //   });
  // }

}
