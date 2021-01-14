import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, FoodService, MemoryService } from '../food.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  dashboardForm: FormGroup
  dashboardItem: any[] = []
  dashBoardProgress: any =''
  todayFoodList: any[] = []
  loginUser: any
  imgSign: boolean = false

  constructor(private fb: FormBuilder, private router: Router,
    private memorySvc: MemoryService, private foodSvc: FoodService,
    private authAvc: AuthService) { }

  ngOnInit(): void {

    //dashboard action and selection form
    this.dashboardForm = this.createForm()
    this.loading()

    //get the login person username
    this.loginUser = this.memorySvc.loginUser
    
    //dashboard data
    

    //tidy up unsave data into a temporary array 'todayFoodList'

    this.justAddFoodList()
    
  }

  createForm() : FormGroup{
    return this.fb.group({
      date: this.fb.control(`${new Date().toJSON().slice(0, 10)}`, [Validators.required])
    })
  }

  addFood() {
    this.router.navigate([ '/addfood' ])
  }

  saveDiet() {
    console.info('todayFoodList array: ', this.todayFoodList)
    if(this.memorySvc.notYetSave){
      this.memorySvc.notYetSave = false
      // perform check on mongo db, if existing, dont cache, if not, cache
      // cache the mongodb here the raw food nutrition data you have searched
      // perform custom transaction here
      this.todayFoodList.push({title: 'cache', array: this.memorySvc.foodNutrition})

      this.memorySvc.clearNutrition()
      this.foodSvc.saveDiet(this.todayFoodList)       //When user add food after they saved, it will duplicately uploading the previous items to the database, please fix it.
      this.loading()
      this.todayFoodList = []
    }
  }

  justAddFoodList() {
    for (let a of this.memorySvc.foodNutrition) {
      const id= a.id
      const title = a.title
      const username = this.memorySvc.loginUser

      const caloriesFind = a.nutrition.nutrients.find(i => i.title === 'Calories');
      var calories = parseInt(caloriesFind?.amount||0 )
      var caloriesNeeded = parseInt(caloriesFind?.percentOfDailyNeeds||0 )

      const carbsFind = a.nutrition.nutrients.find(i => i.title === 'Carbohydrates');
      var carbs = parseInt(carbsFind?.amount||0 )
      var carbsNeeded = parseInt(carbsFind?.percentOfDailyNeeds||0 )

      const fatFind = a.nutrition.nutrients.find(i => i.title === 'Fat');
      var fat = parseInt(fatFind?.amount||0 )
      var fatNeeded = parseInt(fatFind?.percentOfDailyNeeds||0 )

      const sugarFind = a.nutrition.nutrients.find(i => i.title === 'Sugar');
      var sugar = parseInt(sugarFind?.amount||0 )
      var sugarNeeded = parseInt(sugarFind?.percentOfDailyNeeds||0 )

      const proteinFind = a.nutrition.nutrients.find(i => i.title === 'Protein');
      var protein = parseInt(proteinFind?.amount||0 )
      var proteinNeeded = parseInt(proteinFind?.percentOfDailyNeeds||0 )

      const cholesterolFind = a.nutrition.nutrients.find(i => i.title === 'Cholesterol');
      var cholesterol = parseInt(cholesterolFind?.amount||0 )
      var cholesterolNeeded = parseInt(cholesterolFind?.percentOfDailyNeeds||0 )

      const fiberFind = a.nutrition.nutrients.find(i => i.title === 'Fiber');
      var fiber = parseInt(fiberFind?.amount||0 )
      var fiberNeeded = parseInt(fiberFind?.percentOfDailyNeeds||0 )

      const saturatedFind = a.nutrition.nutrients.find(i => i.title === 'Saturated Fat');
      var saturated = parseInt(saturatedFind?.amount||0 )
      var saturatedNeeded = parseInt(saturatedFind?.percentOfDailyNeeds||0 )

      const transFind = a.nutrition.nutrients.find(i => i.title === 'Trans Fat');
      var trans = parseInt(transFind?.amount||0 )
      var transNeeded = parseInt(transFind?.percentOfDailyNeeds||0 )
            
      this.todayFoodList.push({id, title, calories, caloriesNeeded, carbs, carbsNeeded, fat, fatNeeded,
        sugar, sugarNeeded, protein, proteinNeeded, cholesterol, cholesterolNeeded, fiber, fiberNeeded,
        saturated, saturatedNeeded, trans, transNeeded, username})
    }
  }

  async loading() {
    let selection = {
      date: `${this.dashboardForm.get('date').value} 00:00:00`,
      name: this.memorySvc.loginUser
    }
  
    await this.foodSvc.dashBoardLoading(selection)
    .then((result)=>{
      console.log('>>>loading result: ', result)
      this.dashboardItem = result
    })
    .catch((e)=>{
      console.info(e)
    })

    await this.foodSvc.dashBoardLoadingProgress(selection)
    .then((result)=>{
      console.log('>>>progress result: ', result[0])
      this.dashBoardProgress = result[0]
      if(this.dashBoardProgress.caloriesPercent >=100 || this.dashBoardProgress.saturatedPercent >=100
        || this.dashBoardProgress.transPercent >=100 || this.dashBoardProgress.carbohydratesPercent >=100
        || this.dashBoardProgress.sugarPercent >=100 || this.dashBoardProgress.proteinPercent >=100) {
        this.imgSign = true
        console.log(this.imgSign)
      }
      else{
        this.imgSign = false
        console.log(this.imgSign)
      }
    })
    .catch((e)=>{
      console.info(e)
    })
  }

  async deleteDashBoardItem(id) {
    await this.foodSvc.deleteDashBoardFood(id)
    await this.loading()
  }

  deleteJustAddedItem(i) {
    this.todayFoodList.splice(i, 1)
    this.memorySvc.foodNutrition.splice(i, 1)
  }

}
