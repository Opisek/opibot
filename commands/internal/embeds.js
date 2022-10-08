const Discord = require("discord.js");
const listeners = require("./listeners.js");
const { emoji } = require("../../tools.js");
const { loc } = require("./localizer.js")

module.exports = {
  disable: function(interaction) {
    let rows = JSON.parse(JSON.stringify(interaction.message.components, null, 2)); // dumb solution
    for (row of rows) for (component of row.components) component.disabled = true;
    interaction.update({"components": rows});
  },
  simpleEmbed: function(title, description, color, thumbnail = null) {
    let embed = new Discord.EmbedBuilder();
    if (title != "") embed.setTitle(title);
    if (description != "") embed.setDescription(description);
    if (thumbnail != null) embed.setThumbnail(thumbnail);
    embed.setColor(color == "invisible" ? "0x5429d6" : color);
    return embed.toJSON();
  },
  sendSimpleEmbed: function(title, description, color, channel, remove = false, removetime = 5) {
    let embed = new Discord.EmbedBuilder();
    if (title != "") embed.setTitle(title);
    if (description != "") embed.setDescription(description);
    embed.setColor(color == "invisible" ? "0x5429d6" : color);
    channel.send(embed)
    .then(async function(msg) {if (remove) setTimeout(function(){ msg.delete(); }, removetime * 1000);});
  },
  listEmbed: function(title, description, elements, enumerationType, color) {
    let embed = new Discord.EmbedBuilder();
    if (title != "") embed.setTitle(title);
    if (description != "") embed.setDescription(description);
    let totalEnumeration = 0;
    Object.keys(elements).forEach(function(category){
      let en = typeof enumerationType == "string" ? enumerationType : enumerationType[category];

      let list = "";
      for (let i = 0; i < elements[category].length; i++)
      {
        if (en == "num") list += `\n\`\`${++totalEnumeration}\`\` `;
        else if (en == "point") list += `\n• `;
        else if (en == "letter") list += `\n\`\`${String.fromCharCode(totalEnumeration++ + 97)}\`\` `;
        else if (en == "letteremoji") list += `\n${emoji[String.fromCharCode(totalEnumeration++ + 97)]} `;
        list += elements[category][i];
      }
      embed.addFields({name: category, value: list});
    });
    embed.setColor(color == "invisible" ? "0x5429d6" : color);
    return embed.toJSON();
  },
  fieldsEmbed: function(title, description, elements, color, author, thumb) {
    let embed = new Discord.EmbedBuilder();
    if (title != "") embed.setTitle(title);
    if (description != "") embed.setDescription(description);
    if (thumb && thumb != "") embed.setThumbnail(thumb);
    if (author && author != "") embed.setAuthor(`${author.username}`, author.displayAvatarURL)
    for (let i = 0; i < elements.length; i++)
    {
      embed.addFields({name: elements[i][0], value: elements[i][1], inline: elements[i][2]});
    }
    embed.setColor(color == "invisible" ? "0x5429d6" : color);
    return embed.toJSON();
  },
  confirmationEmbed: async function(title, description, color, channel, author, conf) {
    let picked = null;
    channel.send(this.simpleEmbed(title, description, color))
      .then(async function(msg) {
      let emojiListener = listeners.reactionListener(msg, channel, author, conf.timeouts.reactionCollector, conf);
      emojiListener.on('collect', r => {
        if (r.emoji.name=='✅') {
          picked = true;
          emojiListener.stop();
          if (conf.autodelete) msg.delete();
        }
        if (r.emoji.name=='❌') {
          picked = false;
          emojiListener.stop();
          if (conf.autodelete) msg.delete();
        }
      });
      emojiListener.on('end', (c,r) => {
        if (!(r && r === "user")) picked = "none";
      });
      await msg.react('✅'); 
      await msg.react('❌');
    });
    return await new Promise(function (resolve, reject) {
        (function waitForChoice(){
          if (picked != null) return resolve(picked == "none" ? null : picked);
          setTimeout(waitForChoice, 50);
        })();
    });
  },
  exception: function(channel, guildConf, code) {
    let embed = new Discord.EmbedBuilder();
    embed.setTitle(loc("err.exception",guildConf.language));
    embed.setDescription(code);
    embed.setColor(guildConf.colors.failure);
    channel.send(embed);
  }
};