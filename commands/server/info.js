const { Client, CategoryChannel, MessageEmbed } = require("discord.js");

module.exports.run = async (bot, interaction, args) => {
  message.delete();
  var number = "21";
  var embed = new EmbedBuilder()
  .setTitle("OGŁOSZENIE")
  .setDescription("Przypominamy o trwającym [konkursie fotograficznym](https://discord.com/channels/737801218683830312/738799641193349130/769625540146626580).")
  .setFooter("© Bractwo Asasynów", '')
  .setImage("https://i.imgur.com/E817t4T.png")
  .setColor('#36393f');
  interaction.sendEmbed(embed);
};

module.exports.help = {
  perms:["ADMINISTRATOR"],
  args:[],
  clients:["Senu"]
}