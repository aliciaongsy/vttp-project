import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectOutstandingTasks, selectUserDetails, selectWorkspaces } from '../../state/user/user.selectors';
import { firstValueFrom } from 'rxjs';
import { ChatDetails, Task, UserDetails } from '../../model';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {

  private ngrxStore = inject(Store)

  userDetail: UserDetails = {
    name: '',
    id: '',
    email: ''
  }
  workspaces: string[] = []
  chatDetails: ChatDetails[] = []
  tasks: Task[] = []

  ngOnInit(): void {
    firstValueFrom(this.ngrxStore.select(selectUserDetails))
      .then((details) => {
        console.info(details)
        this.userDetail = details
      })

    this.ngrxStore.select(selectWorkspaces).subscribe((value) => {
        this.workspaces = value
      })

    this.ngrxStore.select(selectChats).subscribe((value) => {
        this.chatDetails = value
      })

    this.ngrxStore.select(selectOutstandingTasks).subscribe((value) => {
      this.tasks = value
    })
  }
}
