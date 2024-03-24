import { Component, OnInit, inject } from '@angular/core';
import { DbStore } from '../service/db.store';
import { Observable, firstValueFrom } from 'rxjs';
import { UserDetails } from '../model';
import { Store } from '@ngrx/store';
import { resetState } from '../state/user/user.actions';
import { selectStatus, selectUserDetails } from '../state/user/user.selectors';
import { resetTaskState } from '../state/tasks/task.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  private store = inject(DbStore)
  private ngrx = inject(Store)
  private router = inject(Router)

  loginStatus!: Observable<boolean>
  user!: Observable<UserDetails>
  items!: any

  ngOnInit(): void {
    // this.loginStatus = this.store.getStatus
    // this.loginStatus.subscribe((value) => console.info(value))
    // this.user = this.store.getUser

    this.loginStatus = this.ngrx.select(selectStatus)
    this.loginStatus.subscribe((value) => console.info(value))
    this.user = this.ngrx.select(selectUserDetails)

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
            // this.store.signOut()
            this.ngrx.dispatch(resetState())
            this.ngrx.dispatch(resetTaskState())
          },
          routerLink: ['/']
      }
  ];
  }
}
