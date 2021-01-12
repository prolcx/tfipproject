import { HttpClient, HttpParams} from '@angular/common/http'
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

const SERVER_INSERT = '/'
const SERVER_INSERT_ID = '/id'
const SERVER_INSERT_SAVE = '/save'

const SERVER_INSERT_LOGIN = '/login'

@Injectable()

export class FoodService {
    constructor(private http: HttpClient){
    }
    async postFoodName(foodName): Promise<any>{
        // console.log(foodName)
        return await this.http.post<any>(SERVER_INSERT, foodName)
        .toPromise()
    }
    async postFoodChosen(foodChosen): Promise<any>{
        // console.log(foodChosen)
        return await this.http.post<any>(SERVER_INSERT_ID, foodChosen)
        .toPromise()
    }

    async saveDiet(todayFoodList): Promise<any>{
        // console.log(todayFoodList)
        return await this.http.post<any>(SERVER_INSERT_SAVE, todayFoodList)
        .toPromise()
    }
}

export class MemoryService {

    foodChosen: any[] = []
    foodNutrition: any[] = []
    notYetSave: boolean = false
    loginUser: string

    clearFoodChosen() {
        this.foodChosen = []
    }

    clearNutrition() {
        this.foodNutrition = []
    }
}

@Injectable()
export class AuthService implements CanActivate{

    private token = ''

    constructor (private http: HttpClient, private router: Router) { }

    login( username, password): Promise<string> {
        //write a call to the backend
        //examine the status code
        return this.http.post<any>(SERVER_INSERT_LOGIN, {username, password}, {observe: 'response'} )
        .toPromise().then( resp => {
            if (resp.status == 200) {
                this.token = resp.body.token
            }
            console.info('resp: ', resp)
            return resp.body.username
        })
        .catch( err => {
            if(err.status ==401) {
                //handle error

            }
            console.info('err', err)
            return false
        })
    }

    isLogin() {
        return this.token != ''
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if( this.isLogin()) 
            return true

        return this.router.parseUrl('/error')
    }
}