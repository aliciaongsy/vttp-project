import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DbStore } from '../../service/db.store';
import { Observable } from 'rxjs';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-task-master',
  templateUrl: './task-master.component.html',
  styleUrl: './task-master.component.css'
})
export class TaskMasterComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute)
  private store = inject(DbStore)

  visible: boolean = false;

  name!: string // workspace name
  workspaces!: Observable<string[]>

  currentWorkspace!: string

  loginStatus!: Observable<boolean>

  tab: string = 'Overview'

  menuItems: MenuItem[] = [
    { label: 'Overview', routerLink: 'overview' },
    { label: 'Projects' },
    { label: 'Tasks', routerLink: 'tasks' }
  ]
  activeTab = this.menuItems[0]

  ngOnInit(): void {
    this.currentWorkspace = this.activatedRoute.snapshot.params['w']
    console.info(this.activatedRoute.snapshot.params['w'])
    this.loginStatus = this.store.getStatus
    this.workspaces = this.store.getWorkspaces
  }

  showDialog() {
    this.visible = true;
  }

  createWorkspace() {
    console.info("press button")
    console.info(this.name)
    // this.workspaces.push(this.name)
    this.store.addWorkspace(this.name)
    // close dialog
    this.visible = false
    // clear value
    this.name = ''
  }

  onTabItemClick(i: number) {
    console.log(this.menuItems[i])
  }
}
