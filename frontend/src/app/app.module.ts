import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';

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
import { OverviewComponent } from './component/task-master/overview/overview.component';
import { TasksComponent } from './component/task-master/tasks/tasks.component';
import { TaskService } from './service/task.service';
import { AccountComponent } from './component/account/account.component';
import { FocusComponent } from './component/task-master/focus/focus.component';
import { PlannerService } from './service/planner.service';
import { FocusService } from './service/focus.service';
import { CalendarComponent } from './component/calendar/calendar.component';
import { CollabComponent } from './component/collab/collab.component';
import { ChatService } from './service/chat.service';
import { WebSocketService } from './service/websocket.service';
import { GoogleService } from './service/google.service';

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
import { KnobModule } from 'primeng/knob';
import { DividerModule } from 'primeng/divider';
import { ScrollerModule } from 'primeng/scroller';
import { PaginatorModule } from 'primeng/paginator';
import { MenuModule } from 'primeng/menu';

// ngrx imports
import { EffectsModule } from '@ngrx/effects';
import { UserEffects } from './state/user/user.effects';
import { userReducer } from './state/user/user.reducer';
import { taskReducer } from './state/tasks/task.reducer';
import { TaskEffects } from './state/tasks/task.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { PlannerEffects } from './state/planner/planner.effects';
import { plannerReducer } from './state/planner/planner.reducer';
import { focusReducer } from './state/focus/focus.reducer';
import { FocusEffects } from './state/focus/focus.effects';
import { chatReducer } from './state/chat/chat.reducer';
import { ChatEffects } from './state/chat/chat.effects';

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
    AccountComponent,
    FocusComponent,
    CalendarComponent,
    CollabComponent
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
    KnobModule,
    DividerModule,
    ScrollerModule,
    PaginatorModule,
    MenuModule,
    StoreModule.forRoot({user: userReducer, task: taskReducer, planner: plannerReducer, focus: focusReducer, chat: chatReducer}),
    StoreDevtoolsModule.instrument({maxAge: 25}),
    EffectsModule.forRoot([UserEffects, TaskEffects, PlannerEffects, FocusEffects, ChatEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    FullCalendarModule
  ],
  providers: [UserService, TaskService, PlannerService, FocusService, ChatService, WebSocketService, GoogleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
