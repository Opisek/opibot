const embeds = require("../internal/embeds.js");
const interactions = require("../internal/interactions.js");

module.exports.run = async (bot, message, args, guildConf) => {
  interactions.sendEmbedToChannel((args.channel ? message.guild.channels.cache.get(args.channel) : message.channel), embeds.simpleEmbed("", args.string, guildConf.colors.primary));
};

module.exports.help = {
  perms: ["ADMINISTRATOR"],
  args: [{type:"string"}, {type:"channel", optional:true}]
}