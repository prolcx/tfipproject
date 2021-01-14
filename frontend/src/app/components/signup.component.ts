import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, FoodService, MemoryService } from '../food.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup

  constructor(private fb: FormBuilder, private foodSvc: FoodService, 
  private router: Router, private authAvc: AuthService, private memorySvc: MemoryService ) { }

    ngOnInit(): void {
      this.signupForm = this.createForm()
  }

  private createForm(): FormGroup{
    return this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
      passwordConfirm: this.fb.control(''),
      email: this.fb.control('', [Validators.required]),
      gender: this.fb.control('', [Validators.required])
    },
      {validator: this.checkPasswords })
  }

  checkPasswords(signupForm) { // here we have the 'passwords' group
  let pass = signupForm.get('password').value;
  let confirmPass = signupForm.get('passwordConfirm').value;

  return pass === confirmPass ? null : { notSame: true }     
}

  register(){
    let username = this.signupForm.get('username').value
    let password = this.signupForm.get('password').value
    let email = this.signupForm.get('email').value
    let gender = this.signupForm.get('gender').value
    
    this.foodSvc.registerUser({username, password, email, gender})
    .then(()=>{
      console.info('New User roll out')
      this.router.navigate([ '/' ])
    })
  }

}
