import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Event } from '../model';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  private http = inject(HttpClient)

  getEventsOfWorkspace(id: string, workspace: string){
    // endpoint: localhost:8080/api/{id}/{workspace}/events
    return this.http.get<Event[]>(`${URL}/api/${id}/${workspace}/events`)
  }

  addEventToWorkspace(id: string, workspace: string, event: Event[]){
    // endpoint: localhost:8080/api/{id}/{workspace}/event/new
    return this.http.post<any>(`${URL}/api/${id}/${workspace}/event/new`, event)
  }
}
