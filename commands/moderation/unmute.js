const embeds = require("../internal/embeds.js");
const queries = require("../internal/queries.js");
const moment = require('moment');
const Discord = require("discord.js");

exports.run = (client, message, args, guildConf) => {
  const guild = message.guild;
  const member = guild.members.cache.get(args.user);
  if (!guildConf.mutes[args.user]) {
      embeds.sendSimpleEmbed("Użytkownik odmutowany",`Użytkownik \`\`${member.user.username}\`\` nie jest wyciszony.`, guildConf.colors.warning, message.channel);
  } else {
      delete guildConf.mutes[args.user];
      client.settings.set(guild.id, guildConf);
      const muterole = guildConf.roles.muted;
      if (muterole) member.roles.remove(muterole);
      embeds.sendSimpleEmbed("Użytkownik odmutowany",`Użytkownik \`\`${member.user.username}\`\` został odmutowany.`, guildConf.colors.success, message.channel);
  }  
}
module.exports.help = {
    perms: ["MUTE_MEMBERS"],
    args:[{type:"user"}]
};