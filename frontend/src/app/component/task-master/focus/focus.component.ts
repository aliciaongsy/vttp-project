import { Component, OnInit } from '@angular/core';
import { map, take, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'app-focus',
  templateUrl: './focus.component.html',
  styleUrl: './focus.component.css'
})
export class FocusComponent implements OnInit{

  // bind to knob
  value: number = 0

  display!: any
  timerStatus!: 'start' | 'stop' 
  timer!: any
  timerMode!: 'pomodoro' | 'custom' | 'shortbreak' | 'longbreak'

  ngOnInit(): void {
    this.changeToPomodoro()
    document.querySelector('#pomodoro')?.classList.add('active')
  }

  changeToPomodoro(){
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'pomodoro'
    this.stopCountdown()
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }
  
  changeToCustom(){
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'custom'
    this.stopCountdown()
    this.timerStatus = 'start'
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToLongBreak(){
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'longbreak'
    this.stopCountdown()
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  changeToShortBreak(){
    document.querySelector(`#${this.timerMode}`)?.classList.remove('active')
    this.timerMode = 'shortbreak'
    this.stopCountdown()
    document.querySelector(`#${this.timerMode}`)?.classList.add('active')
  }

  // countdown - pomodoro & break
  startCountdown(){
    switch(this.timerMode){
      case('pomodoro'):
        document.querySelector('#pomodoro')?.classList.add('active')
        this.countdownTimer(25)
        break;

      case('shortbreak'):
        this.countdownTimer(5)
        break;

      case('longbreak'):
        this.countdownTimer(15)
        break;

      default:
        break;
    }
    this.timerStatus = 'stop'
  }

  stopCountdown(){
    switch(this.timerMode){
      case('pomodoro'):
        this.display='25:00'
        break;

      case('shortbreak'):
        this.display='05:00'
        break;

      case('longbreak'):
        this.display='15:00'
        break;

      default:
        break;
    }
    this.timerStatus = 'start'
    clearInterval(this.timer)
  }

  // custom countdown
  startCustomCountdown(){
    const displayTime = this.value<10 ? "0"+this.value+":00" : this.value+":00"
    this.display=displayTime
    this.countdownTimer(this.value)
    this.timerStatus = 'stop'
  }

  countdownTimer(minute: number) {
    // let minute = 1;
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
        console.log("finished");
        clearInterval(this.timer);
      }
    }, 1000);
  }

}
