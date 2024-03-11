import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DbStore } from '../../service/db.store';
import { UserService } from '../../service/user.service';
import { LoginDetails } from '../../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private store = inject(DbStore)
  private router = inject(Router)

  form!: FormGroup
  invalid: boolean = false

  ngOnInit(): void {
    this.form = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required])
    })
  }

  login() {
    const details = this.form.value as LoginDetails
    this.userSvc.checkLoginDetails(details.email, details.password)
      .then((value) => {
        // valid email and password
        console.info(value)
        this.store.changeStatus(value)
        // route to account page
        this.router.navigate(['/home'])
      })
      .catch(() => {
        // invalid email or invalid password
        this.invalid = true
      })
  }
}
