import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, firstValueFrom, map, switchMap, take } from 'rxjs';
import { selectCompletedTaskSize, selectIncompletedTaskSize, selectTask } from '../../../state/tasks/task.selector';
import { ActivatedRoute } from '@angular/router';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { loadAllTasks } from '../../../state/tasks/task.actions';
import { loadAllSessions } from '../../../state/focus/focus.actions';
import { selectFocus, selectLoadStatus, selectSessions } from '../../../state/focus/focus.selector';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, OnDestroy {

  private ngrxstore = inject(Store)
  private activatedRoute = inject(ActivatedRoute)

  // chart 
  data!: any
  options!: any
  barData!: any
  barOptions!: any

  incompletedTask$!: Subscription
  completedTask$!: Subscription
  session$!: Subscription

  incompleted!: number
  completed!: number
  date: string[] = []
  duration: number[] = []

  currentWorkspace!: string
  uid!: string

  loadStatus$!: Subscription

  ngOnInit(): void {
    console.info('oninit overview')
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']

    this.activatedRoute.parent?.params
      .subscribe((value) => {
        this.currentWorkspace = value['w']
        console.info('curr: ', this.currentWorkspace)
        this.date = []
        this.duration = []
        this.setChartData()
        this.setBarChartData()
        this.loadData()
      })

    this.loadData()
    this.setChartData()
    this.setBarChartData()
  }

  ngOnDestroy(): void {
    console.info('ondestroy overview')
    this.incompletedTask$.unsubscribe()
    this.completedTask$.unsubscribe()
    this.session$.unsubscribe()
  }

  loadData() {
    firstValueFrom(this.ngrxstore.select(selectUserDetails))
      .then((value) => {
        console.info('dispatch action')
        this.uid = value.id
        // retrieve task from mongodb
        this.ngrxstore.dispatch(loadAllTasks({ id: this.uid, workspace: this.currentWorkspace }))
        this.ngrxstore.dispatch(loadAllSessions({ id: this.uid, workspace: this.currentWorkspace }))
      })
    this.ngrxstore.select(selectTask)
    this.ngrxstore.select(selectFocus)

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
        console.info('completed task', value)
        this.completed = value
        this.setChartData()
      })

    this.loadStatus$ = this.ngrxstore.select(selectFocus).subscribe(
      (state) => {
        this.session$ = this.ngrxstore.select(selectSessions)
          .subscribe((value) => {
            if (state.loadStatus == 'complete' && state.workspace == this.currentWorkspace) {
              for (var v of value) {
                if (this.date.indexOf(v.date) == -1) {
                  this.date.push(v.date)
                  this.duration.push(v.duration)
                }
              }
              this.setBarChartData()
            }
          })
      }
    )


  }

  setChartData() {
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

  setBarChartData() {
    this.barData = {
      labels: this.date,
      datasets: [
        {
          label: 'Focus Sessions',
          barThickness: 70,
          data: this.duration,
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(201, 203, 207, 0.2)'],
          borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'],
          borderWidth: 1
        }
      ]
    };
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#010662'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

}
