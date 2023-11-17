const express = require('express')
const knex = require('../Database/connection.js')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('API Rodando')
})

router.get('/login', (req, res) => {
    res.render('index')
})

router.post('/login', async (req, res) => {
    var { email, senha } = req.body
    console.log(email + ' ' + senha)
    await knex.raw(`SELECT * FROM tb_users WHERE email = '${email}' AND senha = '${senha}'`)
    .then(resp => {
        if(resp.rows[0] == undefined){
            res.redirect('/login')
        }else{
            res.redirect('/')
        }
    })
})

module.exports = router