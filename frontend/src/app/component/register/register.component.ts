import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewUser } from '../../model';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private fb = inject(FormBuilder)
  private userSvc = inject(UserService)
  private router = inject(Router)

  form!: FormGroup
  userExist: boolean = false

  ngOnInit(): void {
    this.form = this.createForm()
  }

  createForm(): FormGroup{
    return this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(64)]),
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")]),
      confirmPassword: this.fb.control<string>('', [Validators.required])
    })
  }

  unmatchedPassword(){
    return this.form.controls['password'].value != this.form.controls['confirmPassword'].value
  }

  register(){
    const user = this.form.value as NewUser

    // check if user's email already exist in db
    this.userSvc.checkUserExist(user.email)
      .then(()=>{
        // user exist, throw error
        this.userExist=true
      })
      .catch(()=>{
        // if user don't exist, create new user
        if (this.form.valid){
          this.userSvc.createUser(user)
          alert("new user created successfully")
          this.form.reset()
          this.router.navigate(['/login'])
        }
        else {
          alert("field(s) have error")
        }
      })
  }
}
