import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, interval, map, takeWhile } from 'rxjs';
import { Event, Task } from '../../model';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { selectStatus, selectUser } from '../../state/user/user.selectors';
import { addEvent, changeAuthStatus, changeCalendarMode, loadAllEvents, loadAllOutstandingTasks } from '../../state/planner/planner.actions';
import { selectAllEvents, selectLoadStatus, selectAllOutstandingTasks, selectCalendarMode, selectAuthStatus, selectEmail } from '../../state/planner/planner.selector';
import { GoogleService } from '../../service/google.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  providers: [MessageService]
})
export class CalendarComponent implements OnInit, OnDestroy {
  private ngrxStore = inject(Store);
  private activatedRoute = inject(ActivatedRoute)
  private googleSvc = inject(GoogleService)
  private messageSvc = inject(MessageService)

  loginStatus: boolean = false
  loginSub$!: Subscription
  currentWorkspace!: string
  tasks$!: Observable<Task[]>
  tasksSub$!: Subscription
  uid!: string

  calendar!: Calendar
  events: Event[] = []
  events$!: Subscription
  loadStatus$!: Subscription
  eventUpdated: boolean = false
  calendarMode!: 'google' | 'mongo'

  authSub$!: Subscription
  googleLoginUrl!: string
  authStatusSub$!: Subscription
  calModeSub$!: Subscription
  authStatus: boolean = false
  userEmail!: string
  googleEvent$!: Subscription

  ngOnInit(): void {

    this.loginSub$ = this.ngrxStore.select(selectStatus)
      .subscribe((value) => {
        this.loginStatus = value
        if (value){
          // getting task data 
          firstValueFrom(this.ngrxStore.select(selectUser)).then((value) => {
            this.uid = value.user.id
            // loads data from mongodb
            this.ngrxStore.dispatch(loadAllOutstandingTasks({ id: value.user.id, workspaces: value.workspaces }))
            this.ngrxStore.dispatch(loadAllEvents({ id: value.user.id }))
          })

          this.tasks$ = this.ngrxStore.select(selectAllOutstandingTasks).pipe(
            map((value) => {
              return [...value]
            })
          )
        }
      })
    
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']

    // calendar mode is mongo by default
    this.calendarMode = 'mongo'

    this.tasksSub$ = this.tasks$.subscribe(
      (task) => {
        this.loadStatus$ = this.ngrxStore.select(selectLoadStatus).subscribe(
          value => {
            console.info(value)
            if (value == 'complete' && task.length != 0) {
              for (var t of task) {
                console.info('for loop')
                const event: Event = {
                  title: t.task,
                  start: new Date(t.due).toISOString(),
                  end: '',
                  allDay: true,
                  backgroundColor: '#8B0000'
                }
                this.events = [...this.events, event]
              }
              console.info(this.events)
              this.loadCalendar()
            }
          }
        )
      })

    firstValueFrom(this.tasks$)
      .then(() => {
        this.events$ = this.ngrxStore.select(selectAllEvents).subscribe(
          value => {
            this.events = value
            this.loadCalendar()
          }
        )
      })
      .then(() => {
        this.loadCalendar();

        var draggableEl = document.getElementById('draggable')
        new Draggable(draggableEl!, {
          itemSelector: '.fc-event',
          eventData: function (eventEl) {
            return {
              title: eventEl.innerText
            };
          }
        })
      })

    this.authSub$ = this.googleSvc.getAuthorisationPage(this.uid).subscribe({
      next: (value) => {
        console.info(value)
        this.googleLoginUrl = value.url
      },
      error: (error) => console.info(error.error.error)
    })

    this.calModeSub$ = this.ngrxStore.select(selectCalendarMode).subscribe((value) => {
      this.calendarMode = value
      if (this.calendarMode == 'google') {
        this.authStatusSub$ = this.ngrxStore.select(selectAuthStatus).subscribe((value) => {
          this.authStatus = value
          if (this.authStatus) {
            firstValueFrom(this.ngrxStore.select(selectEmail)).then((value) => this.userEmail = value)
            this.googleEvent$ = this.googleSvc.getEvents().subscribe((value) => {
              this.events = value
              this.loadCalendar()
            })
          }
        })
      }
    })

  }

  ngOnDestroy(): void {
    console.info(this.calendar.getEvents())
    if (this.eventUpdated && this.calendarMode == 'mongo') {
      const events: any[] = this.calendar.getEvents()
      if (events.length != 0) {
        var eventsToAdd: Event[] = []
        for (var e of events) {
          // only persist non due date event
          if (e.backgroundColor == "") {
            const event: Event = {
              title: e.title,
              start: e.start,
              end: e.end == null ? '' : e.end,
              allDay: e.allDay
            }
            console.info(event)
            eventsToAdd.push(event)
          }
        }
        // persist to planner state
        this.ngrxStore.dispatch(addEvent({ events: eventsToAdd }))
      }
    }
    this.loginSub$.unsubscribe()
    this.events$.unsubscribe()
    this.loadStatus$.unsubscribe()
    this.tasksSub$.unsubscribe()
    if (this.authSub$) {
      this.authSub$.unsubscribe()
    }
    if (this.authStatusSub$) {
      this.authStatusSub$.unsubscribe()
    }
    if (this.calModeSub$) {
      this.calModeSub$.unsubscribe()
    }
  }

  loadCalendar() {
    var calendarEl = document.getElementById('calendar')

    // load calendar
    this.calendar = new Calendar(calendarEl!, {
      initialView: 'timeGridWeek',
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      droppable: true,
      editable: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.events,
      eventColor: '#010662'
    })
    this.calendar.render()

    // delete event
    this.calendar.on('eventClick', (info) => {
      // can only delete task event, cannot delete deadlines
      if (info.event.backgroundColor == "") {
        console.info(info.event)
        if (confirm(`Delete event: ${info.event.title}?`)) {
          info.event.remove();
          if (this.calendarMode === 'google') {
            this.googleSvc.deleteEvent(info.event.id)
          }
          this.eventUpdated = true
        }
      }
    })

    // drop event & move event
    // add new event
    this.calendar.on('eventReceive', (info) => {
      console.info(this.calendarMode)

      // create new google event
      if (this.calendarMode === 'google') {
        const event: Event = {
          title: info.event.title,
          start: info.event.start?.toISOString()!,
          end: info.event.end == null ? info.event.allDay == false ? new Date(info.event.start?.getTime()! + (60 * 60 * 1000)).toISOString() : '' : info.event.end.toISOString(),
          allDay: info.event.allDay
        }
        console.info(event)
        this.googleSvc.createEvent(event).then(() => {
          this.googleEvent$ = this.googleSvc.getEvents().subscribe((value) => {
            this.events = value
            this.loadCalendar()
          })
        })
      }
      this.eventUpdated = true


    })
    // move event
    this.calendar.on('eventDrop', (info) => {

      console.info(info)
      if (this.calendarMode === 'google') {
        const event: Event = {
          id: info.event.id,
          title: info.event.title,
          start: info.event.start?.toISOString()!,
          end: info.event.end == null ? '' : info.event.end.toISOString(),
          allDay: info.event.allDay
        }
        console.info(event)
        this.googleSvc.updateEvent(event)
      }
      this.eventUpdated = true
    })
    this.calendar.on('eventResize', (info) => {
      console.info(info)
      if (this.calendarMode === 'google') {
        const event: Event = {
          id: info.event.id,
          title: info.event.title,
          start: info.event.start?.toISOString()!,
          end: info.event.end == null ? '' : info.event.end.toISOString(),
          allDay: info.event.allDay
        }
        console.info(event)
        this.googleSvc.updateEvent(event)
      }
      this.eventUpdated = true
    })
  }

  syncCal() {
    this.authStatusSub$ = interval(3000).pipe(takeWhile(() => this.authStatus == false)).subscribe(() =>
      this.googleSvc.getStatus().subscribe(
        (value) => {
          console.info(value)
          this.authStatus = value.status
          this.userEmail = value.email
          if (this.authStatus) {
            this.messageSvc.clear()
            this.messageSvc.add({ key: 'success', severity: 'success', summary: 'success', detail: 'successfully linked to google calendar' })

            this.ngrxStore.dispatch(changeAuthStatus({ email: value.email }))
            // get events on successful authorisation
            this.googleEvent$ = this.googleSvc.getEvents().subscribe((value) => {

              // stop getting data from store
              this.events$.unsubscribe()
              this.events = value
              this.calendarMode = 'google'
              this.ngrxStore.dispatch(changeCalendarMode())
              this.loadCalendar()
            })
          }
        }
      )
    )
  }

}
