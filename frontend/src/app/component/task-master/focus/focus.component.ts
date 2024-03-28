import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, map, take, takeWhile, timer } from 'rxjs';
import { FocusSession } from '../../../model';
import { selectCurrentDate } from '../../../state/focus/focus.selector';
import { incFocusDuration, persistData, resetState } from '../../../state/focus/focus.actions';
import { clearInterval, setInterval } from 'worker-timers';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-focus',
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.css'
})
export class FocusComponent implements OnInit, OnDestroy {

  private ngrxStore = inject(Store)
  private activatedRoute = inject(ActivatedRoute)

  currentWorkspace!: string

  // bind to knob
  value: number = 0

  display!: any
  timerStatus!: 'start' | 'stop' | 'restart'
  timer!: any
  timerMode!: 'pomodoro' | 'custom' | 'shortbreak' | 'longbreak'

  // whether timer is used
  update: boolean = false

  ngOnInit(): void {
    this.changeToPomodoro()
    document.querySelector('#pomodoro')?.classList.add('active')

    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
  }

  ngOnDestroy(): void {
    if(this.update){
      firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
        this.ngrxStore.dispatch(persistData({id: value.id, workspace: this.currentWorkspace}))
      })
    }
  }

  changeToPomodoro() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'pomodoro'
    if(this.timerStatus=='stop'){
      this.stopCountdown()
    }
    else{
      this.timerStatus = 'start'
      this.display = '25:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToCustom() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'custom'
    if(this.timerStatus=='stop'){
      this.stopCountdown()
    }
    this.timerStatus = 'start'
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToLongBreak() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'longbreak'
    if(this.timerStatus=='stop'){
      this.stopCountdown()
    }
    else{
      this.timerStatus = 'start'
      this.display = '15:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToShortBreak() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'shortbreak'
    if(this.timerStatus=='stop'){
      this.stopCountdown()
    }
    else{
      this.timerStatus = 'start'
      this.display = '05:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  // countdown - pomodoro & break
  startCountdown() {
    switch (this.timerMode) {
      case ('pomodoro'):
        document.querySelector('#pomodoro')?.classList.add('active')
        this.countdownTimer(25)
        break;

      case ('shortbreak'):
        this.countdownTimer(5)
        break;

      case ('longbreak'):
        this.countdownTimer(15)
        break;

      default:
        break;
    }
    this.timerStatus = 'stop'
  }

  stopCountdown() {
    switch (this.timerMode) {
      case ('pomodoro'):
        this.display = '25:00'
        break;

      case ('shortbreak'):
        this.display = '05:00'
        break;

      case ('longbreak'):
        this.display = '15:00'
        break;

      default:
        break;
    }
    this.timerStatus = 'start'
    clearInterval(this.timer)
  }

  restartCountdown(){
    switch (this.timerMode) {
      case ('pomodoro'):
        this.display = '25:00'
        break;

      case ('shortbreak'):
        this.display = '05:00'
        break;

      case ('longbreak'):
        this.display = '15:00'
        break;

      default:
        break;
    }
    this.timerStatus = 'start'
  }

  // custom countdown
  startCustomCountdown() {
    const displayTime = this.value < 10 ? "0" + this.value + ":00" : this.value + ":00"
    this.display = displayTime
    this.countdownTimer(this.value)
    this.timerStatus = 'stop'
  }

  countdownTimer(minute: number) {
    const date = new Date().toISOString().split('T')[0]
    const duration = minute
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    this.timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;

      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;

      if (seconds == 0) {
        this.update=true
        console.log("finished");
        this.timerStatus='restart'
        clearInterval(this.timer);
        firstValueFrom(this.ngrxStore.select(selectCurrentDate)).then(
          value => {
            if(value==date){
              console.info(value)
              this.ngrxStore.dispatch(incFocusDuration({duration}))
            }
            // in the event that user use the timer pass midnight
            else{
              console.info(date)
              console.info('reset')
              this.ngrxStore.dispatch(resetState({duration}))
            }
          }
        )
      }
    }, 1000);
  }

}
