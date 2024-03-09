import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DbStore } from '../../service/db.store';
import { UserService } from '../../service/user.service';
import { LoginDetails } from '../../model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private store = inject(DbStore)

  form!: FormGroup
  invalid: boolean = false

  ngOnInit(): void {
    this.form = this.createForm();
  }

  createForm(): FormGroup{
    return this.fb.group({
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required])
    })
  }

  login(){
    const details = this.form.value as LoginDetails
    this.userSvc.checkUserExist(details.email)
      .then(() => {
        this.userSvc.checkLoginDetails(details.email, details.password)
          .then(() => {
            // valid email and password
            this.store.changeStatus()
          })
          .catch(() => {
            // valid email, invalid password
            this.invalid = true
          })
      })
      .catch(() => {
        // invalid email
        this.invalid = true
      })
  }
}
