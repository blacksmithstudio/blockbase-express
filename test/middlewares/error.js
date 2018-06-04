module.exports = (app) => {
    return async function (err, req, res, next) {
        res.status(500).json({message: 'custom_handled_error', stack: err.stack})
    }
}