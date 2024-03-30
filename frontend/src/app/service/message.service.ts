import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../model';
import { BehaviorSubject } from 'rxjs';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private stompClient: any;
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);

  constructor() {
    this.initSocketConnection();
  }
  msg = [];

  name!: string
  newmessage!: string;

  initSocketConnection() {
    // const ws = 'http://localhost:8080/socket'
    const socket = new SockJS('//localhost:8080/socket');
    this.stompClient = Stomp.over(socket);

    // this.stompClient = new Client({
    //   webSocketFactory: () => socket,
    //   debug: (msg: string) => console.log(msg)
    // })
  }

  joinRoom(roomId: string){
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
        const messageContent = JSON.parse(messages.body)
        console.info(messageContent)

        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);

        this.messageSubject.next(currentMessage);
      })
      // tell your name to the server
      this.stompClient.send("/app/chat/adduser",
        {},
        JSON.stringify({sender: this.name, type: 'JOIN'})
      )
    })
  }

  sendMessage(roomId: string, chatMessage: ChatMessage) {
    console.info('send message')
    this.stompClient.send(`/app/chat/topic/${roomId}`, {}, JSON.stringify(chatMessage));
  }

  getMessageSubject(){
    return this.messageSubject.asObservable();
  }

  disconnect(){
    this.stompClient.deactivate()
  }

}
