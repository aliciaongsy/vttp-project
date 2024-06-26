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
    return this.http.get<string[]>(`${URL}/api/workspace/all`, {params})
  }

  addWorkspace(id: string, workspace: string){
    const w = {
      uid: id,
      workspace_name: workspace
    }

    // endpoint: localhost:8080/api/workspace/create
    return firstValueFrom(this.http.post<any>(`${URL}/api/workspace/create`, w))
  }

  deleteWorkspace(id: string, workspace: string){
    return firstValueFrom(this.http.delete<any>(`${URL}/api/${id}/workspace/delete/${workspace}`))
  }

  getTasksOfWorkspace(id: string, workspace: string){
    // endpoint: localhost:8080/api/{id}/{workspace}/tasks
    return this.http.get<Task[]>(`${URL}/api/${id}/${workspace}/tasks`)
  }

  addTasksToWorkspace(id: string, workspace: string, task: Task){
    // endpoint: localhost:8080/api/{id}/{workspace}/task/new
    return this.http.post<any>(`${URL}/api/${id}/${workspace}/task/new`, task)
  }

  updateCompleteStatus(id: string, workspace: string, taskId: string, completed: boolean){
    const payload = {
      taskId: taskId,
      completed: completed
    }
    return this.http.put<any>(`${URL}/api/${id}/${workspace}/task/complete`, payload)
  }

  deleteTask(id: string, workspace: string, taskId: string, completed: boolean){
    const params = new HttpParams()
      .set("completed", completed);
    
    return this.http.delete<any>(`${URL}/api/${id}/${workspace}/task/delete/${taskId}`, { params })
  }

  updateTask(id: string, workspace: string, taskId: string, task: Task, statusChange: boolean){
    const params = new HttpParams()
      .set("completeStatusChange", statusChange);
    return this.http.put<any>(`${URL}/api/${id}/${workspace}/task/update/${taskId}`, task, { params })
  }

  getAllOutstandingTasks(id: string){
    return this.http.get<Task[]>(`${URL}/api/${id}/tasks/outstanding`)
  }

  getTaskSummary(id: string){
    return this.http.get<any>(`${URL}/api/${id}/tasks/summary`)
  }

  getUpdateCount(){
    return this.http.get<any>(`${URL}/api/telegram/updates`)
  }

  updateCount(count: number){
    const params = new HttpParams()
      .set("updateCount", count);

    return firstValueFrom(this.http.get<any>(`${URL}/api/telegram/updated`, { params }))
  }
}
