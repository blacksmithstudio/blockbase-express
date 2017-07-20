const express = require('express')
const bodyparser = require('body-parser')
const multer = require('multer')
const upload = multer({ dest : 'uploads/' })

/**
 * Blockbase Express driver (app.drivers.express)
 * @memberof app.drivers
 * @author Alexandre Pereira <alex@blacksmith.studio>
 * @param {Object} app - Application namespace
 *
 * @returns {Object} driver object containing public methods
 */
module.exports = (app) => {
    const server = express()

    if(!app.config.has('express'))
        return app.drivers.logger.error('Express', 'Cannot init the driver, missing config')

    const config = app.config.get('express')

    // server add ons
    server.use('/assets', express.static(`${app.root}/views/assets`))
    server.use(bodyparser.json({ limit: config.body_parser_limit }))
    server.use(bodyparser.urlencoded({
        parameterLimit: 10000,
        limit : config.body_parser_limit,
        extended: true
    }))

    // routing from express.routes in config/{env}.yml
    for(let route of app.config.get('express').routes){
        if(route.type === 'view')
            server[route.method](route.src, (req, res) => { res.sendFile(`${app.root}/views/${route.dest}.html`)})

        if(route.type === 'controller'){
            if(route.method === 'post' || route.method === 'put')
                server[route.method](route.src, upload.single('import'), require(app.root + route.dest.split('::')[0])(app)[route.dest.split('::')[1]])
            else
                server[route.method](route.src, require(app.root + route.dest.split('::')[0])(app)[route.dest.split('::')[1]])
        }
    }

    // handling 404 errors from config.express['404_redirect'] property
    server.use(function(req, res, next){
        res.status(404)
        res.writeHead(302, {'Location': config['404_redirect'] || '/'})
        res.end()
    })

    server.listen(config.port, ()=>{
        app.drivers.logger.success('Express', `App listening on port ${config.port}`)
    })

    return { express, server }
}
