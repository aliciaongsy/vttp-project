import { Component } from '@angular/core';

@Component({
  selector: 'app-task-master',
  templateUrl: './task-master.component.html',
  styleUrl: './task-master.component.css'
})
export class TaskMasterComponent {

  visible: boolean = false;
  value!: string
  workspaces: string[] = []

  showDialog() {
    this.visible = true;
  }

  createWorkspace(){
    console.info("press button")
    console.info(this.value)
    this.workspaces.push(this.value)
    // close dialog
    this.visible=false
    // clear value
    this.value=''
  }

}
