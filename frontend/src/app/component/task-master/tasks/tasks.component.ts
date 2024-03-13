import { Component, Input, OnInit, inject } from '@angular/core';
import { Task } from '../../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../service/task.service';
import { ActivatedRoute } from '@angular/router';
import { DbStore } from '../../../service/db.store';
import { Observable, firstValueFrom } from 'rxjs';

interface Column {
  field: string;
  header: string;
}

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
  status: string[] = ['In Progress', 'In Review', 'On Hold', 'Completed']

  cols!: Column[]

  completed: boolean = false

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
    })

    this.cols=[
      { field: 'task', header: 'Title' },
      { field: 'status', header: 'Status' },
      { field: 'priority', header: 'Priority' },
      { field: 'start', header: 'Start Date' },
      { field: 'due', header: 'Due Date' },
      { field: 'completed', header: 'Completed' },
  ];
  }

  createForm(): FormGroup {
    return this.fb.group({
      task: this.fb.control<string>('', [Validators.required]),
      status: this.fb.control<string>('In Progress', [Validators.required]),
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
    console.info(task.status)

    task.completed = false
    this.taskSvc.addTasksToWorkspace(this.uid, this.currentWorkspace, task)
      .then(()=>this.tasks = this.taskSvc.getTasksOfWorkspace(this.uid, this.currentWorkspace))

  }

  completedSwitch(taskId: any){
    console.info(taskId)
    console.info(this.completed)
  }
}
