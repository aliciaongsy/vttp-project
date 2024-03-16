import { Component, Input, OnInit, inject } from '@angular/core';
import { Task } from '../../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, firstValueFrom, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { addTask, changeCompleteStatus, loadAllTasks } from '../../../state/tasks/task.actions';
import { selectTask } from '../../../state/tasks/task.selector';

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
  private activatedRoute = inject(ActivatedRoute)
  private ngrxStore = inject(Store)

  taskForm!: FormGroup
  minDate!: Date

  // details
  currentWorkspace!: string
  uid!: string
  tasks!: Observable<Task[]>

  // dialog
  visible: boolean = false
  editVisible: boolean = false

  // dropdown options
  priorities: string[] = ['Low', 'Medium', 'High']
  status: string[] = ['In Progress', 'In Review', 'On Hold', 'Completed']

  cols!: Column[]

  ngOnInit(): void {
    this.taskForm = this.createForm()
    this.minDate = new Date()

    // get workspace name - get parent path variable {workspace}/tasks
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']

    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      this.uid = value.id
      // retrieve task from mongodb
      this.ngrxStore.dispatch(loadAllTasks({ id: this.uid, workspace: this.currentWorkspace }))
    })
    console.info(this.ngrxStore.select(selectTask))
    this.tasks = this.ngrxStore.select(selectTask).pipe(
      map((value)=>{
        return [...value.tasks]
      })
    )
    firstValueFrom(this.tasks).then((value) => console.info(value))

    this.cols = [
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
    this.ngrxStore.dispatch(addTask({ task: task }))
    // this.tasks = this.ngrxStore.select(selectAllTasks)
    this.visible = false
  }

  completedSwitch(data: Task) {
    var task: Task = {
      id: data.id,
      task: data.task,
      status: !(data.completed)? "Completed" : data.status==='Completed' ? "In Progress" : data.status,
      priority: data.priority,
      start: data.start,
      due: data.due,
      completed: !(data.completed)

    }
    console.info(task)
    const taskId = data.id
    this.ngrxStore.dispatch(changeCompleteStatus({id: taskId!, task: task, completed: task.completed}))
  }

  editForm(){

  }
}
