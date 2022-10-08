const embeds = require("../internal/embeds.js");
const queries = require("../internal/queries.js");
const moment = require('moment');
const Discord = require("discord.js");

exports.run = (client, message, args, guildConf) => {
  const guild = message.guild;
  const member = guild.members.cache.get(args.user);
  if (!guildConf.mutes) guildConf.mutes = {};
  if (guildConf.mutes[args.user]) {
      embeds.sendSimpleEmbed("Użytkownik wyciszony",`Użytkownik \`\`${member.user.username}\`\` jest już wyciszony.`, guildConf.colors.warning, message.channel);
  } else {
      guildConf.mutes[args.user] = true;
      client.settings.set(guild.id, guildConf);
      embeds.sendSimpleEmbed("Użytkownik wyciszony",`Użytkownik \`\`${member.user.username}\`\` został wyciszony.`, guildConf.colors.success, message.channel);
  } 
}
module.exports.help = {
    perms: ["MUTE_MEMBERS"],
    args:[{type:"user"}]
};