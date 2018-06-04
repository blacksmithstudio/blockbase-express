/**
 * @namespace app.controllers.foo
 * @param app
 * @returns {*}
 */
module.exports = (app) => {

    return {
        async bar(req, res) {
            res.json({success: true})
        },

        async throw500(req, res) {
            throw new Error('test 500')
        }
    }

}