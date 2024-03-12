import { Component, Input, OnInit, inject } from '@angular/core';
import { Task } from '../../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../service/task.service';
import { ActivatedRoute } from '@angular/router';
import { DbStore } from '../../../service/db.store';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {

  private fb = inject(FormBuilder)
  private taskSvc = inject(TaskService)
  private activatedRoute = inject(ActivatedRoute)
  private store = inject(DbStore)

  currentWorkspace!: string
  uid!: string

  taskForm!: FormGroup

  tasks!: Observable<Task[]>
  minDate!: Date

  visible: boolean = false

  priorities: string[] = ['Low', 'Medium', 'High']

  ngOnInit(): void {
    this.taskForm = this.createForm()
    this.minDate = new Date()

    // get workspace name - get parent path variable {workspace}/tasks
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']
    // get user id
    firstValueFrom(this.store.getUser).then((value) => {
      this.uid = value.id
      // retrieve task from mongodb
      this.tasks = this.taskSvc.getTasksOfWorkspace(this.uid, this.currentWorkspace)
      firstValueFrom(this.tasks).then((value) => console.info(value))
    }
    )
  }

  createForm(): FormGroup {
    return this.fb.group({
      task: this.fb.control<string>('', [Validators.required]),
      priority: this.fb.control<string>('Low', [Validators.required]),
      start: this.fb.control<Date>(new Date()),
      due: this.fb.control<Date>(new Date(), [Validators.required])
    })
  }

  formDialog() {
    this.visible = true
  }

  addTask() {
    const task = this.taskForm.value as Task
    task.start = this.taskForm.value.start.getTime()
    task.due = this.taskForm.value.due.getTime()

    console.info(task.start)
    task.completed = false
    this.taskSvc.addTasksToWorkspace(this.uid, this.currentWorkspace, task)
  }
}
