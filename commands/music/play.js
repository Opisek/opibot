const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js")

//const fs = require('fs');
//const ytdl = require("ytdl-core");
const prism = require('prism-media');
const ytSearch = require("yt-search");
//const path = require('path');

const format = "mp3";
/*const trans = new prism.FFmpeg({
    args: [
      '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2'
    ]
});*/

exports.run = async function(client, message, args, guildConf) {
    const l = guildConf.language;
    const guild = message.guild;
    const voiceChan = message.member.voice.channel;
    const chan = message.channel;
    if (!voiceChan) chan.send(embeds.simpleEmbed(loc("err.err",l),loc("music.nochan",l), guildConf.colors.failure));
    else if (voiceChan.id != guildConf.musicChannel && guildConf.musicChannel != null) chan.send(embeds.simpleEmbed(loc("err.err",l),loc("music.otherchan",l), guildConf.colors.failure));
    else {
        let video = await ytSearch(args.string);
        if (video && video.videos && video.videos.length > 1) {
            let addedDate = Date.now();
            video = video.videos[0];
            if (!guildConf.queue) guildConf.queue = [];
            if (guildConf.queue.length == 0 || voiceChan.id == guildConf.musicChannel || guildConf.musicChannel == null) {
                guildConf.queue.push({
                    "title": video.title,
                    "url": video.url,
                    "thumbnail": video.thumbnail,
                    "user": message.author.id,
                    "length": video.seconds,
                    "cmds": chan.id,
                    "added": addedDate,
                    "format": format
                });
                guildConf.musicChannel = voiceChan.id;
                client.settings.set(guild.id, guildConf);
                await chan.send(embeds.simpleEmbed(loc("music.added",l),loc("music.addedVerbose",l,[message.author.id, video.title]), guildConf.colors.primary, video.thumbnail));
                /*await new Promise(fulfill => 
                    ytdl(video.url, {filter: "audioonly"})
                    //.pipe(trans)
                    //.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }))
                    .pipe(fs.createWriteStream(path.join(__dirname, `../../music/${addedDate}.${format}`)))
                    .on("finish", fulfill)
                );*/
            } else {
                chan.send(embeds.simpleEmbed(loc("err.err",l),loc("music.occupied",l), guildConf.colors.failure));
            }
        } else {
            chan.send(embeds.simpleEmbed(loc("err.err",l),loc("music.novid",l), guildConf.colors.failure));
        }
    }
}
module.exports.help = {
    perms: ["MUSIC"],
    args:[{type:"string"}]
};