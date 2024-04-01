import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ChatDetails, ChatMessage, ChatRoom } from '../model';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private http = inject(HttpClient)

  getChatList(id: string): Observable<ChatDetails[]> {
    return this.http.get<ChatDetails[]>(`${URL}/api/${id}/chats`)
  }

  joinChatRoom(userId: string, name: string, roomId: string): Promise<any> {
    const payload = {
      id: userId,
      name: name
    }
    return firstValueFrom(this.http.post<any>(`${URL}/api/chat/join/${roomId}`, payload))
  }

  createChatRoom(chatRoom: ChatRoom): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${URL}/api/chat/create`, chatRoom))
  }

  getAllMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${URL}/api/chat/messages/${roomId}`)
  }

}
