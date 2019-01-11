const express = require('express')
const bodyparser = require('body-parser')
const redis = require('redis')
const session = require('express-session')
const redisStore = require('connect-redis')(session)
const Twig = require('twig')
const multer = require('multer')
const path = require('path')
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } })
const assert = require('assert')
const fs = require('fs')


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

    if (!app.config.has('express'))
        return app.drivers.logger.error('Express', 'Cannot init the driver, missing config')

    const server = express()
    const config = app.config.get('express')
    if (!config.routes) {
        config.routes = []
        const routesPath = path.join(app.root, 'config/routes.yml')
        if (fs.existsSync(routesPath)) {
            let routeConfig = config.util.parseFile(routesPath)
            config.util.extendDeep(config.routes, routeConfig)
        }
    }

    let errorHandlers = []

    /**
     * Handle async methods/middleware
     * {function} @param fn
     * @returns {*}
     */
    let wrapper = fn => {
        assert.equal(typeof fn, 'function')
        if (!fn) return

        if (fn.length == 4) {
            return (err, req, res, next) => {
                return Promise.resolve(fn(err, req, res, next))
                              .catch(err => next(err))
            }
        }
        return (req, res, next) => {
            return Promise.resolve(fn(req, res, next))
                          .catch(err => next(err))
        }
    }

    /**
     * Initialize the routes
     */
    function route() {
        configure()

        middlewares()

        for (let route of config.routes) {
            if (route.type === 'view')
                server[route.method](route.src, (req, res) => {
                    res.render(`${app.root}/views/${route.dest}.twig`, {})
                })

            if (route.type === 'controller') {
                let path   = route.dest.split('::')[0],
                    method = route.dest.split('::')[1]

                let controller = function () {
                    if (!app.controllers)
                        return require(`${app.root}/controllers/${path.replace('.', '/')}`)(app)

                    if (path.split('.').length > 1)
                        return app.controllers[path.split('.')[0]][path.split('.')[1]]
                    else
                        return app.controllers[path]
                }()

                let func = wrapper(controller[method])
                if (!func)
                    app.drivers.logger.error('blockbase-express - wrapper', `Undefined function ${controller}${method}`)

                if (route.method === 'post' || route.method === 'put')
                    server[route.method](route.src, upload.any(), func)
                else
                    server[route.method](route.src, func)
            }
        }

        errors()
    }

    /**
     * Register error handlers
     */
    function errors() {
        // handling 404 errors from config.express['404_redirect'] property
        if (config['404_redirect']) {
            server.use(function (req, res, next) {
                res.status(302)
                res.writeHead(302, { 'Location': config['404_redirect'] })
                res.end()
            })
        } else {
            server.use(function (req, res, next) {
                res.status(404).send({ message: 'not found' })
            })
        }

        if (errorHandlers.length) {
            for (let eh of errorHandlers) {
                server.use(wrapper(eh))
            }
        }

        //Default error handler
        server.use((err, req, res, next) => {
            if (!config.silent && !errorHandlers.length)
                app.drivers.logger.error('Unhandled server error', err)
            res.status(500).json({ message: err.message, stack: err.stack })
        })
    }

    /**
     * Start the server
     * @param {number|string=}port
     */
    function listen(port = 4000) {
        server.listen(process.env.PORT || config.port || port, () => {
            app.drivers.logger.success('Express', `App listening on port ${config.port}`)
        })
    }

    /**
     * Initialize middlewares in ./middleware using declaration in default.yml or *env*.yml
     */
    function middlewares() {
        app.middlewares = {}
        const basePath = path.join(app.root, '/middlewares')
        let middlewares = app.config.get('express').middlewares
        if (middlewares && Array.isArray(middlewares) && middlewares.length) {
            for (let m of middlewares) {
                let middleware = require(path.join(basePath, m.dest))(app)
                app.middlewares[m.dest.toLowerCase()] = middleware

                if (middleware.length == 4) { //error handler
                    errorHandlers.push(middleware)
                    continue
                }

                if (m.src)
                    server.use(m.src, wrapper(middleware))
                else
                    server.use(wrapper(middleware))
            }
            if (middlewares.length)
                app.drivers.logger.success('Middleware', 'initialized')
        }
    }

    /**
     * trigger methods before and after the routing (use methods almost)
     */
    function configure() {
        server.use(config.assets ? config.assets : '/assets', express.static(`${app.root}/views/assets`))

        server.use(bodyparser.json({ limit: config.body_parser_limit }))
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

    }

    // routing from express.routes in config/{env}.yml and listen
    if (!config.async_init) {
        route()
        listen()
    }

    return { express, server, route, listen }
}
