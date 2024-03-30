import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { TaskMasterComponent } from './component/task-master/task-master.component';
import { FeaturesComponent } from './component/features/features.component';
import { AttributionsComponent } from './component/attributions/attributions.component';
import { OverviewComponent } from './component/task-master/overview/overview.component';
import { TasksComponent } from './component/task-master/tasks/tasks.component';
import { AccountComponent } from './component/account/account.component';
import { canLeave } from './guard';
import { FocusComponent } from './component/task-master/focus/focus.component';
import { CalendarComponent } from './component/calendar/calendar.component';
import { CollabComponent } from './component/collab/collab.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent, canDeactivate: [canLeave] },
  { path: 'tasktracker', component: TaskMasterComponent },
  { path: 'workspace/:w', 
    component: TaskMasterComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'focus', component: FocusComponent }
    ]
   },
  { path: 'collab', component: CollabComponent },
  { path: 'chat/:roomId', component: CollabComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'attributions', component: AttributionsComponent },
  { path: 'account', component: AccountComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
