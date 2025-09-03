import ytdl from "@distube/ytdl-core";
import z from 'zod'
import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import convertToMp3 from "../utils/convert-to-mp3.js";


export default async function downloadRoutes(app: FastifyInstance) {

    const pathDownload = 'assets/download';

    app.post(
        '/',
        async (req, res) => {

            const downloaBodySchema = z.object({
                url: z.url(),
                format: z.enum(['mp3', 'mp4']).default('mp4'), //todo
                title: z.string().default("")
            })

            let { url, title } = downloaBodySchema.parse(req.body)

            if(!ytdl.validateURL(url)) {
                return res.code(401).send('Erro! Url enviada é inválida')
            }

            try {

                if(!title) {
                    const info = await ytdl.getInfo(url)
                    title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_')
                }

                const tmpFile = path.join(pathDownload, `${title}.webm`)
                const outputFile = path.join(pathDownload, `${title}.mp3`)

                if( !fs.existsSync(pathDownload) ) fs.mkdirSync(pathDownload)

                const audioStream = ytdl(url, { filter: 'audioandvideo',  quality: 'highestaudio' })
                audioStream.pipe(fs.createWriteStream(tmpFile))

                audioStream
                    .on('end',() => {
                        convertToMp3({ outputFile, tmpFile })
                            .on('end', () => {
                                res
                                    .headers(
                                        {
                                            'content-type': 'application/octet-stream',
                                            'content-disposition': `attachment; filename="${title}.mp3"`
                                        }
                                    )
                                    .code(200)
                                    .send(fs.createReadStream(outputFile))

                                fs.unlinkSync(tmpFile);   // Remove o arquivo temporário
                            })
                            .on('error', () => res.code(500).send('Erro na conversão') )
                            .on('progress', ({ percent }) => {
                                /** @todo tratativa de retorno ao front com percentual de conversão */
                            })
                    })
            }
            catch(e) {
                res.code(500).send('Erro na conversão')
            }
        }
    )

}