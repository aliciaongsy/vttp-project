import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Event, Task } from '../model';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  private http = inject(HttpClient)

  getEventsOfWorkspace(id: string ){
    // endpoint: localhost:8080/api/{id}/{workspace}/events
    return this.http.get<Event[]>(`${URL}/api/${id}/events`)
  }

  addEventToWorkspace(id: string, event: Event[]){
    // endpoint: localhost:8080/api/{id}/{workspace}/event/new
    return this.http.post<any>(`${URL}/api/${id}/event/new`, event)
  }

  getAllOutstandingTasks(id: string, workspaces: string[]){
    return this.http.get<Task[]>(`${URL}/api/${id}/${workspaces}/outstandingtasks`)
  }

}
