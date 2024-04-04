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
    return this.http.get<any>(`${URL}/google/auth/login`, { params })
  }

  getStatus(){
    return this.http.get<any>(`${URL}/google/auth/status`)
  }

  getEvents(){
    return firstValueFrom(this.http.get<Event[]>(`${URL}/google/events`))
  }

  createEvent(event: Event){
    return firstValueFrom(this.http.post<any>(`${URL}/google/event/create`, event))
  }

}
