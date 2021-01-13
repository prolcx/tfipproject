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
  foodResult: [] = []
  foodList: any[] = []
  foodResultTest: boolean
  foodAddedTest: boolean

  constructor(private fb: FormBuilder, private foodSvc: FoodService, 
    private router: Router, private memorySvc: MemoryService) { }

  ngOnInit(): void {
    this.foodForm = this.createForm()
   
    this.foodList = this.memorySvc.foodChosen
    // console.info('>>>food chosen: ', this.memorySvc.foodChosen)
    if(this.foodResult.length<=0)
      this.foodResultTest = false
    
    if(this.foodList.length<=0)
      this.foodAddedTest = false
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
      this.foodResultTest = true
    })
  }

  addFood(a) {
    console.info(a)
    this.memorySvc.foodChosen.push(a)
    this.foodAddedTest = true
    console.info('food you have choose (single added): ', this.memorySvc.foodChosen)
  } 

  confirmFood() {

    if(this.memorySvc.foodChosen.length>0){
      this.memorySvc.notYetSave = true
      //perform checking in mongo if the data exist, if exist dont have to use api call, if not perform as below
      //if dont use api call, retrieve from mongo and push it to nutrient

      this.foodSvc.postFoodChosen(this.foodList)
      .then((result)=>{

        for(let each of result) {
        this.memorySvc.foodNutrition.push(each)
        }
        console.info('food nutrient array: ', this.memorySvc.foodNutrition)

        this.memorySvc.clearFoodChosen()
        this.router.navigate([ '/dashboard' ])
      })
    }
  }

  deleteFoodListItem(i){
    this.foodList.splice(i, 1)
  }

}
