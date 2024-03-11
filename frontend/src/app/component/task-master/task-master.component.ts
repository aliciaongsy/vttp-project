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
  workspaces: string[] = []

  pathVariable!: string

  loginStatus!: Observable<boolean>

  tab: string = 'Overview'

  menuItems: MenuItem[] = [
    {
      label: 'Overview', 
      // command: (event: any) => {
      //   this.tab = event.item.label
      //   console.info(this.tab)
      // }, 
      routerLink: 'overview'
    },
    {
      label: 'Projects', 
      // command: (event: any) => {
      //   this.tab = event.item.label
      //   console.info(this.tab)
      // }
    },
    {
      label: 'Tasks', 
      // command: (event: any) => {
      //   this.tab = event.item.label
      //   console.info(this.tab)
      // },
      routerLink: 'tasks'
    }
  ]
  activeTab = this.menuItems[0]

  data: any;
  options: any;


  ngOnInit(): void {
    this.pathVariable = this.activatedRoute.snapshot.params['w']
    console.info(this.activatedRoute.snapshot.params['w'])
    this.loginStatus = this.store.getStatus

    // const documentStyle = getComputedStyle(document.documentElement); 
    
  }

  showDialog() {
    this.visible = true;
  }

  createWorkspace() {
    console.info("press button")
    console.info(this.name)
    this.workspaces.push(this.name)
    // close dialog
    this.visible = false
    // clear value
    this.name = ''
  }

  onTabItemClick(i: number) {
    console.log(this.menuItems[i])
  }
}
