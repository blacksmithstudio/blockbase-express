/**
 * Blockbase test file
 * @author Blacksmith <code@blacksmith.studio>
 */
const should = require('should')
process.env['NODE_CONFIG_DIR'] = __dirname + '/config'

const blockbase = require('blockbase')

let driver
let application
let client
blockbase({root: __dirname}, async app => {
    driver = app.drivers.express = require('../driver')(app)
    driver.route()
    driver.listen()
    application = app
    client = require('./client')(app)
})

describe('Express driver tests', async function () {
    describe('Initialization', function () {
        it('should initialize the app', async function () {
            should.exist(application)
        })
    })

    describe('Architecture', function () {
        it('should have controllers', function () {
            should.exist(application.controllers)
            should.exist(application.controllers.foo)
            should.exist(application.controllers.foo.bar)
            should.exist(application.controllers.foo.throw500)
        })

        it('should have middlewares', function () {
            should.exist(application.middlewares)
            should.exist(application.middlewares.foo)
        })
    })

    describe('Routing', function () {
        it('should have routes registered', async function () {
            let result
            try {
                result = await client.request('tests/foo')
                should.exist(result)
                should.exist(result.success)
                should.equal(result.success, true)
            }
            catch (e) {
                should.not.exist(e)
            }
        })
    })

    describe('Error handling', function () {

        it('should handle 500 errors', async function () {
            let result
            try {
                result = await client.request('tests/throw500')
                should.not.exist(result)
            }
            catch (e) {
                should.exist(e)
                should.exist(e.statusCode)
                should.equal(e.statusCode, 500)
                should.exist(e.error)
                should.exist(e.error.message)
                should.equal(e.error.message, 'custom_handled_error')
                should.exist(e.error.stack)

            }
        })
    })
})
