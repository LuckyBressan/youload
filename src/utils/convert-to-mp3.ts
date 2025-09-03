import Ffmpeg from "fluent-ffmpeg";

interface ConvertToMp3Options {
    tmpFile: string;
    outputFile: string;
}

export default function convertToMp3({ tmpFile, outputFile } : ConvertToMp3Options) {
    return Ffmpeg(tmpFile)
            .audioCodec('libmp3lame')
            .audioBitrate(192)
            .save(outputFile)
}