// utils.js
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const readline = require('readline');

const downloadAudioFile = (ffmpegUrl, outputFile, quality, filename) => {
    return new Promise((resolve, reject) => {
        const outputFilename = filename ? filename : `[${quality}]${path.basename(ffmpegUrl, path.extname(ffmpegUrl))}`;
        const fullPath = path.join(outputFile, `${outputFilename}.mp3`);

        ffmpeg()
            .input(ffmpegUrl)
            .audioBitrate(320)
            .toFormat('mp3')
            .on('start', () => {
                console.log(chalk.green('📥 Audio download started...'));
            })
            .on('progress', progress => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`⬇️ Downloading: ${progress.percent}%`);
            })
            .on('end', () => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.log(chalk.bold(chalk.green('✅ Audio downloaded successfully!')));
                resolve();
            })
            .on('error', err => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.log(chalk.bold(chalk.red(`❌ Error downloading audio file: ${err.message}`)));
                reject(err);
            })
            .saveToFile(fullPath);
    });
};

module.exports = { downloadAudioFile };
