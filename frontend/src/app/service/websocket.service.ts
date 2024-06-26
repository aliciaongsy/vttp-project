import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../model';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: any;
  private messageSubject: BehaviorSubject<ChatMessage[]> = new BehaviorSubject<ChatMessage[]>([]);

  constructor() {
    this.initSocketConnection();
  }

  name!: string
  newJoin: boolean = false

  initSocketConnection() {
    const socket = new SockJS(`${URL}/socket`);

    this.stompClient = Stomp.over(socket);

    socket.onerror = (error) => {
      console.error('websocket error:', error);
    };

    socket.onclose = (event) => {
      console.log('websocket connection closed:', event);
    };

  }

  joinRoom(roomId: string) {
    console.info(this.newJoin)
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
        const messageContent = JSON.parse(messages.body)
        console.info(messageContent)

        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);

        this.messageSubject.next(currentMessage);
      })

      this.stompClient.activate()
      if (this.newJoin) {
        console.info('first join')
        this.firstJoined(roomId)
        this.newJoin = false
      }
    })

    if(this.stompClient.connected){
      // change sub
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
        const messageContent = JSON.parse(messages.body)
        console.info(messageContent)

        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);

        this.messageSubject.next(currentMessage);
      })

      this.stompClient.activate()
      if (this.newJoin) {
        console.info('first join')
        this.firstJoined(roomId)
        this.newJoin = false
      }
    }
  }

  firstJoined(roomId: string) {
    if (this.stompClient && this.stompClient.connected) {
      // tell your name to the server - send to @MessageMapping path
      // only send this when the user FIRST join
      this.stompClient.send(`/app/chat/sendmessage/${roomId}`,
        {},
        JSON.stringify({ content: `${this.name} has joined the chat`, sender: this.name, type: 'JOIN', timestamp: new Date().getTime() })
      )
    }
  }

  leaveRoom(roomId: string) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(`/app/chat/sendmessage/${roomId}`,
        {},
        JSON.stringify({ content: `${this.name} has left the chat`, sender: this.name, type: 'LEAVE', timestamp: new Date().getTime() })
      )
    }
  }

  sendMessage(roomId: string, chatMessage: ChatMessage) {
    // perform operations only if connection is up
    if (this.stompClient && this.stompClient.connected) {
      // send to @MessageMapping path
      this.stompClient.send(`/app/chat/sendmessage/${roomId}`, {}, JSON.stringify(chatMessage));
    }

  }

  getMessageSubject() {
    return this.messageSubject.asObservable();
  }

  disconnect() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('disconnected from websocket');
      });
    }
  }

}
