import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);

  form!: FormGroup

  ngOnInit(): void {
    this.form = this.createForm();
  }

  createForm(): FormGroup{
    return this.fb.group({
      name: this.fb.control<string>('', [Validators.required, Validators.minLength(3)]),
      email: this.fb.control<string>('', [Validators.required, Validators.email]),
      password: this.fb.control<string>('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\!\\?~/\\-'\\[\\];\\(\\)\\{\\}:\\<\\>\\.,@#\\$%\\^&+\\=\\*\\_\\\\])(?=\\S+$).*$")]),
      confirmPassword: this.fb.control<string>('', [Validators.required])
    })
  }

  unmatchedPassword(){
    return this.form.controls['password'].value != this.form.controls['confirmPassword'].value
  }

  register(){
    alert("successfully signed up!")
  }
}
