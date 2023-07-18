const express = require('express')
const router = express.Router()
const routerbase = '/v1/api'

const knex = require('../Database/connection')

router.get(routerbase + '/noticias', async (req, res) => {
    await knex.raw(`
        SELECT convert_from(images, 'UTF8') as file, titulo, descricao, id FROM tb_noticias
    `).then( resp => {
        res.json(
            {
                titulo: resp.rows[0].titulo,
                descricao: resp.rows[0].descricao,
                image: resp.rows[0].file
            }
        )
    })
    .catch(e => res.json({error: e}))
})

router.get(routerbase + '/noticia/:id', async (req, res) => {
    var id = req.params

    await knex.raw(`
    SELECT convert_from(images, 'UTF8') as file, titulo, descricao, id FROM tb_noticias WHERE id = ${id.id}
    `).then( resp => {
        res.json(
            {
                titulo: resp.rows[0].titulo,
                descricao: resp.rows[0].descricao,
                image: resp.rows[0].file
            }
        )
    })
    .catch(e => res.status(404).json({msg: 'not found'}))
})

router.post(routerbase + '/add/noticia', async (req, res) => {
    var {titulo, descricao} = req.body
    let matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) || req.body.base64image.match(/^data:@([A-Za-z-+\/]+);base64,(.+)$/);
    let response = {}

    response.type = matches[1]
    response.data = new Buffer.from(matches[2], 'base64');
    await knex.raw(`INSERT INTO tb_noticias (titulo, images, descricao) VALUES ('${titulo}', '${matches[2]}', '${descricao}')`).then(() => {res.json({msg: "success"})})
})

module.exports = router