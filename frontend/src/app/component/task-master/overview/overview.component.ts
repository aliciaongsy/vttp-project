import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, map, switchMap, take } from 'rxjs';
import { selectCompletedTaskSize, selectIncompletedTaskSize, selectTask } from '../../../state/tasks/task.selector';
import { ActivatedRoute } from '@angular/router';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { loadAllTasks } from '../../../state/tasks/task.actions';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, OnDestroy{

  private ngrxstore = inject(Store)
  private activatedRoute = inject(ActivatedRoute)

  data!: any
  options!: any

  currentWorkspace!: string
  uid!: string

  incompletedTask$!: Subscription
  completedTask$!: Subscription

  incompleted!: number
  completed!: number

  ngOnInit(): void {
    console.info('oninit overview')
    // load task data
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']

    this.activatedRoute.parent?.params
      .subscribe((value)=>{
        this.currentWorkspace = value['w']
        console.info('curr: ', this.currentWorkspace)
        this.setChartData()
        this.loadData()
      })

    this.loadData()
    this.setChartData()
  }

  ngOnDestroy(): void {
    console.info('ondestroy overview')
    this.incompletedTask$.unsubscribe()
    this.completedTask$.unsubscribe()
  }

  loadData(){
    firstValueFrom(this.ngrxstore.select(selectUserDetails))
      .then((value) => {
        this.uid = value.id
        // retrieve task from mongodb
        this.ngrxstore.dispatch(loadAllTasks({ id: this.uid, workspace: this.currentWorkspace }))
      })
    this.ngrxstore.select(selectTask)

    this.incompletedTask$ = this.ngrxstore.select(selectIncompletedTaskSize)
      .subscribe({
        next: (value) => {
          console.info(value)
          this.incompleted = value
          this.setChartData()
        }
      })

    this.completedTask$ = this.ngrxstore.select(selectCompletedTaskSize)
      .subscribe((value) => {
        console.info('completed task',value)
        this.completed = value
        this.setChartData()
      })
  }

  setChartData(){
    console.info('setting chart data')
    this.data = {
      labels: ['completed', 'incompleted'],
      datasets: [
        {
          data: [this.completed, this.incompleted],
          backgroundColor: ['#c6d3e3', '#010662'],
          hoverBackgroundColor: ['#c6d3e3', '#010662']
        }
      ]
    };
    this.options = {
      cutout: '50%',
      plugins: {
        legend: {
          labels: {
            color: '#010662',
            font: {
              family: "'Lora', sans-serif",
              size: 14
            }
          }
        }
      }
    };
  }

}
