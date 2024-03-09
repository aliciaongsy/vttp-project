import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NewUser } from '../model';
import { firstValueFrom } from 'rxjs';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient)

  checkUserExist(email: string){
    // endpoint: localhost:8080/exist/${email}
    return firstValueFrom(this.http.get<any>(`${URL}/exist/${email}`))
  }

  createUser(user: NewUser){
    // endpoint: localhost:8080/new
    return firstValueFrom(this.http.post<any>(`${URL}/new`, user))
  }
}
