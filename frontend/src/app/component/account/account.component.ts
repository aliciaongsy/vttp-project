import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectChats, selectOutstandingTasks, selectTaskSummary, selectUserDetails, selectWorkspaces } from '../../state/user/user.selectors';
import { ChatDetails, Task, UserDetails } from '../../model';
import { MenuItem, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { loadAllData, resetState, updateProfile } from '../../state/user/user.actions';
import { Subscription, firstValueFrom } from 'rxjs';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';
import { enterChatRoom, resetChatState } from '../../state/chat/chat.actions';
import { loadAllSessions, resetFocusState } from '../../state/focus/focus.actions';
import { selectSessions } from '../../state/focus/focus.selector';
import { selectCalendarMode } from '../../state/planner/planner.selector';
import { resetTaskState } from '../../state/tasks/task.actions';
import { resetPlannerState } from '../../state/planner/planner.actions';
import { GoogleService } from '../../service/google.service';

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
  private userSvc = inject(UserService)
  private router = inject(Router)
  private googleSvc = inject(GoogleService)

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
  barData!: any
  barOptions!: any
  date: string[] = []
  duration: number[] = []

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
  sessionSub$: any;

  deleteAccountForm!: FormGroup

  ngOnInit(): void {

    this.ngrxStore.dispatch(loadAllData())
    
    this.currentTab = 'Dashboard'
    this.accountTab = 'edit'
    this.userSub$ = this.ngrxStore.select(selectUserDetails).subscribe
      ((details) => {
        this.userDetail = details
        this.ngrxStore.dispatch(loadAllSessions({ id: details.id }))
        this.editForm = this.editProfileForm()
        this.changePasswordForm = this.passwordForm()
        this.deleteAccountForm = this.deleteForm()
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
      if (value.complete == undefined && value.incomplete == undefined) {
        this.taskSummary = ""
      }
      else {
        this.taskSummary = value
        this.data = {
          labels: ['completed', 'uncompleted'],
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
      }
    })

    this.sessionSub$ = this.ngrxStore.select(selectSessions).subscribe(
      (value) => {
        if (value.length>7){
          const startIndex = value.length-7
          for (var i = startIndex ; i < value.length; i++){
            if (this.date.indexOf(value[i].date) == -1) {
              this.date.push(value[i].date)
              this.duration.push(value[i].duration)
            }
          }
        }
        else{
          for (var v of value) {
            if (this.date.indexOf(v.date) == -1) {
              this.date.push(v.date)
              this.duration.push(v.duration)
            }
          }
        }
        this.setBarData();
      }
    )
  }

  ngOnDestroy(): void {
    this.userSub$.unsubscribe()
    this.chatSub$.unsubscribe()
    this.workspaceSub$.unsubscribe()
    this.taskSub$.unsubscribe()
    this.outstandingTaskSub$.unsubscribe()
    this.sessionSub$.unsubscribe()
  }

  changeTab(tab: string) {
    this.accountTab = tab
  }

  enterRoom(name: string) {
    this.ngrxStore.dispatch(enterChatRoom({ name }))
  }

  setBarData(){
    this.barData = {
      labels: this.date,
      datasets: [
        {
          label: 'Focus Session in Minutes',
          barThickness: 30,
          data: this.duration,
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 205, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(201, 203, 207, 0.2)'],
          borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'],
          borderWidth: 1
        }
      ]
    };
    const documentStyle = getComputedStyle(document.documentElement);
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.barOptions = {
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
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#010662',
            font: {
              family: "'Lora', sans-serif",
              size: 14
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#010662',
            font: {
              family: "'Lora', sans-serif",
              size: 14
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  // edit profile 
  editProfileForm(): FormGroup {
    return this.fb.group({
      name: this.fb.control<string>(this.userDetail.name, [Validators.required]),
      email: this.fb.control<string>(this.userDetail.email, [Validators.required, Validators.email])
    })
  }

  checkEdits() {
    return this.editForm.controls['email'].value == this.userDetail.email && this.editForm.controls['name'].value == this.userDetail.name && this.cropImage == ''
  }

  openDialog(event: any) {
    this.imageDialogVisible = true
    this.imageChangedEvent = event;
  }

  closeDialog() {
    this.imageDialogVisible = false
  }

  crop() {
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
    this.ngrxStore.dispatch(updateProfile({ data: formData }))
    this.cropImage = ''
  }

  // change password
  passwordForm(): FormGroup {
    return this.fb.group({
      current: this.fb.control<string>('', [Validators.required]),
      new: this.fb.control<string>('', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")]),
      confirm: this.fb.control<string>('', [Validators.required, Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")])
    })
  }

  unmatchedPassword() {
    return this.changePasswordForm.controls['new'].value != this.changePasswordForm.controls['confirm'].value
  }

  changePassword() {
    const password = this.changePasswordForm.value['current']
    const newPassword = this.changePasswordForm.value['new']
    this.userSvc.changePassword(this.userDetail.email, password, newPassword)
      .then(() => {
        // on successful update
        alert("successfully changed password")
      })
      .catch((error) => {
        // error updating - 1. wrong password, 2. sql update error
        alert(`error changing password: ${error}`)
      })
  }

  // delete account
  deleteForm(): FormGroup {
    return this.fb.group({
      current: this.fb.control<string>('', [Validators.required])
    })
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete this account?')) {
      // successful deletion -> redirect back to home page
      this.userSvc.deleteAccount(this.userDetail.id)
        .then(() => {
          this.router.navigate(['/'])

          // sign out
          firstValueFrom(this.ngrxStore.select(selectCalendarMode)).then((value) => {
            if(value=='google'){
              this.googleSvc.revokeToken()
            }
          })
          this.ngrxStore.dispatch(resetState())
          this.ngrxStore.dispatch(resetTaskState())
          this.ngrxStore.dispatch(resetPlannerState())
          this.ngrxStore.dispatch(resetChatState())
          this.ngrxStore.dispatch(resetFocusState())
        })
        .catch((error) => {
          alert(`error: ${error}`)
        })
    }
  }
}
