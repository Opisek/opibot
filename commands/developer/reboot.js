const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js");
const moment = require('moment');

exports.run = async (client, interaction, args, guildConf) => {
  let globalData = client.settings.get("0");
  globalData.rebooted = {
    "rebootedGuild": interaction.guild.id,
    "rebootedChannel": interaction.firstMessage.channel.id,
  }
  globalData.lastActivity = moment().valueOf();
  client.settings.set("0", globalData);
  
  await interaction.sendEmbed(embeds.simpleEmbed("",loc("bot.rebootStart", guildConf.language, [interaction.firstMessage.member.user.username]), guildConf.colors.primary));

  process.exit(1);
}
module.exports.help = {
    perms: ["DEVELOPER"],
    args:[]
};