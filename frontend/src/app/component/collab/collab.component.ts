import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectError, selectStatus, selectUserDetails } from '../../state/user/user.selectors';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { WebSocketService } from '../../service/websocket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatDetails, ChatMessage, ChatRoom } from '../../model';
import { ActivatedRoute, Router } from '@angular/router';
import { createChatRoom, joinChatRoom, leaveChatRoom } from '../../state/user/user.actions';
import { enterChatRoom, loadAllMessages, loadChatRoom, sendMessage } from '../../state/chat/chat.actions';
import { selectChat, selectChatRoom, selectMessages, selectName } from '../../state/chat/chat.selector';
import { ChatService } from '../../service/chat.service';
import { MenuItem, MessageService } from 'primeng/api';


@Component({
  selector: 'app-collab',
  templateUrl: './collab.component.html',
  styleUrl: './collab.component.css',
  providers: [MessageService]
})
export class CollabComponent implements OnInit, OnDestroy {

  private ngrxStore = inject(Store)
  private messageSvc = inject(WebSocketService)
  private chatSvc = inject(ChatService)
  private fb = inject(FormBuilder)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)

  // dialogs
  joinRoomVisible: boolean = false
  createRoomVisible: boolean = false
  publicChatVisible: boolean = false
  chatRoomDetailsVisible: boolean = false
  leaveChatVisible: boolean = false

  // roomId!: string
  currentChatRoomId!: string
  currentChatRoom!: string

  // forms
  form!: FormGroup
  types: string[] = ['Public', 'Private']
  messageForm!: FormGroup
  searchForm!: FormGroup
  joinForm!: FormGroup

  // data
  chatList$!: Observable<ChatDetails[]>
  chatName$!: Observable<String>
  route$!: Subscription
  messageSub$!: Subscription
  messageList: any[] = [];
  loadStatus$!: Subscription
  searchResult$!: Observable<ChatDetails[]>
  chatRoomDetails$!: Observable<ChatRoom>
  errorSub$!: Subscription
  error!: string

  // menu 
  items!: MenuItem[];

  uid!: string
  name!: string
  loginSub$!: Subscription
  loginStatus!: boolean

  first: number = 0;
  rows: number = 5;

  ngOnInit(): void {
    this.loginSub$ = this.ngrxStore.select(selectStatus)
      .subscribe((value) => this.loginStatus = value)

    this.messageSvc.initSocketConnection()

    this.route$ = this.activatedRoute.params.subscribe(params => {
      this.currentChatRoomId = params['roomId']

      if (this.currentChatRoomId && this.loginStatus == true) {
        this.messageSvc.joinRoom(this.currentChatRoomId)
        this.ngrxStore.dispatch(loadAllMessages({ roomId: this.currentChatRoomId }))
        this.loadStatus$ = this.ngrxStore.select(selectChat).subscribe(
          (value) => {
            if (value.loadStatus === 'complete' && value.roomId === this.currentChatRoomId) {
              this.messageSub$ = this.ngrxStore.select(selectMessages).subscribe(
                (value) => {
                  this.messageList = value
                }
              )
            }
          }
        )
        this.ngrxStore.dispatch(loadChatRoom({ roomId: this.currentChatRoomId }))
      }
    })

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      this.messageSvc.name = value.name
      this.name = value.name
      this.uid = value.id
    })

    this.chatList$ = this.ngrxStore.select(selectChats)
    this.chatName$ = this.ngrxStore.select(selectName)

    this.form = this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      type: this.fb.control<string>('', [Validators.required])
    })

    this.messageForm = this.fb.group({
      message: this.fb.control<string>('', [Validators.required])
    })

    this.searchForm = this.fb.group({
      search: this.fb.control<string>('', [Validators.required])
    })

    this.joinForm = this.fb.group({
      id: this.fb.control<string>('', [Validators.required])
    })

    this.listenForMessage()

    this.items = [
      {
        label: 'Info',
        icon: 'pi pi-info-circle',
        command: () => {
          this.loadDetails()
        }

      },
      {
        label: 'Leave',
        icon: 'pi pi-sign-out',
        command: () => {
          this.leaveChatVisible = true
        }
      }
    ]

    this.errorSub$ = this.ngrxStore.select(selectError).subscribe(
      (value) => {
        this.error = value
        console.info(value)
        if (value.length>0) {
          alert('error: room does not exist')
        }
      })
  }

  ngOnDestroy(): void {
    this.loginSub$.unsubscribe()
    this.route$.unsubscribe()
    this.messageSvc.disconnect()
    if (this.messageSub$) {
      this.messageSub$.unsubscribe();
    }
    if (this.loadStatus$) {
      this.loadStatus$.unsubscribe()
    }
    this.errorSub$.unsubscribe()
  }

  selectedChat(chatroom: string) {
    console.info('selected chatroom')
    this.currentChatRoom = chatroom
    this.ngrxStore.dispatch(enterChatRoom({ name: this.currentChatRoom }))
  }

  // create new room
  create() {
    this.createRoomVisible = true
  }

  createChannel() {
    var users: string[] = []
    users.push(this.uid)
    const room: ChatRoom = {
      ownerId: this.uid,
      ownerName: this.name,
      name: this.form.value['name'],
      users: users,
      usernames: [this.form.value['name']],
      userCount: 1,
      createDate: new Date().getTime(),
      type: this.form.value['type']
    }
    this.ngrxStore.dispatch(createChatRoom({ chat: room }))
    this.form.reset()
    this.createRoomVisible = false
  }

  // join room dialog 
  join() {
    this.joinRoomVisible = true
  }

  // join room
  joinRoom() {
    this.joinRoomVisible = false
    this.messageSvc.newJoin = true
    const roomId = this.joinForm.value['id']
    this.messageSvc.joinRoom(roomId);
    this.ngrxStore.dispatch(joinChatRoom({ id: this.uid, roomId }))
    this.joinForm.reset()
    if(this.error.length==0){
      this.router.navigate([`/chat/${roomId}`])
    }
  }

  // search chat room dialog
  findPublicChatRoom() {
    this.joinRoomVisible = false
    this.publicChatVisible = true
  }

  searchRoom() {
    const search: string = this.searchForm.value['search']
    this.searchResult$ = this.chatSvc.getPublicChats(search)
    this.searchForm.reset()
  }

  joinPublicRoom(roomId: string) {
    this.messageSvc.joinRoom(roomId);
    this.ngrxStore.dispatch(joinChatRoom({ id: this.uid, roomId }))
  }

  sendMessage() {
    const data = this.messageForm.value['message'].trim() as string
    // only send message if it is not empty
    if (data.length != 0) {
      const message: ChatMessage = {
        content: data,
        sender: this.name,
        type: 'CHAT',
        timestamp: new Date().getTime()
      }
      this.ngrxStore.dispatch(sendMessage({ roomId: this.currentChatRoomId, message }))
    }
    this.messageForm.reset()
  }

  listenForMessage() {
    this.messageSvc.getMessageSubject().subscribe((messages: ChatMessage[]) => {
      this.ngrxStore.dispatch(loadAllMessages({ roomId: this.currentChatRoomId }))
      if (messages[0] != undefined) {
        if (messages[0].type == 'JOIN' || messages[0].type == 'LEAVE') {
          this.ngrxStore.dispatch(loadChatRoom({ roomId: this.currentChatRoomId }))
        }
      }
    });
  }

  onPageChange(event: any) {
    console.info(event)
    this.first = event.first;
    this.rows = event.rows;
  }

  loadDetails() {
    this.chatRoomDetailsVisible = true
    this.chatRoomDetails$ = this.ngrxStore.select(selectChatRoom)
  }

  closeDialog() {
    this.leaveChatVisible = false
  }

  leaveRoom() {
    this.ngrxStore.dispatch(leaveChatRoom({ id: this.uid, roomId: this.currentChatRoomId }))
    this.leaveChatVisible = false
    this.messageSvc.leaveRoom(this.currentChatRoomId)
    this.router.navigate(['/collab'])
  }
}
