import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { selectStatus, selectWorkspaces } from '../../state/user/user.selectors';
import { addWorkspace, deleteWorkspace } from '../../state/user/user.actions';

@Component({
  selector: 'app-task-master',
  templateUrl: './task-master.component.html',
  styleUrl: './task-master.component.css',
  providers: [MessageService]
})
export class TaskMasterComponent implements OnInit, OnDestroy {

  private activatedRoute = inject(ActivatedRoute)
  private ngrxStore = inject(Store)
  private router = inject(Router)

  visible: boolean = false;

  name!: string // workspace name
  workspaces!: Observable<string[]>

  currentWorkspace!: string

  loginStatus!: Observable<boolean>

  paramSub$!: Subscription

  menuItems: MenuItem[] = [ 
    { label: 'Tasks', routerLink: 'tasks' },
    { label: 'Focus Session', routerLink: 'focus' }
  ]
  activeTab = this.menuItems[0]
  items!: MenuItem[]

  ngOnInit(): void {
    this.paramSub$ = this.activatedRoute.params.subscribe(params => {
      this.currentWorkspace = params['w']})

    console.info("retrieve from ngrx store")
    this.loginStatus = this.ngrxStore.select(selectStatus)
    this.workspaces = this.ngrxStore.select(selectWorkspaces)

    this.items = [
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          if(confirm(`Are you sure you want to delete workspace: ${this.currentWorkspace}?`)){
            this.ngrxStore.dispatch(deleteWorkspace({workspace: this.currentWorkspace}))
            this.router.navigate(['/tasktracker'])
          }
        }
      }
    ]

  }

  ngOnDestroy(): void {
    this.paramSub$.unsubscribe()
  }

  showDialog() {
    this.visible = true;
  }

  createWorkspace() {
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
