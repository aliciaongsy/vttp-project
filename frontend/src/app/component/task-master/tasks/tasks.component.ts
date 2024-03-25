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

  // details
  currentWorkspace!: string
  uid!: string
  tasks!: Observable<Task[]>

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
  error$!: Subscription
  error!: string
  actionStatus$!: Subscription
  actionStatus!: string

  currentAction!: 'add' | 'delete' | 'update'

  ngOnInit(): void {
    this.taskForm = this.createForm()
    this.minDate = new Date()

    // get workspace name - get parent path variable {workspace}/tasks
    this.currentWorkspace = this.activatedRoute.parent?.snapshot.params['w']

    // getting task data 
    firstValueFrom(this.ngrxStore.select(selectUserDetails)).then((value) => {
      this.uid = value.id
      // loads data from mongodb
      this.ngrxStore.dispatch(loadAllTasks({ id: this.uid, workspace: this.currentWorkspace }))
    })
    // console.info(this.ngrxStore.select(selectTask))
    this.tasks = this.ngrxStore.select(selectTask).pipe(
      map((value)=>{
        return [...value.tasks]
      })
    )
    firstValueFrom(this.tasks).then((value) => console.info(value))

    // table columns
    this.cols = [
      { field: 'task', header: 'Title' },
      { field: 'status', header: 'Status' },
      { field: 'priority', header: 'Priority' },
      { field: 'start', header: 'Start Date' },
      { field: 'due', header: 'Due Date' },
      { field: 'completed', header: 'Completed' },
      { field: 'actions', header: 'Actions' }
    ];

    this.actionStatus$ = this.ngrxStore.select(selectActionStatus).subscribe(
      status => {
        this.actionStatus = status
        switch(this.currentAction){
          case 'add': {
            if(this.actionStatus == 'success'){
              console.info('success toast')
              this.showSuccessToast()
            }
            if(this.actionStatus == 'error'){
              console.info('error toast')
              this.showErrorToast()
            }
          }
        }
      }
    )

  }

  ngOnDestroy(): void {
    this.error$.unsubscribe()
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

  showErrorToast(){
    this.messageSvc.clear()
    this.messageSvc.add({key: 'error', severity: 'error', summary: 'error', detail: 'error adding new task'})
  }

  showSuccessToast(){
    this.messageSvc.clear()
    this.messageSvc.add({key: 'success', severity: 'success', summary: 'success', detail: 'successfully added new task!'})
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
    // dispatch action to update completed boolean
    this.ngrxStore.dispatch(changeCompleteStatus({taskId: taskId!, task: task, completed: task.completed}))
  }

  // --- editing task ---
  editForm(data: Task){
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

  updateTask(taskId: string){
    const task = this.taskForm.value as Task
    task.id = taskId
    task.start = this.taskForm.value.start.getTime()
    task.due = this.taskForm.value.due.getTime()
    task.completed = this.taskForm.value.status == "Completed" ? true : false
    console.info(task)

    // dispatch action to update task
    this.ngrxStore.dispatch(updateTask({taskId: taskId, task: task}))

    // close dialog
    this.editVisible = false
    this.taskForm = this.createForm()

  }

  // --- deleting task --- 
  deleteDialog(){
    this.deleteVisible = true
  }

  deleteTask(data: Task){
    this.ngrxStore.dispatch(deleteTask({taskId: data.id!, completed: data.completed}))
    this.deleteVisible = false
  }

  closeDialog(){
    this.deleteVisible = false
  }
}
