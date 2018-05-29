/**
 * Blockbase test file
 * @author Blacksmith <code@blacksmith.studio>
 */
const should = require('should')
process.env['NODE_CONFIG_DIR'] = __dirname + '/config'

const blockbase = require('@blacksmithstudio/blockbase')

let driver
let application

blockbase({root: __dirname}, async app => {
    driver = app.drivers.express = require('../driver')(app)
    driver.route()
    driver.listen()
    application = app
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
        })

        it('should have middlewares', function () {
            should.exist(application.middlewares)
            should.exist(application.middlewares.foo)
        })
    })
})
