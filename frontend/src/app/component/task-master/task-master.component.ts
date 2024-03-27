import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbStore } from '../../service/db.store';
import { Observable, firstValueFrom } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Store } from '@ngrx/store';
import { selectStatus, selectUserDetails, selectWorkspaces } from '../../state/user/user.selectors';
import { addWorkspace } from '../../state/user/user.actions';
import { loadAllTasks } from '../../state/tasks/task.actions';
import { selectTask } from '../../state/tasks/task.selector';

@Component({
  selector: 'app-task-master',
  templateUrl: './task-master.component.html',
  styleUrl: './task-master.component.css'
})
export class TaskMasterComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute)
  private ngrxStore = inject(Store)

  visible: boolean = false;

  name!: string // workspace name
  workspaces!: Observable<string[]>

  currentWorkspace!: string

  loginStatus!: Observable<boolean>

  tab: string = 'Overview'

  menuItems: MenuItem[] = [
    { label: 'Overview', routerLink: 'overview' },  
    { label: 'Tasks', routerLink: 'tasks' },
    { label: 'Focus Session', routerLink: 'focus' },
    { label: 'Planner', routerLink: 'planner' }
  ]
  activeTab = this.menuItems[0]

  ngOnInit(): void {
    this.currentWorkspace = this.activatedRoute.snapshot.params['w']
    console.info(this.activatedRoute.snapshot.params['w'])

    // component store
    // this.loginStatus = this.store.getStatus
    // this.workspaces = this.store.getWorkspaces

    // ngrx store
    console.info("retrieve from ngrx store")
    this.loginStatus = this.ngrxStore.select(selectStatus)
    this.workspaces = this.ngrxStore.select(selectWorkspaces)

  }

  showDialog() {
    this.visible = true;
  }

  createWorkspace() {
    console.info("press button")
    console.info(this.name)

    // this.store.addWorkspace(this.name)

    this.ngrxStore.dispatch(addWorkspace({workspace: this.name}))
    // close dialog
    this.visible = false
    // clear value
    this.name = ''
  }

  onTabItemClick(i: number) {
    console.log(this.menuItems[i])
  }
}
