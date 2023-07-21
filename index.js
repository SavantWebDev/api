require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 5578
const userController = require('./controller/userController')
const apiController = require('./v1/api')
const session = require('express-session')
const bodyParser = require('body-parser')

const cors = require('cors')

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}))

app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))
app.use(bodyParser.json({limit: "50mb", extended: true, parameterLimit: 50000}))

app.use(cors({
    origin: "*"
}))

app.use('/', userController)
app.use('/', apiController)

app.listen(PORT, () => {
    console.log('Servidor rodando na porta '+ PORT)
})