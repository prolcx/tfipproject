import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';
import { AddfoodComponent } from './components/addfood.component';
import { FoodService, MemoryService, AuthService } from './food.service';
import { UnauthorizedComponent } from './components/unauthorized.component';
import { SignupComponent } from './components/signup.component';

const ROUTES: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: MainComponent,
    canActivate: [AuthService] },
  { path: 'addfood', component: AddfoodComponent,
    canActivate: [AuthService] },
  { path: 'error', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    AddfoodComponent,
    UnauthorizedComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    FormsModule, ReactiveFormsModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    FoodService, MemoryService
    ,AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
