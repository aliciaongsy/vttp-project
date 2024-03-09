import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NewUser } from '../model';
import { firstValueFrom } from 'rxjs';

const URL = environment.url

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient)

  checkUserExist(email: string){
    // endpoint: localhost:8080/api/user/${email}
    return firstValueFrom(this.http.get<any>(`${URL}/api/user/${email}`))
  }

  checkLoginDetails(email: string, password: string){
    // will the password be exposed?
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)

    // endpoint: localhost:8080/api/login?email=&password=
    return firstValueFrom(this.http.get<any>(`${URL}/api/login`, { params }))
  }

  createUser(user: NewUser){
    // endpoint: localhost:8080/api/register
    return firstValueFrom(this.http.post<any>(`${URL}/api/register`, user))
  }
}
