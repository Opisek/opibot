const embeds = require("../internal/embeds.js");
const moment = require('moment');

exports.run = async (client, interaction, args, guildConf) => {
  if (guildConf.hasOwnProperty(args.dbkey)) {
      delete guildConf[args.dbkey];
      client.settings.set(interaction.guild.id, guildConf);
      interaction.sendEmbed(embeds.simpleEmbed("Success",`Property \`\`${args.dbkey}\`\` has been removed.`, guildConf.colors.success));
  }
  else {
      await interaction.sendEmbed(embeds.simpleEmbed(`Error`,`Property \`\`${args.dbkey}\`\` doesn't exist in the database.`, guildConf.colors.failure));
  }
}
module.exports.help = {
    perms: ["DEVELOPER"],
    args:[{type:"dbkey"}]
};