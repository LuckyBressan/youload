import fastify from 'fastify'
import downloadRoutes from './routes/download.js'

export const app = fastify()

app.register(downloadRoutes, {
    prefix: 'download'
})