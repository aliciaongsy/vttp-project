import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './component/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './component/register/register.component';
import { TaskMasterComponent } from './component/task-master/task-master.component';
import { AttributionsComponent } from './component/attributions/attributions.component';
import { FeaturesComponent } from './component/features/features.component';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from './service/user.service';
import { DbStore } from './service/db.store';
import { OverviewComponent } from './component/task-master/overview/overview.component';
import { TasksComponent } from './component/task-master/tasks/tasks.component';
import { TaskService } from './service/task.service';
import { AccountComponent } from './component/account/account.component';

// primeng imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { InputTextModule } from 'primeng/inputtext';
import { TabMenuModule } from 'primeng/tabmenu';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { StoreModule } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';

// ngrx imports
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './state/user/user.effects';
import { userReducer } from './state/user/user.reducer';
import { taskReducer } from './state/tasks/task.reducer';
import { TaskEffects } from './state/tasks/task.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    TaskMasterComponent,
    AttributionsComponent,
    FeaturesComponent,
    OverviewComponent,
    TasksComponent,
    AccountComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DialogModule,
    ButtonModule,
    SplitterModule,
    InputTextModule,
    TabMenuModule,
    ChartModule,
    DropdownModule,
    CalendarModule,
    ToolbarModule,
    SplitButtonModule,
    TableModule,
    TagModule,
    CheckboxModule,
    ToastModule,
    StoreModule.forRoot({user: userReducer, task: taskReducer}),
    StoreDevtoolsModule.instrument({maxAge: 25}),
    EffectsModule.forRoot([UserEffects, TaskEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
  ],
  providers: [UserService, DbStore, TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }
