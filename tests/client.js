const rp = require('request-promise')

/**
 *
 * @param app
 * @returns {*}
 */
module.exports = (app) => {
    const baseUrl = 'http://localhost:' + (app.config.express.port || 4000) + '/'
    return {
        async request(url, params = {}, method = 'get', json = true) {
            let options = {
                uri: baseUrl + url,
                method,
                json
            }
            switch (method) {
                case 'get':
                    options.qs = params
                    break
                case 'put':
                case 'post':
                    options.body = params
                    break

                default:
                    throw Error(`unhandled methdod "${method}"`)
            }
            return await rp(options)
        }
    }

}