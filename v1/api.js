const express = require('express')
const router = express.Router()
const routerbase = '/v1/api'

const knex = require('../Database/connection')

router.get(routerbase + '/noticias', async (req, res) => {
    await knex.raw(`
        SELECT convert_from(images, 'UTF8') as file, titulo, descricao, id, conteudo FROM tb_noticias ORDER BY id DESC LIMIT 5
    `).then( resp => {
        if(resp.rows[0] == undefined){
            res.status(404).json(
                {
                    response: "Nenhuma Notícia Registrada"
                }
            )
        }else{
            res.json(
                {
                    response: resp.rows
                }
            )
        }
    })
    .catch(e => res.json({error: e}))
})

router.get(routerbase + '/noticia/:id', async (req, res) => {
    var id = req.params

    await knex.raw(`
    SELECT convert_from(images, 'UTF8') as file, titulo, descricao, id, conteudo FROM tb_noticias WHERE id = ${id.id}
    `).then( resp => {
        if(resp.rows[0] == undefined){
            res.status(404).json(
                {
                    response: 'Not Found News With id ' + id.id
                }
            )
        }else{
            res.json(
                {
                    response: resp.rows
                }
            )
        }
        
    })
    .catch(e => res.status(404).json({msg: 'not found news with id ' + id.id}))
})

router.post(routerbase + '/add/noticia', async (req, res) => {
    console.log('Realizando requisição')
    var {titulo, descricao, conteudo} = req.body
    let matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) || req.body.base64image.match(/^data:@([A-Za-z-+\/]+);base64,(.+)$/);
    let response = {}

    response.type = matches[1]
    response.data = new Buffer.from(matches[2], 'base64');
    await knex.raw(`INSERT INTO tb_noticias (titulo, images, descricao, conteudo) VALUES ('${titulo}', '${matches[2]}', '${descricao}', '${conteudo}')`)
    .then(() => {res.json({msg: "success"})})
    .catch(e => {
        console.log(e)
        res.status(401).json({msg: 'Unhauthorized'})
    })
})

router.get(routerbase + '/noticias/list', async(req, res) => {
    var page = req.query

    const limite = 5

    var pg = 5 * page.page

    console.log(pg)
    
    await knex.raw(`
    SELECT id, titulo, descricao, conteudo, convert_from(images, 'UTF8') as file FROM tb_noticias ORDER BY id DESC LIMIT ${limite} OFFSET ${pg}
    `).then( resp => {
        if(resp.rows[0] == undefined){
            res.status(404).json({response: "Not Found!"})
        }else{
            res.status(201).json({response: resp.rows})
        }
    })
})

module.exports = router