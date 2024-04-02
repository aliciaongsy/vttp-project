import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage } from '../model';
import { BehaviorSubject } from 'rxjs';

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
  msg = [];

  name!: string
  newmessage!: string;

  initSocketConnection() {
    // const ws = 'http://localhost:8080/socket'
    const socket = new SockJS('//localhost:8080/socket');
    this.stompClient = Stomp.over(socket);

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Handle error, such as displaying an error message to the user
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      // Perform cleanup tasks, such as resetting UI state or re-establishing the connection
    };

  }

  joinRoom(roomId: string) {
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/${roomId}`, (messages: any) => {
        const messageContent = JSON.parse(messages.body)
        console.info(messageContent)

        const currentMessage = this.messageSubject.getValue();
        currentMessage.push(messageContent);

        this.messageSubject.next(currentMessage);
      })
  
      this.stompClient.activate()
    })
  }

  firstJoined(roomId: string){
    if (this.stompClient && this.stompClient.connected) {
      // tell your name to the server - send to @MessageMapping path
      // only send this when the user FIRST join
      this.stompClient.send(`/app/chat/adduser/${roomId}`,
        {},
        JSON.stringify({ content: `${this.name} has joined the chat`, sender: this.name, type: 'JOIN' })
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
        console.log('Disconnected from WebSocket');
      });
    }
  }

}
