import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { selectCurrentDate } from '../../../state/focus/focus.selector';
import { incFocusDuration, persistData, resetState } from '../../../state/focus/focus.actions';
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
  timerMode!: 'pomodoro' | 'custom' | 'shortbreak' | 'longbreak'
  startTime: number = 0;
  isRunning: boolean = false;
  duration!: number // duration in milliseconds

  // whether timer is used
  update: boolean = false

  // dialog
  visible: boolean = false

  ngOnInit(): void {
    this.changeToPomodoro()
    document.querySelector('#pomodoro')?.classList.add('active')

    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
  }

  ngOnDestroy(): void {
    if (this.update) {
      firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
        this.ngrxStore.dispatch(persistData({ id: value.id, workspace: this.currentWorkspace }))
      })
    }
  }

  changeToPomodoro() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'pomodoro'
    if (this.timerStatus == 'stop') {
      this.stop()
    }
    else {
      this.timerStatus = 'start'
      this.display = '25:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToCustom() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'custom'
    if (this.timerStatus == 'stop') {
      this.stop()
    }
    this.timerStatus = 'start'
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToLongBreak() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'longbreak'
    if (this.timerStatus == 'stop') {
      this.stop()
    }
    else {
      this.timerStatus = 'start'
      this.display = '15:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToShortBreak() {
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'shortbreak'
    if (this.timerStatus == 'stop') {
      this.stop()
    }
    else {
      this.timerStatus = 'start'
      this.display = '05:00'
    }
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  // countdown - pomodoro & break
  startCountdown() {
    switch (this.timerMode) {
      case ('pomodoro'):
        this.duration = 25 * 60 * 1000
        this.start()
        break;

      case ('shortbreak'):
        this.duration = 5 * 60 * 1000
        this.start()
        break;

      case ('longbreak'):
        this.duration = 15 * 60 * 1000
        this.start()
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
    this.stop()
  }

  restartCountdown() {
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
    this.value = 0
    this.timerStatus = 'start'
  }

  // custom countdown
  startCustomCountdown() {
    const displayTime = this.value < 10 ? "0" + this.value + ":00" : this.value + ":00"
    this.display = displayTime
    this.duration = this.value * 60 * 1000
    this.start()
    this.timerStatus = 'stop'
  }

  start() {
    if (!this.isRunning) {
      this.startTime = performance.now();
      this.isRunning = true;
      this.countdown();
    }
  }

  stop() {
    this.isRunning = false;
  }

  countdown() {
    if (this.isRunning) {
      const date = new Date().toISOString().split('T')[0]
      const duration = this.duration / (60 * 1000)

      const currentTime = performance.now();
      const elapsedTime = currentTime - this.startTime;
      const remainingTime = Math.max(0, this.duration - elapsedTime);
      const seconds = Math.floor(remainingTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const displayMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
      const displaySeconds = (seconds % 60) < 10 ? "0" + (seconds % 60) : (seconds % 60).toString();
      this.display = `${displayMinutes}:${displaySeconds}`;
      if (remainingTime > 0) {
        requestAnimationFrame(() => this.countdown());
      } else {
        this.stop();
        this.timerStatus = 'restart'
        this.visible = true
        console.log("Timer finished");
        firstValueFrom(this.ngrxStore.select(selectCurrentDate)).then(
          value => {
            // only persist data if it is in the pomodoro or custom mode
            if (this.timerMode == 'pomodoro' || this.timerMode == 'custom') {
              if (value == date) {
                console.info(value)
                this.ngrxStore.dispatch(incFocusDuration({ duration }))
              }
              // in the event that user use the timer pass midnight
              else {
                console.info(date)
                console.info('reset')
                this.ngrxStore.dispatch(resetState({ duration }))
              }
            }
          }
        )
      }
    }
  }

}
