import { HttpClient, HttpParams} from '@angular/common/http'
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

const SERVER_INSERT = '/'
const SERVER_INSERT_ID = '/id'
const SERVER_DASHBOARD = '/dashboard'
const SERVER_DASHBOARD_PROGRESS = '/dashboard/progress'
const SERVER_INSERT_SAVE = '/save'
const SERVER_DASHBOARD_DELETE = '/dashboard/delete'

const SERVER_INSERT_LOGIN = '/login'
const SERVER_INSERT_SIGNUP = '/signup'
const SERVER_INSERT_LOGIN_GOOGLE = '/auth/google'

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

    async dashBoardLoading(selection): Promise<any>{
        // console.log(selection)
        return await this.http.get<any>(`${SERVER_DASHBOARD}/${selection.date}${selection.name}`)
        .toPromise()
    }

    async dashBoardLoadingProgress(selection): Promise<any>{
        // console.log(selection)
        return await this.http.get<any>(`${SERVER_DASHBOARD_PROGRESS}/${selection.date}${selection.name}`)
        .toPromise()
    }

    async saveDiet(todayFoodList): Promise<any>{
        // console.log(todayFoodList)
        return await this.http.post<any>(SERVER_INSERT_SAVE, todayFoodList)
        .toPromise()
    }

    async deleteDashBoardFood(id): Promise<any>{
        console.log(id)
        return await this.http.delete<any>(`${SERVER_DASHBOARD_DELETE}/${id}`)
        .toPromise()
    }

    async registerUser(userDetail): Promise<any>{
        // console.log(userDetail)
        return await this.http.post<any>(SERVER_INSERT_SIGNUP, userDetail)
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

    constructor (private http: HttpClient, private router: Router, private memorySvc: MemoryService) { }

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

    loginGoogle() {
        this.token = ''

        window.open(SERVER_INSERT_LOGIN_GOOGLE, 'mywindow', 'location=1,status=1,scrollbars=1,width=800,height=600')
        window.addEventListener('message', (message)=>{

            console.info('google return message: ', message)
            this.token = message.data.token

            if (this.token!= ''){
                this.memorySvc.loginUser = message.data.user.emails[0].value
                this.router.navigate(['/dashboard'])
            }
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