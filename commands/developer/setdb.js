const embeds = require("../internal/embeds.js");
const moment = require('moment');

exports.run = async (client, interaction, args, guildConf) => {
  guildConf[args.dbkey] = args.json
  client.settings.set(interaction.guild.id, guildConf);
  interaction.sendEmbed(embeds.simpleEmbed("Success",`Property \`\`${args.dbkey}\`\` has been set.`, guildConf.colors.success));
}
module.exports.help = {
    perms: ["DEVELOPER"],
    args:[{type:"dbkey"},{type:"json"}]
};