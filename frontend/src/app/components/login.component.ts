import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, FoodService, MemoryService } from '../food.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup

  constructor(private fb: FormBuilder, private foodSvc: FoodService, 
  private router: Router, private authAvc: AuthService, private memorySvc: MemoryService ) { }

  ngOnInit(): void {
    this.loginForm = this.createForm()
  }

  private createForm(): FormGroup{
    return this.fb.group({
      username: this.fb.control('fred', [Validators.required]),
      password: this.fb.control('fred', [Validators.required])
    })
  }

  login(){
    let username = this.loginForm.get('username').value
    let password = this.loginForm.get('password').value
  
    console.info(`Username: ${username}, Password: ${password}`)

    this.authAvc.login(username, password)
    .then((result)=>{
      console.log('>>>login result: ', result)
      this.memorySvc.loginUser = result
      this.router.navigate([ '/dashboard' ])
    })
    .catch((e)=>{
      console.info(e)
    })
  }

  signUp() {
    this.router.navigate([ '/signup' ])
  }

  signInWithGoogle() {
    this.authAvc.loginGoogle()
  }
}
