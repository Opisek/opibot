const { MessageEmbed } = require("discord.js"); 
const Discord = require("discord.js");
const settings = require("../../settings.json");
const defaultMessagesState = settings.messagesCounter;

module.exports.run = async (bot, message, args, guildConf) => {
  message.delete();
  let guild = message.guild;
  let chan = message.channel;
  let sicon = guild.iconURL();
  if (!guildConf.messagesCounter) {
    bot.settings.set(guild.id,defaultMessagesState,"messagesCounter");
    guildConf = bot.settings.get(guild.id);
  }
  let embed = new MessageEmbed()
  .setDescription('📈 Statystyki wiadomości od 15.08.2020r.')
  .addField('Razem',guildConf.messagesCounter.alltime,false)
  .addField('Ten rok',guildConf.messagesCounter.thisyear,true)
  .addField('Poprzedni rok',guildConf.messagesCounter.lastyear,true)
  .addField('Ten miesiąc',guildConf.messagesCounter.thismonth,true)
  .addField('Poprzedni miesiąc',guildConf.messagesCounter.lastmonth,true)
  .addField('Ten tydzień',guildConf.messagesCounter.thisweek,true)
  .addField('Poprzedni tydzień',guildConf.messagesCounter.lastweek,true)
  .addField('Dzisiaj',guildConf.messagesCounter.today,true)
  .addField('Wczoraj',guildConf.messagesCounter.yesterday,false)
  .setThumbnail(sicon)
  .setColor('#40c1ac')
  .setFooter(guild.name, sicon);
  chan.send(embed);
}

module.exports.help = {
  perms: ["DEVELOPER"],
  args:[]
}