import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService, MemoryService } from '../food.service';

@Component({
  selector: 'app-addfood',
  templateUrl: './addfood.component.html',
  styleUrls: ['./addfood.component.css']
})
export class AddfoodComponent implements OnInit {

  foodForm: FormGroup
  foodResult: []
  foodList: any[] = []

  constructor(private fb: FormBuilder, private foodSvc: FoodService, 
    private router: Router, private memorySvc: MemoryService) { }

  ngOnInit(): void {
    this.foodForm = this.createForm()
    this.foodList = this.memorySvc.foodChosen
    
  }

  private createForm(): FormGroup {
    return this.fb.group({
      food: this.fb.control('', [Validators.required])
    })
  }

  searchFood(){
    this.foodSvc.postFoodName({foodName: this.foodForm.get('food').value})
    .then((result)=>{
      console.info('food you try to search: ', result)
      this.foodResult = result
    })
  }

  addFood(a) {
    console.info(a)
    this.memorySvc.foodChosen.push(a)
    console.info('food you have choose (single added): ', this.memorySvc.foodChosen)
  } 

  confirmFood() {

    if(this.memorySvc.foodChosen.length>0){
      this.memorySvc.notYetSave = true
      this.foodSvc.postFoodChosen(this.foodList)
      .then((result)=>{
        
        console.info('result to be insert into nutrient array: ', result)

        for(let each of result) {
        this.memorySvc.foodNutrition.push(each)
        }
        console.info('food nutrient array: ', this.memorySvc.foodNutrition)

        this.memorySvc.clearFoodChosen()
        this.router.navigate([ '/dashboard' ])
      })
    }
  }

}
