const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const chalk = require("chalk");
const readline = require("readline");

const downloadVideoFile = (ffmpegUrl, audioUrl, outputFolder, quality, filename) => {
    return new Promise((resolve, reject) => {
        const outputFilename = filename
            ? filename
            : `[${quality}]${path.basename(ffmpegUrl, path.extname(ffmpegUrl))}`;
        const fullPath = path.join(outputFolder, `${outputFilename}.mp4`);

        ffmpeg()
            .input(ffmpegUrl)
            .input(audioUrl)
            .outputOptions('-c:v', 'copy', '-c:a', 'aac')
            .on("start", () => {
                console.log(chalk.green("📥 Video download started..."));
            })
            .on("progress", (progress) => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`⬇️ Downloading: ${progress.percent}%`);
            })
            .on("end", () => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.log(chalk.bold(chalk.green("✅ Video downloaded successfully!")));
                resolve();
            })
            .on("error", (err) => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.error(chalk.red(`❌ Error downloading video: ${err.message}`));
                reject(err);
            })
            .saveToFile(fullPath);
    });
};

module.exports = { downloadVideoFile };
