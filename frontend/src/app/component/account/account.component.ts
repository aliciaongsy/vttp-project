import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectOutstandingTasks, selectTaskSummary, selectUserDetails, selectWorkspaces } from '../../state/user/user.selectors';
import { firstValueFrom } from 'rxjs';
import { ChatDetails, Task, UserDetails } from '../../model';
import { MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  providers: [MessageService]
})
export class AccountComponent implements OnInit {

  @ViewChild('file') imageFile!: ElementRef;

  private ngrxStore = inject(Store)
  private fb = inject(FormBuilder)

  userDetail: UserDetails = {
    name: '',
    id: '',
    email: ''
  }
  workspaces: string[] = []
  chatDetails: ChatDetails[] = []
  tasks: Task[] = []
  taskSummary: any

  data!: any
  options!: any

  currentTab!: 'Dashboard' | 'Account'

  items: MenuItem[] = [
    {
      label: 'Dashboard',
      command: () => {
        this.currentTab = 'Dashboard'
      }
    },
    {
      label: 'Account',
      command: () => {
        this.currentTab = 'Account'
      }
    }
  ]

  editForm!: FormGroup
  imageDialogVisible: boolean = false
  image!: any
  imageChangedEvent: any

  ngOnInit(): void {
    this.currentTab = 'Dashboard'
    firstValueFrom(this.ngrxStore.select(selectUserDetails))
      .then((details) => {
        console.info(details)
        this.userDetail = details
        this.editForm = this.editProfileForm()
      })

    this.ngrxStore.select(selectWorkspaces).subscribe((value) => {
        this.workspaces = value
      })

    this.ngrxStore.select(selectChats).subscribe((value) => {
        this.chatDetails = value
      })

    this.ngrxStore.select(selectOutstandingTasks).subscribe((value) => {
      this.tasks = value
    })
    this.ngrxStore.select(selectTaskSummary).subscribe((value) => {
      console.info(value)
      this.taskSummary = value
      this.data = {
        labels: ['completed', 'incompleted'],
        datasets: [
          {
            data: [value.complete, value.incomplete],
            backgroundColor: ['#c6d3e3', '#010662'],
            hoverBackgroundColor: ['#c6d3e3', '#010662']
          }
        ]
      };
      this.options = {
        cutout: '50%',
        plugins: {
          legend: {
            labels: {
              color: '#010662',
              font: {
                family: "'Lora', sans-serif",
                size: 14
              }
            }
          }
        }
      };
    })
  }

  editProfileForm(): FormGroup{
    return this.fb.group({
      name: this.fb.control<string>(this.userDetail.name, [Validators.required]),
      email: this.fb.control<string>(this.userDetail.email, [Validators.required, Validators.email])
    })
  }

  checkEdits(){
    return this.editForm.controls['email'].value==this.userDetail.email && this.editForm.controls['name'].value==this.userDetail.name
  }

  openDialog(event: any){
    this.imageDialogVisible = true
    this.imageChangedEvent = event;
    // this.image = this.imageFile.nativeElement.files[0]
    // console.info(this.image)
  }

  imageCropped(event: ImageCroppedEvent) {
    console.info(event)
    // convert image from base 64 to File
    this.image = this.base64ToFile(event.base64!, this.imageFile.nativeElement.files[0].name)
    console.info(this.image)
  }

  base64ToFile(data: any, filename: any) {

    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  
  submit(){
    console.info(this.image)
    const formData = new FormData();
    formData.set('id', this.userDetail.id);
		formData.set('name', this.editForm.value.name);
		formData.set('email', this.editForm.value.email);
		formData.set('imageFile', this.image);
  }
}
