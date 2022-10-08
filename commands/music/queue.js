const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js")

exports.run = (client, message, args, guildConf) => {
    const l = guildConf.language;
    const guild = message.guild;
    if (!guildConf.queue) {
        guildConf.queue = [];
        client.settings.set(guild.id, guildConf);
    }
    let entries = [];
    for (let i = 0; i < guildConf.queue.length; i++) entries.push(guildConf.queue[i].title);
    if (entries.length == 0) {
        message.channel.send(embeds.simpleEmbed(
            loc("music.queue", l),
            loc("music.queueEmpty", l),
            guildConf.colors.primary
        ));
    } else {
        message.channel.send(embeds.listEmbed(
            loc("music.queue", l),
            loc("music.queueVerbose", l),
            {[loc("music.songs", l)]:entries},
            "num",
            guildConf.colors.primary
        ));
    }
}
module.exports.help = {
    perms: ["MUSIC"],
    args:[]
};