import { Component, OnInit, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { UserDetails } from '../model';
import { Store } from '@ngrx/store';
import { resetState } from '../state/user/user.actions';
import { selectStatus, selectUserDetails } from '../state/user/user.selectors';
import { resetTaskState } from '../state/tasks/task.actions';
import { resetPlannerState } from '../state/planner/planner.actions';
import { resetChatState } from '../state/chat/chat.actions';
import { resetFocusState } from '../state/focus/focus.actions';
import { GoogleService } from '../service/google.service';
import { selectCalendarMode } from '../state/planner/planner.selector';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  private ngrx = inject(Store)
  private googleSvc = inject(GoogleService)

  loginStatus!: Observable<boolean>
  user!: Observable<UserDetails>
  items!: any

  ngOnInit(): void {
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
            firstValueFrom(this.ngrx.select(selectCalendarMode)).then((value) => {
              if(value=='google'){
                this.googleSvc.revokeToken()
              }
            })
            this.ngrx.dispatch(resetState())
            this.ngrx.dispatch(resetTaskState())
            this.ngrx.dispatch(resetPlannerState())
            this.ngrx.dispatch(resetChatState())
            this.ngrx.dispatch(resetFocusState())
          },
          routerLink: ['/']
      }
  ];
  }
}
