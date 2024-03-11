import { Component, OnInit, inject } from '@angular/core';
import { Task } from '../../../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit{

  private fb = inject(FormBuilder)
  taskForm!: FormGroup

  tasks: Task[] = []
  minDate!: Date

  visible: boolean = false

  priorities: string[] = ['Low', 'Medium', 'High']

  ngOnInit(): void {
    this.taskForm = this.createForm()
    this.minDate = new Date()
  }

  createForm(): FormGroup{
    return this.fb.group({
      task: this.fb.control<string>('', [Validators.required]),
      priority: this.fb.control<string>('', [Validators.required]),
      start: this.fb.control<number>(new Date().getMilliseconds()),
      due: this.fb.control(0, [Validators.required])
    })
  }

  formDialog(){
    this.visible=true
  }

  addTask(){
    const task = this.taskForm.value as Task
    this.tasks.push(task)
  }
}
