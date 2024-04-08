import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Task } from '../../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserDetails } from '../../../state/user/user.selectors';
import { addTask, changeCompleteStatus, deleteTask, loadAllTasks, updateTask } from '../../../state/tasks/task.actions';
import { selectActionStatus, selectTask } from '../../../state/tasks/task.selector';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
  providers: [MessageService]
})
export class TasksComponent implements OnInit, OnDestroy {

  private fb = inject(FormBuilder)
  private activatedRoute = inject(ActivatedRoute)
  private ngrxStore = inject(Store)
  private messageSvc = inject(MessageService)

  taskForm!: FormGroup
  minDate!: Date
  dueDate!: Date

  // details
  currentWorkspace!: string
  uid!: string
  tasks!: Observable<Task[]>
  editId!: string

  // dialog
  visible: boolean = false
  editVisible: boolean = false
  deleteVisible: boolean = false

  // dropdown options
  priorities: string[] = ['Low', 'Medium', 'High']
  status: string[] = ['In Progress', 'In Review', 'On Hold', 'Completed']

  cols!: Column[]
  sortableCols: string[] = ['status', 'priority', 'due']

  // store data
  actionStatus$!: Subscription
  actionStatus!: string

  currentAction!: 'add' | 'delete' | 'update'

  paramSub$!: Subscription | undefined

  ngOnInit(): void {
    this.taskForm = this.createForm()
    this.minDate = new Date()

    var date = new Date()
    date.setDate(date.getDate() - 1)
    this.dueDate = date
    console.info(this.dueDate)

    // get workspace name - get parent path variable {workspace}/tasks
    this.paramSub$ = this.activatedRoute.parent?.params.subscribe(params => {
      this.currentWorkspace = params['w']

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
        })
      )
      firstValueFrom(this.tasks).then((value) => console.info(value))
    })

    // table columns
    this.cols = [
      { field: 'task', header: 'Title' },
      { field: 'status', header: 'Status' },
      { field: 'priority', header: 'Priority' },
      { field: 'start', header: 'Start Date' },
      { field: 'due', header: 'Due Date' },
      { field: 'actions', header: 'Actions' },
      { field: 'completed', header: 'Completed' }
    ];

    this.actionStatus$ = this.ngrxStore.select(selectActionStatus).subscribe(
      status => {
        this.actionStatus = status
        if (this.actionStatus == 'success') {
          console.info('success toast')
          this.showSuccessToast()
        }
        if (this.actionStatus == 'error') {
          console.info('error toast')
          this.showErrorToast()
        }
      }
    )

  }

  ngOnDestroy(): void {
    this.actionStatus$.unsubscribe()
    if (this.paramSub$) {
      this.paramSub$.unsubscribe()
    }
  }

  clear(table: Table) {
    table.clear();
  }

  createForm(): FormGroup {
    return this.fb.group({
      task: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
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

    task.completed = task.status == 'Completed'
    this.ngrxStore.dispatch(addTask({ task: task }))
    // this.tasks = this.ngrxStore.select(selectAllTasks)

    this.visible = false
    this.taskForm = this.createForm()

    this.currentAction = 'add'
  }

  showErrorToast() {
    this.messageSvc.clear()
    var details = ''
    switch (this.currentAction) {
      case 'add': {
        details = 'error adding new task'
        break;
      }
      case 'update': {
        details = 'error updating task'
        break;
      }
      case 'delete': {
        details = 'error deleting task'
        break;
      }
    }
    this.messageSvc.add({ key: 'error', severity: 'error', summary: 'error', detail: details })
  }

  showSuccessToast() {
    this.messageSvc.clear()
    var details = ''
    switch (this.currentAction) {
      case 'add': {
        details = 'successfully added new task!'
        break;
      }
      case 'update': {
        details = 'successfully updated task!'
        break;
      }
      case 'delete': {
        details = 'successfully deleted task!'
        break;
      }
    }
    this.messageSvc.add({ key: 'success', severity: 'success', summary: 'success', detail: details })
  }

  completedSwitch(data: Task) {
    var task: Task = {
      id: data.id,
      task: data.task,
      status: !(data.completed) ? "Completed" : data.status === 'Completed' ? "In Progress" : data.status,
      priority: data.priority,
      start: data.start,
      due: data.due,
      completed: !(data.completed)
    }
    console.info(task)
    const taskId = data.id
    // dispatch action to update completed boolean
    this.ngrxStore.dispatch(changeCompleteStatus({ taskId: taskId!, task: task, completed: task.completed }))
  }

  // --- editing task ---
  editForm(data: Task) {
    this.editId = data.id!
    this.editVisible = true
    // get current task data and map it to the form
    this.taskForm = this.fb.group({
      task: this.fb.control<string>(data.task, [Validators.required]),
      status: this.fb.control<string>(data.status, [Validators.required]),
      priority: this.fb.control<string>(data.priority, [Validators.required]),
      start: this.fb.control<Date>(new Date(data.start)),
      due: this.fb.control<Date>(new Date(data.due), [Validators.required])
    })
  }

  updateTask() {
    const task = this.taskForm.value as Task
    task.id = this.editId
    task.start = this.taskForm.value.start.getTime()
    task.due = this.taskForm.value.due.getTime()
    task.completed = this.taskForm.value.status == "Completed" ? true : false
    console.info(task)

    // dispatch action to update task
    this.ngrxStore.dispatch(updateTask({ taskId: this.editId, task: task }))

    // close dialog
    this.editVisible = false
    this.taskForm = this.createForm()

    this.currentAction = 'update'

  }

  // --- deleting task --- 
  deleteDialog() {
    this.deleteVisible = true
  }

  deleteTask(data: Task) {
    this.ngrxStore.dispatch(deleteTask({ taskId: data.id!, completed: data.completed }))
    this.deleteVisible = false

    this.currentAction = 'delete'
  }

  closeDialog() {
    this.deleteVisible = false
  }
}
