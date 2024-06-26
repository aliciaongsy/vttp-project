import { HttpClient, HttpParams } from '@angular/common/http';
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

  getChatRoomDetails(roomId:string): Observable<ChatRoom> {
    return this.http.get<ChatRoom>(`${URL}/api/chat/details/${roomId}`)
  }

  checkExistingChatroom(roomId:string): Observable<ChatRoom> {
    return this.http.get<ChatRoom>(`${URL}/api/chat/existing/${roomId}`)
  }

  joinChatRoom(userId: string, name: string, roomId: string): Observable<any> {
    const payload = {
      id: userId,
      name: name
    }
    return this.http.post<any>(`${URL}/api/chat/join/${roomId}`, payload)
  }

  createChatRoom(chatRoom: ChatRoom): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${URL}/api/chat/create`, chatRoom))
  }
  
  leaveChatRoom(id: string, name: string, roomId: string){
    const params = new HttpParams()
      .set("name", name)
    return firstValueFrom(this.http.delete<any>(`${URL}/api/${id}/chat/leave/${roomId}`,{params}))
  }

  getAllMessages(roomId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${URL}/api/chat/messages/${roomId}`)
  }

  checkIfUserJoined(id: string, roomId: string){
    const params = new HttpParams()
      .set("id", id)
    return this.http.get<ChatDetails[]>(`${URL}/api/chatroom/${roomId}/exist`, {params})
  }

  getPublicChats(name: string): Observable<ChatDetails[]>{
    const params = new HttpParams()
      .set("name", name)
    return this.http.get<ChatDetails[]>(`${URL}/api/chats/public`, {params})
  }

}
