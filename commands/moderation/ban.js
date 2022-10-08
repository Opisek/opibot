const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js");

exports.run = (client, message, args, guildConf) => {
    const l = guildConf.language;
    const member = message.guild.members.cache.get(args.user);
    member.ban();
    embeds.sendSimpleEmbed(loc("moderation.ban.title",l),loc("moderation.ban.description",l,[member.username]), guildConf.colors.success, message.channel);
}
module.exports.help = {
    perms: ["BAN_MEMBERS"],
    args:[{type:"user"}]
};