import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { Event, Task } from '../../../model';
import { addEvent, loadAllEvents } from '../../../state/planner/planner.actions';
import { selectAllEvents, selectLoadStatus } from '../../../state/planner/planner.selector';
import { loadAllTasks } from '../../../state/tasks/task.actions';
import { selectAllOutstandingTasks } from '../../../state/tasks/task.selector';
import { selectUserDetails } from '../../../state/user/user.selectors';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.css'
})
export class PlannerComponent implements OnInit, OnDestroy {

  private ngrxStore = inject(Store);
  private activatedRoute = inject(ActivatedRoute)

  currentWorkspace!: string
  tasks$!: Observable<Task[]>
  tasksSub$!: Subscription
  uid!: string

  calendar!: Calendar
  events: Event[] = []
  events$!: Subscription
  loadStatus$!: Subscription

  ngOnInit(): void {

    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
    // getting task data 
    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      this.uid = value.id
      // loads data from mongodb
      this.ngrxStore.dispatch(loadAllTasks({ id: value.id, workspace: this.currentWorkspace }))
      this.ngrxStore.dispatch(loadAllEvents({ id: value.id, workspace: this.currentWorkspace }))
    })

    this.tasks$ = this.ngrxStore.select(selectAllOutstandingTasks).pipe(
      map((value) => {
        return [...value]
      })
    )

    firstValueFrom(this.tasks$)
      .then((task) => {
        this.events$ = this.ngrxStore.select(selectAllEvents).subscribe(
          value => {
            this.events = value
            this.loadCalendar()
          }
        )

        this.loadStatus$ = this.ngrxStore.select(selectLoadStatus).subscribe(
          value => {
            if (value==="complete"){
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
      .then(()=> {
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
  }

  ngOnDestroy(): void {
    const events: any[] = this.calendar.getEvents()
    if(events.length != 0) {
      var eventsToAdd: Event[] = []
      for (var e of events) {
        // only persist non due date event
        if (e.backgroundColor==""){
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
    this.events$.unsubscribe()
    this.loadStatus$.unsubscribe()
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
      this.calendar.getEventById(info.event.id)?.remove()
    })
  }

}
