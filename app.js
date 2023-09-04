const express = require('express')
const fs = require('fs');
var http = require('https');


const menu = require('./menu.json')
const data = require('./output.json')
const bodyParser = require('body-parser')
const { v4: uuidv4 } = require('uuid');
const {check, validationResult, body } = require('express-validator');
const session = require('express-session')
app = express();


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
  }))

const user = {
    userName : "example@gmail.com",
    password : "12345678"
}

app.set('view engine', 'ejs')

app.use(express.static('public'))
// app.use(loadData);


app.get('/', (req, res) => {
    
    console.log(menu.length)

   

    res.render('index', {hasUser : req.session.user, menus : menu })
})

app.get('/login', (req, res) => {
    
    res.render("login")
})

app.post('/login', body('email').notEmpty().isEmail().withMessage("Enter a valid email"), body('password').notEmpty().isLength({ min: 8 }).withMessage("Invalid password") , (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.errors[0].msg)
        let msg = '';
        const errResult = errors.errors;
        for (const err in errResult) {
            msg += `${errResult[err].msg} `;
        }
        res.render("login", {err : msg})
        
    }else{

    if(req.body.email == user.userName && req.body.password == user.password){
        
        req.session.regenerate(function (err) {
        
            req.session.user = req.body.email
        
        })
        //Save session
        req.session.save(function (err) {
            res.redirect('/reservation')
        })
    }else
    {
        res.render("login", { err: "Your credential does not exist"})
    }
    }
})


app.get('/new_reservation', (req, res) => {
    if(req.session.user){
        res.redirect('/reservation')
    }else{
        res.redirect('/login')
    }
})

app.get('/reservation', (req, res) => {
    
    if(req.session.user){
        res.render('reservation', { hasUser : req.session.user})
    }
})

app.post('/reservation', [body('date').notEmpty().withMessage('Please Enter a date'), body('diners').notEmpty(), body('occasion').notEmpty(), body('time').notEmpty(), body('fname').notEmpty(), body('lname').notEmpty(), body('email').notEmpty().isEmail(),], (req, res) =>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors)
    }

    res.render('reservation', { hasUser : req.session.user, reserved : true})

})

app.get('/logout', (req, res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send(err);
        }

    })
    res.redirect('/login')
});



app.listen(3000)



///_______________ Helper Function (disregard) _____________________

function loadData(req, res, next){
    
    const dataJSON = data;
    const dataID = dataJSON.meals[0].id;
    console.log(dataJSON.meals.length)
    const meals = []
    for (let index = 0; index < dataID.length; index++) {
        
        const urldata = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${dataID[index]}`
        let dataString =''

        http.get(urldata, function(response) {
        response.on('data' , function (result) {
           dataString +=  result.toString();
           //console.log(response)
        })
        response.on('end', () => {
            // console.log(JSON.parse(test))
            const mealData = JSON.parse(dataString)
            const meal = mealData.meals[0];
            meals.push({ name: meal.strMeal, category: meal.strCategory,  img: meal.strMealThumb , origin: meal.strArea })
            //console.log(meal)
            menuData = JSON.stringify(meals)
            //createJSONfile(out)
            test = ""
        });
    })
    }
    next()
   
}


function createJSONfile(jsonData){
    fs.writeFile("menu.json", jsonData, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
     
        console.log("JSON file has been saved.");
    });
}


