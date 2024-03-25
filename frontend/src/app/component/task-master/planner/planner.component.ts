import { Component, OnInit, inject } from '@angular/core';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { Store } from '@ngrx/store';
import { selectAllTasks, selectTask } from '../../../state/tasks/task.selector';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { loadAllTasks } from '../../../state/tasks/task.actions';
import { Event, Task } from '../../../model';

document.addEventListener('DOMContentLoaded', function(){
  var draggableEl = document.getElementById('mydraggable');
  var calendarEl = document.getElementById('calendar');

  new Draggable(draggableEl!, {
    itemSelector: '.fc-event',
    eventData: function(eventEl) {
      return {
        title: eventEl.innerText
      };
    }
  });
  // var calendar = new Calendar(calendarEl!, {
  //   initialView: 'dayGridWeek',
  //   plugins: [dayGridPlugin, interactionPlugin],
  //   droppable: true,
  //   editable: true,
  //   headerToolbar: {
  //     left: 'prev,next',
  //     center: 'title',
  //     right: 'dayGridMonth,dayGridWeek,dayGridDay'
  //   }
  // })
  // calendar.render()
})

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.css'
})
export class PlannerComponent implements OnInit {

  private ngrxStore = inject(Store);
  private activatedRoute = inject(ActivatedRoute)

  currentWorkspace!: string
  tasks!: Observable<Task[]>
  uid!: string

  events: any = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridWeek',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    droppable: true,
    editable: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
  };


  ngOnInit(): void {
    
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
    // getting task data 
    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      this.uid = value.id
      // loads data from mongodb
      this.ngrxStore.dispatch(loadAllTasks({ id: this.uid, workspace: this.currentWorkspace }))
    })
    // console.info(this.ngrxStore.select(selectTask))
    this.tasks = this.ngrxStore.select(selectTask).pipe(
      map((value) => {
        return [...value.tasks]
        // for (var i = 0; i < this.tasks.length; i++){
        //   var e!: Event
        //   e.title = this.tasks.at(i)?.task!
        //   e.date = new Date(this.tasks.at(i)?.due!).toString()
        //   this.events.add(e)
        //   this.calendarOptions.events = this.events
        //   console.info(e)
        // }
        // console.info(this.events)
      })
    )

  }


}
