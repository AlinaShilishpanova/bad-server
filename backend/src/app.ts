import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import { csrfProtection } from './middlewares/csrf'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000, ORIGIN_ALLOW = 'http://localhost' } = process.env
const app = express()

app.set('trust proxy', 1)

app.use(helmet())
app.use(cookieParser())

app.use(
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        limit: 50,
        standardHeaders: true,
        legacyHeaders: false,
    })
)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

// CSRF protection на все небезопасные методы (GET-эндпоинты пропускаются автоматически)
app.use(csrfProtection)

app.use(routes)
app.use(errors())
app.use(errorHandler)

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()