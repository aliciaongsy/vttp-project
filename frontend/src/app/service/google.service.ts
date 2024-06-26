import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Event } from '../model';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private http = inject(HttpClient)

  getAuthorisationPage(id: string): Observable<any>{
    const params = new HttpParams().set("id", id)
    return this.http.get<any>(`${URL}/api/google/auth/login`, { params })
  }

  getStatus(){
    return this.http.get<any>(`${URL}/api/google/auth/status`)
  }

  getEvents(){
    return this.http.get<Event[]>(`${URL}/api/google/events`)
  }

  createEvent(event: Event){
    return firstValueFrom(this.http.post<any>(`${URL}/api/google/event/create`, event))
  }

  updateEvent(event: Event){
    return firstValueFrom(this.http.put<any>(`${URL}/api/google/event/update`, event))
  }

  deleteEvent(id: string){
    return firstValueFrom(this.http.delete<any>(`${URL}/api/google/event/delete/${id}`))
  }

  revokeToken(){
    return firstValueFrom(this.http.get<any>(`${URL}/api/google/auth/token/revoke`))
  }

}
