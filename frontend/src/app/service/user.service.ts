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
    // endpoint: localhost:8080/exist/${email}
    return firstValueFrom(this.http.get<any>(`${URL}/exist/${email}`))
  }

  checkLoginDetails(email: string, password: string){
    // will the password be exposed?
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)

    // endpoint: localhost:8080/login?email=&password=
    return firstValueFrom(this.http.get<any>(`${URL}/login`, { params }))
  }

  createUser(user: NewUser){
    // endpoint: localhost:8080/register
    return firstValueFrom(this.http.post<any>(`${URL}/register`, user))
  }
}
