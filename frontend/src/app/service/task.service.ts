import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { Task } from '../model';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private http = inject(HttpClient)

  retrieveWorkspaces(id: string){
    const params = new HttpParams()
      .set('id', id)

    // endpoint: localhost:8080/api/workspace/all?id=
    return firstValueFrom(this.http.get<string[]>(`${URL}/api/workspace/all`, {params}))
  }

  addWorkspace(id: string, workspace: string){
    const w = {
      uid: id,
      workspace_name: workspace
    }

    // endpoint: localhost:8080/api/workspace/create
    return firstValueFrom(this.http.post<any>(`${URL}/api/workspace/create`, w))
  }

  getTasksOfWorkspace(id: string, workspace: string){
    // endpoint: localhost:8080/api/{id}/{workspace}/tasks
    return this.http.get<Task[]>(`${URL}/api/${id}/${workspace}/tasks`)
  }

  addTasksToWorkspace(id: string, workspace: string, task: Task){
    // endpoint: localhost:8080/api/{id}/{workspace}/task/new
    return firstValueFrom(this.http.post<any>(`${URL}/api/${id}/${workspace}/task/new`, task))
  }

  updateCompleteStatus(id: string, workspace: string, taskId: string, completed: boolean){
    const payload = {
      taskId: taskId,
      completed: completed
    }
    return firstValueFrom(this.http.put<any>(`${URL}/api/${id}/${workspace}/task/complete`, payload))
  }

  deleteTask(id: string, workspace: string, taskId: string){
    return firstValueFrom(this.http.delete<any>(`${URL}/api/${id}/${workspace}/task/delete/${taskId}`))
  }

  updateTask(id: string, workspace: string, taskId: string, task: Task){
    return firstValueFrom(this.http.put<any>(`${URL}/api/${id}/${workspace}/task/update/${taskId}`, task))
  }
}
