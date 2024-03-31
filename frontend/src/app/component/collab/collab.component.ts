import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserDetails } from '../../state/user/user.selectors';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatMessage, ChatRoom } from '../../model';
import { ActivatedRoute } from '@angular/router';
import { CollabService } from '../../service/collab.service';

@Component({
  selector: 'app-collab',
  templateUrl: './collab.component.html',
  styleUrl: './collab.component.css'
})
export class CollabComponent implements OnInit, OnDestroy{

  private ngrxStore = inject(Store)
  private messageSvc = inject(MessageService)
  private collabSvc = inject(CollabService)
  private fb = inject(FormBuilder)
  private activatedRoute = inject(ActivatedRoute)

  joinRoomVisible: boolean = false
  createRoomVisible: boolean = false
  roomId!: string
  currentChatRoom!: string

  form!: FormGroup
  types: string[] = ['Public', 'Private']
  messageForm!: FormGroup

  chatList$!: Observable<ChatRoom[]>
  chatList!: ChatRoom[]
  route$!: Subscription
  messageList: any[] = [];

  uid!: string
  name!: string

  ngOnInit(): void {

    this.messageSvc.initSocketConnection()

    this.route$ = this.activatedRoute.params.subscribe(params=>{
      this.currentChatRoom = params['roomId']
      // when a chat room is selected
      if (this.currentChatRoom!=undefined){
        this.messageSvc.joinRoom(this.currentChatRoom)
        // display chat for particular room
      }
    })

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      console.info(value)
      this.messageSvc.name=value.name
      this.name=value.name
      this.uid=value.id
      this.chatList$ = this.collabSvc.getChatList(this.uid).pipe(
        map((value) => {
          console.info(value)
          return [...value]
        })
        )
    })

    this.form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      type: this.fb.control<string>('', [Validators.required])
    })

    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required])
    })
    
    this.listenerMessage()
  }

  ngOnDestroy(): void {
    this.route$.unsubscribe()
    this.messageSvc.disconnect()
  }

  // create new room
  create(){
    this.createRoomVisible = true
  }

  createChannel(){
    // var room = this.form.value as ChatRoom
    // room.ownerId=this.uid
    // room.ownerName=this.name
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
    this.collabSvc.createChatRoom(room)
      .then(() => 
        this.chatList$ = this.collabSvc.getChatList(this.uid)
      )
      .catch((error) => 
          alert(`error: ${error.error}`)
      )
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
    this.collabSvc.joinChatRoom(this.uid, this.roomId)
      .then(() => 
        this.chatList$ = this.collabSvc.getChatList(this.uid)
      )
      .catch((error) => 
        alert(`error: ${error.error}`)
      )
    this.roomId=''
    // if join successfully, add room to list of chats
  }

  sendMessage(){
    const data = this.messageForm.value['message'].trim() as string
    // only send message if it is not empty
    if(data.length!=0){
      const message: ChatMessage = {
        content: data,
        sender: this.name,
        type: 'CHAT'
      }
      this.messageSvc.sendMessage(this.currentChatRoom, message)
    }
    
  }

  listenerMessage() {
    this.messageSvc.getMessageSubject().subscribe((messages: any) => {
      console.info(messages)
      this.messageList = messages.map((item: any)=> ({
        ...item,
        message_side: item.user === this.name ? 'sender': 'receiver'
      }))
    });
  }

}
