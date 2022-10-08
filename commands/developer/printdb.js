const embeds = require("../internal/embeds.js");

exports.run = async (client, interaction, args, guildConf) => {
  if (args.dbkey == null) {
    let keys = "";
    Object.getOwnPropertyNames(guildConf).forEach(k => {
        if (keys != "") keys += " ";
        keys += `\`\`${k}\`\``;
    })
    await interaction.sendEmbed(embeds.simpleEmbed(`Database: All Keys`,keys, guildConf.colors.primary));
  }
  else {
    let parts = args.dbkey.split(".");
    let directory = guildConf;
    for (let i = 0; i < parts.length; i++) {
      if (directory.hasOwnProperty(parts[i])) {
        directory = directory[parts[i]];
      } else {
        await interaction.sendEmbed(embeds.simpleEmbed(`Error`,`Property \`\`${args.dbkey}\`\` doesn't exist in the database.`, guildConf.colors.failure));
        return;
      }
    }
    await interaction.sendEmbed(embeds.simpleEmbed(`Database: ${args.dbkey}`,`\`\`\`${JSON.stringify(directory, null, 2)}\`\`\``, guildConf.colors.primary));
  }

}
module.exports.help = {
    perms: ["DEVELOPER"],
    args:[{type:"dbkey",optional:true}]
};