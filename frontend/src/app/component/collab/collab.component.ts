import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectChats, selectUserDetails } from '../../state/user/user.selectors';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { MessageService } from '../../service/message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatDetails, ChatMessage, ChatRoom } from '../../model';
import { ActivatedRoute } from '@angular/router';
import { createChatRoom, joinChatRoom } from '../../state/user/user.actions';
import { enterChatRoom, loadAllMessages, sendMessage } from '../../state/chat/chat.actions';
import { selectChat, selectMessages, selectName } from '../../state/chat/chat.selector';
import { Scroller } from 'primeng/scroller';
import { ChatService } from '../../service/chat.service';
import { MenuItem } from 'primeng/api';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-collab',
  templateUrl: './collab.component.html',
  styleUrl: './collab.component.css'
})
export class CollabComponent implements OnInit, OnDestroy {

  @ViewChild('sc') sc!: Scroller;

  private ngrxStore = inject(Store)
  private messageSvc = inject(MessageService)
  private chatSvc = inject(ChatService)
  private fb = inject(FormBuilder)
  private activatedRoute = inject(ActivatedRoute)

  joinRoomVisible: boolean = false
  createRoomVisible: boolean = false
  publicChatVisible: boolean = false

  // roomId!: string
  currentChatRoomId!: string
  currentChatRoom!: string

  form!: FormGroup
  types: string[] = ['Public', 'Private']
  messageForm!: FormGroup
  searchForm!: FormGroup
  joinForm!: FormGroup

  chatList$!: Observable<ChatDetails[]>
  chatName$!: Observable<String>
  route$!: Subscription
  messageSub$!: Subscription
  messageList: any[] = [];
  loadStatus$!: Subscription
  searchResult$!: Observable<ChatDetails[]>

  items!: MenuItem[];

  uid!: string
  name!: string

  first: number = 0;
  rows: number = 5;

  ngOnInit(): void {

    this.messageSvc.initSocketConnection()

    this.route$ = this.activatedRoute.params.subscribe(params => {
      this.currentChatRoomId = params['roomId']

      if (this.currentChatRoomId) {
        this.messageSvc.joinRoom(this.currentChatRoomId)
        this.ngrxStore.dispatch(loadAllMessages({ roomId: this.currentChatRoomId }))
        this.loadStatus$ = this.ngrxStore.select(selectChat).subscribe(
          (value) => {
            if (value.loadStatus === 'complete' && value.roomId === this.currentChatRoomId) {
              this.messageSub$ = this.ngrxStore.select(selectMessages).subscribe(
                (value) => {
                  console.info(value)
                  this.messageList = value
                }
              )
            }
          }
        )
      }
    })

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      console.info(value)
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
                label: 'Options',
                items: [
                    {
                        label: 'Update',
                        icon: 'pi pi-refresh',
                        
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-times',
                        
                    }
                ]
            }
          ]
  }

  ngOnDestroy(): void {
    this.route$.unsubscribe()
    this.messageSvc.disconnect()
    if (this.messageSub$) {
      this.messageSub$.unsubscribe();
    }
    if (this.loadStatus$) {
      this.loadStatus$.unsubscribe()
    }
  }

  selectedChat(chatroom: string) {
    console.info('selected chatroom')
    this.currentChatRoom = chatroom
    this.ngrxStore.dispatch(enterChatRoom({ chatRoom: this.currentChatRoom }))
    console.info(this.currentChatRoom)
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
      userCount: 1,
      createDate: new Date().getTime(),
      type: this.form.value['type']
    }
    this.ngrxStore.dispatch(createChatRoom({ chat: room }))
    this.form.reset()
    this.createRoomVisible = false
  }

  // join existing room
  join() {
    this.joinRoomVisible = true
  }

  joinRoom() {
    this.joinRoomVisible = false
    const roomId = this.joinForm.value['id']
    this.messageSvc.joinRoom(roomId);
    this.ngrxStore.dispatch(joinChatRoom({ id: this.uid, roomId }))
    this.joinForm.reset()
  }

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
    });
  }

  onPageChange(event: any) {
    console.info(event)
    this.first = event.first;
    this.rows = event.rows;
  }
}
