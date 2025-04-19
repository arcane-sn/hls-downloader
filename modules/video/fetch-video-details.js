const chalk = require('chalk');
const youtubedl = require('youtube-dl-exec');

const fetchVideoDetails = async ({ url, quality }) => {
    try {
        const result = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        });

        const formats = result.formats;
        let reqVideo = null;

        if (quality === 'best') {
            let highestRes = 0;
            formats.forEach(format => {
                if (format.vcodec === 'none') return; // skip if not video
                const resolution = format.height || 0;
                if (resolution > highestRes) {
                    highestRes = resolution;
                    reqVideo = format;
                }
            });
        } else if (quality === 'lowest') {
            let lowestRes = Infinity;
            formats.forEach(format => {
                if (format.vcodec === 'none') return;
                const resolution = format.height || 0;
                if (resolution && resolution < lowestRes) {
                    lowestRes = resolution;
                    reqVideo = format;
                }
            });
        }

        return { reqVideo, title: result.title };
    } catch (err) {
        console.error(chalk.red(`❌ Error fetching video details: ${err.message}`));
        throw err;
    }
};

module.exports = { fetchVideoDetails };
