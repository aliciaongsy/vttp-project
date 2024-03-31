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
      // tell your name to the server - send to @MessageMapping path
      this.stompClient.send(`/app/chat/adduser/${roomId}`,
        {},
        JSON.stringify({ sender: this.name, type: 'JOIN' })
      )

      this.stompClient.activate()
    })
  }

  sendMessage(roomId: string, chatMessage: ChatMessage) {
    if (this.stompClient && this.stompClient.connected) {
      // perform operations only if connection is up
      console.info('send message')

      // send to @MessageMapping path
      this.stompClient.send(`/app/chat/sendmessage/${roomId}`, {}, JSON.stringify(chatMessage));
    }
    
  }

  getMessageSubject() {
    console.info('message subject')
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
