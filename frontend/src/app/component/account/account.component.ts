import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectOutstandingTasks, selectTaskSummary, selectUserDetails, selectWorkspaces } from '../../state/user/user.selectors';
import { ChatDetails, Task, UserDetails } from '../../model';
import { MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { updateProfile } from '../../state/user/user.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  providers: [MessageService]
})
export class AccountComponent implements OnInit, OnDestroy {

  @ViewChild('file') imageFile!: ElementRef;

  private ngrxStore = inject(Store)
  private fb = inject(FormBuilder)

  userDetail: UserDetails = {
    id: '',
    name: '',
    email: '',
    createDate: 0,
    image: ''
  }
  workspaces: string[] = []
  chatDetails: ChatDetails[] = []
  tasks: Task[] = []
  taskSummary: any

  userSub$!: Subscription
  workspaceSub$!: Subscription
  chatSub$!: Subscription
  outstandingTaskSub$!: Subscription
  taskSub$!: Subscription

  data!: any
  options!: any

  currentTab!: 'Dashboard' | 'Account'
  accountTab!: string

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
  cropImage: string = ''

  changePasswordForm!: FormGroup

  ngOnInit(): void {
    this.currentTab = 'Dashboard'
    this.accountTab = 'edit'
    this.userSub$ = this.ngrxStore.select(selectUserDetails).subscribe
      ((details) => {
        console.info(details)
        this.userDetail = details
        this.editForm = this.editProfileForm()
        this.changePasswordForm = this.passwordForm()
      })

    this.workspaceSub$ = this.ngrxStore.select(selectWorkspaces).subscribe((value) => {
      this.workspaces = value
    })

    this.chatSub$ = this.ngrxStore.select(selectChats).subscribe((value) => {
      this.chatDetails = value
    })

    this.outstandingTaskSub$ = this.ngrxStore.select(selectOutstandingTasks).subscribe((value) => {
      this.tasks = value
    })

    this.taskSub$ = this.ngrxStore.select(selectTaskSummary).subscribe((value) => {
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

  ngOnDestroy(): void {
    this.userSub$.unsubscribe()
    this.chatSub$.unsubscribe()
    this.workspaceSub$.unsubscribe()
    this.taskSub$.unsubscribe()
    this.outstandingTaskSub$.unsubscribe()
  }

  changeTab(tab: string){
    this.accountTab = tab
  }

  // edit profile 
  editProfileForm(): FormGroup {
    return this.fb.group({
      name: this.fb.control<string>(this.userDetail.name, [Validators.required]),
      email: this.fb.control<string>(this.userDetail.email, [Validators.required, Validators.email])
    })
  }

  checkEdits() {
    return this.editForm.controls['email'].value == this.userDetail.email && this.editForm.controls['name'].value == this.userDetail.name && this.cropImage==''
  }

  openDialog(event: any) {
    this.imageDialogVisible = true
    this.imageChangedEvent = event;
    // this.image = this.imageFile.nativeElement.files[0]
    // console.info(this.image)
  }

  closeDialog(){
    this.imageDialogVisible = false
  }

  crop(){
    this.imageDialogVisible = false
    this.cropImage = this.image.name
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

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  submit() {
    console.info(this.image)
    const formData = new FormData();
    formData.set('name', this.editForm.value.name);
    formData.set('email', this.editForm.value.email);
    formData.set('image', this.image);
    this.ngrxStore.dispatch(updateProfile({data: formData}))
    this.cropImage=''
  }

  // change password
  passwordForm(): FormGroup {
    return this.fb.group({
      current: this.fb.control<string>('', [Validators.required]),
      new: this.fb.control<string>('', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")]),
      confirm: this.fb.control<string>('', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")])
    })
  }

  unmatchedPassword(){
    return this.changePasswordForm.controls['new'].value != this.changePasswordForm.controls['confirm'].value
  }

  changePassword(){

  }
}
