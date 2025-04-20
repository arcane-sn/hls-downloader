const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { fetchAudioDetails } = require('./modules/audio/fetch-audio-details');
const { downloadAudioFile } = require('./modules/audio/download-audio-file');
const { fetchVideoDetails } = require('./modules/video/fetch-video-details');
const { downloadVideoFile } = require('./modules/video/download-video-file');

const app = express();
const PORT = 4000;

app.use(cors());

const createFolderIfNotExists = (folder) => {
    const outputFolder = path.resolve(process.cwd(), folder);
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
        console.log(chalk.green(`📂 Created folder: ${outputFolder}`));
    }
};

// ================= AUDIO =================

app.get('/audio', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'best';

    if (!videoURL) return res.status(400).send('Missing URL');

    try {
        const { reqAudio, title } = await fetchAudioDetails(videoURL, quality);
        if (reqAudio) {
            return res.json({
                title,
                audioUrl: reqAudio.url,
                formats: reqAudio,
            });
        } else {
            return res.status(404).send('Audio format not found');
        }
    } catch (err) {
        return res.status(500).send('Error fetching audio details');
    }
});

app.get('/audio-file', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'best';
    const folder = req.query.folder || 'youtube-exec';

    if (!videoURL) return res.status(400).send('Missing URL');

    try {
        const { reqAudio, title } = await fetchAudioDetails(videoURL, quality);
        if (reqAudio) {
            createFolderIfNotExists(folder);
            const filename = `[${quality.toUpperCase()}]-${title}`;
            await downloadAudioFile(reqAudio.url, folder, quality, filename);
            const filePath = path.join(folder, `${filename}.mp3`);
            res.download(filePath);
            res.on('finish', () => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted successfully');
                    }
                });
            });
        } else {
            return res.status(404).send('Audio format not found');
        }
    } catch (err) {
        return res.status(500).send('Error downloading file');
    }
});

// ================= VIDEO =================

app.get('/video', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'best';

    if (!videoURL) return res.status(400).send('Missing URL');

    try {
        const { reqVideo, title } = await fetchVideoDetails({ url: videoURL, quality });
        if (reqVideo) {
            return res.json({
                title,
                videoUrl: reqVideo.url,
                formats: reqVideo,
            });
        } else {
            return res.status(404).send('Video format not found');
        }
    } catch (err) {
        return res.status(500).send('Error fetching video details');
    }
});

app.get('/video-file', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'best';
    const folder = req.query.folder || 'youtube-exec';

    if (!videoURL) return res.status(400).send('Missing URL');

    try {
        const { reqVideo, title } = await fetchVideoDetails({ url: videoURL, quality });
        const { reqAudio } = await fetchAudioDetails(videoURL, quality);
        if (reqVideo) {
            createFolderIfNotExists(folder);
            const filename = `[${quality.toUpperCase()}]-${title}`;
            await downloadVideoFile(reqVideo.url, reqAudio.url, folder, quality, filename);
            const filePath = path.join(folder, `${filename}.mp4`);
            // Stream the file for download
            res.download(filePath);

            // Listen to the 'finish' event to delete the file after the download is complete
            res.on('finish', () => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted successfully');
                    }
                });
            });
        } else {
            return res.status(404).send('Video format not found');
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send('Error downloading video file');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
