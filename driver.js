const express = require('express')
const bodyparser = require('body-parser')
const redis = require('redis')
const session = require('express-session')
const redisStore = require('connect-redis')(session)
const Twig = require('twig')
const multer = require('multer')
const path = require('path')
const upload = multer({limits: {fileSize: 50 * 1024 * 1024}})
//@TODO make multer config possible in {env}.yml

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

    /**
     * Initialize the routes
     */
    function route() {
        use()

        for (let route of app.config.get('express').routes) {
            if (route.type === 'view')
                server[route.method](route.src, (req, res) => {
                    res.render(`${app.root}/views/${route.dest}.twig`, {})
                })

            if (route.type === 'controller') {
                let path = route.dest.split('::')[0],
                    method = route.dest.split('::')[1]

                let controller = function () {
                    if (!app.controllers)
                        return require(`${app.root}/controllers/${path.replace('.', '/')}`)(app)

                    if (path.split('.').length > 1)
                        return app.controllers[path.split('.')[0]][path.split('.')[1]]
                    else
                        return app.controllers[path]
                }()

                if (route.method === 'post' || route.method === 'put')
                    server[route.method](route.src, upload.any(), controller[method])
                else
                    server[route.method](route.src, controller[method])
            }
        }

        use(true)
    }

    /**
     * start the server
     * @param {number|string=}port
     */
    function listen(port) {
        server.listen(port || config.port, () => {
            app.drivers.logger.success('Express', `App listening on port ${config.port}`)
        })
    }

    /**
     * Initialize middlewares
     */
    function middlewares() {

        app.middlewares = {}
        const basePath = path.join(app.root, '/middlewares')
        let middlewares = app.config.get('express').middlewares
        if (middlewares && Array.isArray(middlewares) && middlewares.length) {
            for (let m of middlewares) {
                let middleware = require(path.join(basePath, m.dest))(app)
                app.middlewares[m.dest.toLowerCase()] = middleware

                if (m.src)
                    server.use(m.src, middleware)
                else
                    server.use(middleware)
            }
            if (middlewares.length)
                app.drivers.logger.success('Middleware', 'initialized')
        }
    }

    function use(state = false) {
        // state is true if routes has been declared (use before)
        if (!state) {
            server.use(config.assets ? config.assets : '/assets', express.static(`${app.root}/views/assets`))

            server.use(bodyparser.json({limit: config.body_parser_limit}))
            server.use(bodyparser.urlencoded({
                parameterLimit: 10000,
                limit: config.body_parser_limit,
                extended: true
            }))

            if (config.session) {
                server.use(session({
                    secret: config.session_secret,
                    store: new redisStore({
                        host: config.session_redis_host || 'localhost',
                        port: config.session_redis_port || 6379,
                        client: redis.createClient()
                    }),
                    resave: false,
                    saveUninitialized: true
                }))
            }

            server.set('views', `${app.root}/views`)
            server.set('view engine', 'twig')

            middlewares()

        }

        if (state) {
            // handling 404 errors from config.express['404_redirect'] property
            server.use(function (req, res, next) {
                res.status(404)
                res.writeHead(302, {'Location': config['404_redirect'] || '/'})
                res.end()
            })
        }
    }

    if (!app.config.has('express'))
        return app.drivers.logger.error('Express', 'Cannot init the driver, missing config')

    const config = app.config.get('express')

    // routing from express.routes in config/{env}.yml and listen
    if (!config.async_init) {
        route()
        listen()
    }

    return {express, server, route, listen}
}
