const express = require('express')
const moment = require('moment')
const router = express.Router()
const routerbase = '/v1/api'

const knex = require('../Database/connection')

router.get(routerbase + '/noticias', async (req, res) => {
    await knex.raw(`
        SELECT convert_from(images, 'UTF8') as file, data_public, titulo, descricao, id, conteudo FROM tb_noticias ORDER BY id DESC LIMIT 5
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
    SELECT CAST(data_public as date) as pub_date, 
    CAST(data_public as time) as pub_time, 
    titulo, 
    descricao, 
    id, 
    conteudo,
    convert_from(images, 'UTF8') as file
    FROM tb_noticias 
    WHERE id = ${id.id}
    `).then( resp => {
        if(resp.rows[0] == undefined){
            res.status(404).json(
                {
                    response: 'Not Found News With id ' + id.id
                }
            )
        }else{
            console.log(resp.rows[0].pub_date + ' - ' + resp.rows[0].pub_time)
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
    var time = moment().format('YYYY-MM-DD HH:mm:ss')

    response.type = matches[1]
    console.log(response.type)
    response.data = new Buffer.from(matches[2], 'base64');
    await knex.raw(`INSERT INTO tb_noticias (titulo, images, descricao, conteudo, data_public) VALUES ('${titulo}', '${matches[2]}', '${descricao}', '${conteudo}', '${time}')`)
    .then(() => {res.json({msg: "success"})})
    .catch(e => {
        console.log(e)
        res.status(401).json({msg: 'Unhauthorized'})
    })
})

router.get(routerbase + '/noticias/list', async(req, res) => {
    var page = req.query

    page.page < 1 ? page.page = 1 : page.page

    const limite = 5

    var totalPage = await knex.raw(`
        SELECT CEILING(cast(count(*) as numeric(18, 2)) / cast(${limite} as numeric(18, 2))) as totalPage FROM tb_noticias
    `);

    const totalDePaginas = totalPage.rows[0].totalpage

    page.page > totalDePaginas ? page.page = totalDePaginas : page.page;

    var pg = 5 * (page.page - 1)

    if(totalDePaginas == 0){
        res.status(404).json({msg: "No data was found!"})
    }else{
        await knex.raw(`
            SELECT id, titulo, descricao, conteudo, data_public, convert_from(images, 'UTF8') as file FROM tb_noticias ORDER BY id DESC LIMIT ${limite} OFFSET ${pg}
        `).then( resp => {
            if(resp.rows[0] == undefined){
                res.status(404).json({response: "Not Found!"})
            }else{
                res.status(201).json(
                    {
                        response: resp.rows,
                        pagina_atual: page.page,
                        total_paginas: totalDePaginas
                    })
            }
        })
        .catch( e => {
            console.log(e)
            res.status(404).json({msg: "Unhauthorized"})
        })
    }
    
})

router.put(routerbase + '/edit', async(req, res) => {
    var id = req.query
    var { teste } = req.body

    var exist = await knex.raw(`
        SELECT * FROM tb_noticias WHERE id = ${id.id}
    `)

    console.log(exist.rows[0])
    console.log(id.id)
    console.log(teste)

    if(exist.rows[0] == undefined){
        console.log('Não Existe')
    }else{
        console.log('Existe')
    }

})

router.delete(routerbase + '/delete', async (req, res) => {
    var id = req.query

    await knex.raw(`
        DELETE FROM tb_noticias WHERE id = ${id.id}
    `).then(() => {
        res.status(200).json({msg: "Success"})
    })
    .catch(() => res.status(401).json({msg: "Unhauthorized"}))
})

module.exports = router