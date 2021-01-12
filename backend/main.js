//import
const express = require('express')
const morgan = require('morgan')
const secureEnv = require('secure-env')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const sha1 = require('sha1')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

//condigure mongoDB
// const MongoClient = require('mongodb').MongoClient
// const { parse } = require('path')
// const MONGO_URL = 'mongodb://localhost:27017'
// const mongoClient = new MongoClient(MONGO_URL,
//     {useNewUrlParser: true, useUnifiedTopology: true})

//configure my sql
//credential
global.env = secureEnv({secret: 'secretPassword'})
const pool = mysql.createPool({
    host: global.env.MYSQL_SERVER,
    port: global.env.MYSQL_SVR_PORT,
    user: global.env.MYSQL_USERNAME,
    password: global.env.MYSQL_PASSWORD,
    database: global.env.MYSQL_SCHEMA,
    connectionLimit: global.env.MYSQL_CON_LIMIT
})

//sql queries
const queryLogin = 'select * from login where username = ?'

//Processing SQL queries
const makeQuery = (sql, pool) =>{
	console.log(sql)
	return (async (args)=>{
		const conn = await pool.getConnection()
		try{
			let results = await conn.query(sql, args || [])
			// console.log(results[0])
			return results[0]
		}catch(e){
			console.log(e)
		}finally{
			conn.release()
		}
	})
}

//close function for queries
const getLogin = makeQuery(queryLogin, pool)

//core and configure passport
passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    (req, user, password, done)=>{
        //mysql checking
        username = req.body.username
        password = sha1(req.body.password)
        
        getLogin(username).then((result)=>{
            // console.log(result)
            const authResult = (result[0].username== username && result[0].password == password)
            if (authResult) {
                done(null, 
                    //info about the user
                    {
                        username: user,
                        loginTime: (new Date()).toString(),
                        security: 2
                    })
                    return
            }
            //incorrect login
            done('incorrect usename and password', false)
        })
        .catch((e)=>{
            console.log('Username not found !')
            resp.status(401).json({message: 'Username not found'})
        })
    }
))

//configure express, morgan, body parser, secure-env, passport
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(passport.initialize())

//setup port
const PORT = parseInt(process.argv[2]) || parseInt(global.env.PORT) || 3000

//API endpoints and details
const API_KEY = global.env.API_KEY || ""
const ENDPOINT_FOOD_SEARCH = 'https://api.spoonacular.com/food/menuItems/search'
const ENDPOINT_FOOD_ID_SEARCH = 'https://api.spoonacular.com/food/menuItems/'

//POST Request: Browse for food id
app.post('/', async (req, resp) => {
    const url = withQuery(
        ENDPOINT_FOOD_SEARCH, {
            query: req.body.foodName,
            number: 5,
            apiKey: API_KEY,
        })
    console.info(req.body)
    console.info(url)

    const a = await fetch(url)
    const foodSearch = await a.json()
    
    console.info(foodSearch)

    const result=[]
    for (let b of foodSearch.menuItems) {
        const id= b.id
        const title = b.title
        const restaurant = b.restaurantChain
        const imageUrl = b.image
        //save the data here
        result.push({id, title, restaurant, imageUrl})
    }

    resp.status(200)
    resp.json(result)
})

//POST Request: Browse foor nutrient by id
app.post('/id', async (req, resp) => {

    foodNutrientResult = []
    for (let c of req.body) {
        const id= c.id
        const url = withQuery(
            ENDPOINT_FOOD_ID_SEARCH+id, {
                apiKey: API_KEY,
            })
        console.info('search food by id url: ', url)
        
        const d = await fetch(url)
        const foodNutrientSearch = await d.json()
        
        console.info("foodNutrientSearch: ", foodNutrientSearch)
        
        // save the data here
        foodNutrientResult.push(foodNutrientSearch)
    }    
    resp.status(200)
    resp.json(foodNutrientResult)
})

//POST Request: Save the daily diet into Mysql
app.post('/save', (req, resp)=>{

    const todayFoodList = req.body
    const insertTodo = async (todayFoodList) =>{
        const conn = await pool.getConnection()
        try{
            await conn.beginTransaction()
            
            for( let e of todayFoodList) {
            await conn.query(`INSERT INTO nutrition (food, calories, carbohydrates, fat, sugar, protein, cholesterol, fiber, date, username, foodId)
             values (?, ?, ?, ?, ?, ?, ?, ? ,? ,?, ?)`,
             [e.title, e.calories, e.carbs, e.fat, e.sugar, e.protein,
             e.cholesterol, e.fiber, `${new Date().toJSON().slice(0, 10)} 00:00:00`, e.username, e.id] )
            }
            await conn.commit()
        } catch(e){
            conn.rollback()
        } finally {
            conn.release()
        }
    }
    insertTodo(todayFoodList)
    
    resp.status(200).json({})
            
})

//POST Request: Login Authentication and Obtaining JSON Web Token
app.post('/login', 
    //custom middleware to handle request
    //passport.authenticate('local', { session: false}),
    (req, resp, next) =>{
        passport.authenticate('local',
        (err, user, info)=>{
            if (null != err) {
                resp.status(401)
                resp.json({error: err})
                return
            }
            console.info(`passport user: `, user)
            req.user=user;
            next()
        })
        (req, resp, next)
    },
    // passport.authenticate('local', { session: false}),
    (req,resp) =>{
        //do smth
        console.info(`user: `, req.user)
        //generate JWT token
        const currTime= (new Date()).getTime()/1000
        const token = jwt.sign({
            sub: 'req.user.username',
            iss: 'myapp',
            iat: currTime,
            // nbf: currTime,
            // exp: currTime + 1000000,
            data: {
                avatar: req.user.avatar,
                loginTime: req.user.loginTime
            }
        }, global.env.TOKEN_SECRET)
        resp.status(200)
        resp.type('application/json')
        resp.json({ message: `Login in at ${new Date()}`, token, username: req.user.username})
    }
)

//listen
pool.getConnection()
.then( conn =>{
    console.info('Pinging Database...')
    const p0 = Promise.resolve(conn)
    const p1 = conn.ping()
    return Promise.all([p0,p1])
})
.then(result =>{
    const conn = result[0]
    conn.release()
    app.listen(PORT, () =>{
        console.info(`Application started at ${PORT} at ${new Date()}`)
    })
}).catch(e=>{
    console.error('Cannot start server: ',e)
})
