import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FocusSession } from '../model';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class FocusService {

  private http = inject(HttpClient)

  getSessions(id: string, workspace: string){
    return this.http.get<FocusSession[]>(`${URL}/api/${id}/${workspace}/sessions`)
  }

  addSessions(id: string, workspace: string, date: string, duration: number){
    const data = {
      date: date,
      duration: duration
    }
    return this.http.post<any>(`${URL}/api/${id}/${workspace}/session/new`, data)
  }
}
