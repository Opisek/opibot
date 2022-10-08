const Discord = require("discord.js");

module.exports.run = async (bot, interaction, args, guildConf) => {  
  const defaultSettings = require("../../settings.json");
  bot.settings.set(interaction.guild.id, defaultSettings[args.dbkey],args.dbkey);
  interaction.sendEmbed(embeds.simpleEmbed("Success",`Property \`\`${args.dbkey}\`\` has been reset.`, guildConf.colors.success));
}

module.exports.help = {
  perms: ["DEVELOPER"],
  args:[{type:"dbkey"}]
}