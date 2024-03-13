import { Component, OnInit, inject } from '@angular/core';
import { DbStore } from '../service/db.store';
import { Observable, firstValueFrom } from 'rxjs';
import { UserDetails } from '../model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  private store = inject(DbStore)

  loginStatus!: Observable<boolean>
  user!: Observable<UserDetails>
  items!: any

  ngOnInit(): void {
    this.loginStatus = this.store.getStatus
    this.loginStatus.subscribe((value) => console.info(value))
    this.user = this.store.getUser

    this.items = [
      {
          label: 'Account',
          icon: 'pi pi-user',
          routerLink: ['/account']
      },
      {
          label: 'Sign out',
          icon: 'pi pi-sign-out',
          command: () => {
            this.store.signOut()
          }
      }
  ];
  }
}
