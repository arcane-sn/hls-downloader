
const youtubedl = require('youtube-dl-exec');
const chalk = require('chalk');

const fetchAudioDetails = async (url, quality) => {
    try {
        const result = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        });
        const formats = result.formats;
        let reqAudio = null;

        if (quality === 'best') {
            let highestBitrate = 0;
            formats.forEach(format => {
                if (format.acodec === 'none' || format.vcodec !== 'none') return;
                const bitrate = format.tbr || format.abr;
                if (bitrate && bitrate > highestBitrate) {
                    highestBitrate = bitrate;
                    reqAudio = format;
                }
            });
        } else if (quality === 'lowest') {
            let lowBitrate = Infinity;
            formats.forEach(format => {
                if (format.acodec === 'none' || format.vcodec !== 'none') return;
                const bitrate = format.tbr || format.abr;
                if (bitrate && bitrate < lowBitrate) {
                    lowBitrate = bitrate;
                    reqAudio = format;
                }
            });
        }

        return { reqAudio, title: result.title };
    } catch (err) {
        console.error(chalk.red(`❌ Error fetching audio details: ${err.message}`));
        throw err;
    }
};

module.exports = { fetchAudioDetails };