/**
 * @namespace app.middlewares.foo
 * @param app
 * @returns {*}
 */
module.exports = (app) => {

    return function (req, res, next) {

        next()
    }

}