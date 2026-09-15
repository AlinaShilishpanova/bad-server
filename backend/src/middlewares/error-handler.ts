import { ErrorRequestHandler } from 'express'
import { constants } from 'http2'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message

    if (statusCode >= 500) {
        process.stderr.write(
            JSON.stringify({
                level: 'error',
                message: err.message,
                stack: err.stack,
                time: new Date().toISOString(),
            }) + '\n'
        )
    }

    res.status(statusCode).send({ message })

    next()
}

export default errorHandler