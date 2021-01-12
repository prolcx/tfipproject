import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodService, MemoryService } from '../food.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  todayFoodList: any[] = []
  loginUser: any
  constructor(private fb: FormBuilder, private router: Router,
    private memorySvc: MemoryService, private foodSvc: FoodService) { }

  ngOnInit(): void {
    this.loginUser = this.memorySvc.loginUser
    
    for (let a of this.memorySvc.foodNutrition) {
      const id= a.id
      const title = a.title
      const username = this.memorySvc.loginUser

      const caloriesFind = a.nutrition.nutrients.find(i => i.title === 'Calories');
      var calories = parseInt(caloriesFind?.amount||0 )

      const carbsFind = a.nutrition.nutrients.find(i => i.title === 'Carbohydrates');
      var carbs = parseInt(carbsFind?.amount||0 )

      const fatFind = a.nutrition.nutrients.find(i => i.title === 'Fat');
      var fat = parseInt(fatFind?.amount||0 )

      const sugarFind = a.nutrition.nutrients.find(i => i.title === 'Sugar');
      var sugar = parseInt(sugarFind?.amount||0 )

      const proteinFind = a.nutrition.nutrients.find(i => i.title === 'Protein');
      var protein = parseInt(proteinFind?.amount||0 )

      const cholesterolFind = a.nutrition.nutrients.find(i => i.title === 'Cholesterol');
      var cholesterol = parseInt(cholesterolFind?.amount||0 )

      const fiberFind = a.nutrition.nutrients.find(i => i.title === 'Fiber');
      var fiber = parseInt(fiberFind?.amount||0 )
      
      //save the data here
      this.todayFoodList.push({id, title, calories, carbs, fat, sugar, protein, cholesterol, fiber, username})
  }
  }

  addFood() {
    this.router.navigate([ '/addfood' ])
  }

  saveDiet() {
    console.info('todayFoodList array: ', this.todayFoodList)
    if(this.memorySvc.notYetSave){
      this.memorySvc.notYetSave = false
      this.memorySvc.clearNutrition()
      this.foodSvc.saveDiet(this.todayFoodList)       //When user add food after they saved, it will duplicately uploading the previous items to the database, please fix it.
    }
  }

}
