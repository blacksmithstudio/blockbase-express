/**
 * @namespace app.middlewares.foo
 * @param app
 * @returns {*}
 */
module.exports = (app) => {
    return async function (req, res, next) {
        next()
    }

}