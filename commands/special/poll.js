const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js");
const { emoji } = require("../../tools.js");
module.exports.run = async (client, message, args, guildConf) => {
        message.delete();
	(args.channel ? message.guild.channels.cache.get(args.channel) : message.channel).send(embeds.listEmbed(args.string[0], loc("poll.info",guildConf.language),{[loc("poll.ans",guildConf.language)]:args.string.slice(1)},"letteremoji",guildConf.colors.primary)).then(async function(m){for(let i=0;i<args.string.length-1;i++) await m.react(emoji[String.fromCharCode(97+i)]);});
};
module.exports.help = {
  perms: ["MODERATOR"],
  args:[{type:"string",multiple:true,min:3},{type:"channel",optional:true}]
}