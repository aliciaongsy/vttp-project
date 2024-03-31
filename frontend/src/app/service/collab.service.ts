import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ChatRoom } from '../model';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class CollabService {

  private http = inject(HttpClient)

  getChatList(id: string) {
    return this.http.get<ChatRoom[]>(`${URL}/api/${id}/chats`)
  }

  joinChatRoom(userId: string, roomId: string) {
    return firstValueFrom(this.http.post<any>(`${URL}/api/chat/join/${roomId}`, userId))
  }

  createChatRoom(chatRoom: ChatRoom) {
    return firstValueFrom(this.http.post<any>(`${URL}/api/chat/create`, chatRoom))
  }

}
