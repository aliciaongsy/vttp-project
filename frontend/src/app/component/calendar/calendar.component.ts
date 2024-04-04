import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, interval, map, takeWhile } from 'rxjs';
import { Event, Task } from '../../model';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { selectUser, selectUserDetails } from '../../state/user/user.selectors';
import { addEvent, loadAllEvents, loadAllOutstandingTasks } from '../../state/planner/planner.actions';
import { selectAllEvents, selectLoadStatus, selectAllOutstandingTasks } from '../../state/planner/planner.selector';
import { GoogleService } from '../../service/google.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit, OnDestroy {
  private ngrxStore = inject(Store);
  private activatedRoute = inject(ActivatedRoute)
  private googleSvc = inject(GoogleService)

  currentWorkspace!: string
  tasks$!: Observable<Task[]>
  tasksSub$!: Subscription
  uid!: string

  calendar!: Calendar
  events: Event[] = []
  events$!: Subscription
  loadStatus$!: Subscription
  eventUpdated: boolean = false

  authSub$!: Subscription
  googleLoginUrl!: string
  authStatusSub$!: Subscription
  authStatus: boolean = false
  userEmail!: string

  ngOnInit(): void {

    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
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

    this.authStatusSub$ = interval(5000).pipe(takeWhile(() => this.authStatus == false)).subscribe(() =>
      this.googleSvc.getStatus().subscribe(
        (value) => {
          console.info(value)
          this.authStatus = value.status
          this.userEmail = value.email
          this.googleSvc.getEvents()
        }
      )
    )

  }

  ngOnDestroy(): void {
    if (this.eventUpdated) {
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
    this.events$.unsubscribe()
    this.loadStatus$.unsubscribe()
    this.tasksSub$.unsubscribe()
    this.authSub$.unsubscribe()
    this.authStatusSub$.unsubscribe()
  }

  loadCalendar() {
    var calendarEl = document.getElementById('calendar')
    var update = false

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
    this.eventUpdated = update
    this.calendar.render()

    // delete event
    this.calendar.on('eventClick', (info) => {
      // can only delete task event, cannot delete deadlines
      if (info.event.backgroundColor == "") {
        console.info(info.event)
        if (confirm(`Delete event: ${info.event.title}?`)) {
          info.event.remove();
          this.eventUpdated = true
        }
      }
    })

    // drop event & move event
    this.calendar.on('drop', (info) => {
      this.eventUpdated = true
    })
    this.calendar.on('eventDrop', (info) => {
      this.eventUpdated = true
    })
  }

}
