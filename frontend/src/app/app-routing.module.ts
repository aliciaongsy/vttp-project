import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { TaskMasterComponent } from './component/task-master/task-master.component';
import { FeaturesComponent } from './component/features/features.component';
import { AttributionsComponent } from './component/attributions/attributions.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'taskmaster', component: TaskMasterComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'attributions', component: AttributionsComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
