const Discord = require('discord.js');
const { Client, CategoryChannel, MessageEmbed } = require("discord.js");
const ms = require('ms');
const moment = require('moment-timezone');
const tools = require("../../tools.js");
const msToTime = tools.msToTime;

module.exports.run = (bot,message,args,guildConf) => {
	message.delete();
  
  const author = message.author;
  const guild = message.guild;

  const GUILDID = message.guild.id;
  const winnerCount = args.count;
  const time = args.duration;
  const prize = args.string;
  const startDate = Date.now();
  const endAt = startDate + time;
  const timeEnd = msToTime(endAt);
  let endTime = moment(timeEnd, "HH:mm").tz("Europe/Warsaw").format("HH:mm");
  console.log(time)
  
  message.channel.send('🎉 **GIVEAWAY** 🎉',buildEmbed())
  .then(async function(message){
    //console.log(message.id);
    let arr = guildConf.giveaways;
    arr.push([message.id,message.channel.id,author.id,winnerCount,endAt,prize,endTime,[]]);
    let index = arr.length-1;
    bot.settings.set(guild.id,arr,'giveaways');
    let newconf = bot.settings.get(guild.id);
    //console.log(newconf);
    editMsg(message);
    message.react("🎉");
    const collector = message.createReactionCollector((reaction, user) => user == user, { time: time});
    collector.on('collect', r => {
      if (r.emoji.name='🎉') {
        let newConf = bot.settings.get(GUILDID);
        let reactionArr = newConf.giveaways[index][7];
        let newId = message.reactions.cache.get('🎉').users.cache.last().id;
        if (!reactionArr.includes(newId)) {
         newConf.giveaways[index][7].push(newId); 
        }
        //message.channel.send(newConf.giveaways[index][7].join('; '))
        bot.settings.set(GUILDID, newConf);
      }
    });
    collector.on('end', (collection,reason) => {
      if (reason=='time') {
        let newConf = bot.settings.get(GUILDID);
        let users = newConf.giveaways[index][7];
        let exceptions = [bot.user.id];
        let winners = [];
        while (winners.length<winnerCount&&exceptions.length+winners.length!=users.length) {
          let winner = users[Math.floor(Math.random()*users.length)];
          if (!exceptions.includes(winner)) {
            winners.push("<@" + winner + ">");
            exceptions.push(winner);
          }
        }
        setTimeout(async function(){
          let embed = new MessageEmbed()
            .setColor('#ca0e08')
            .setTitle(`Giveaway`)
            .setDescription(`Zwycięzcy:\n${winners.join(', ')}`)    
            .setFooter(`Udział wzięło: ${users.length-1} | Zwycięzców: ${winnerCount} | Zakończono `)
            .setTimestamp(endAt)
          if (prize.startsWith("http"))
            embed.setImage(prize);
          else
          embed.setDescription(`Do wygrania: **${prize}**`);
          message.delete();
          await message.channel.send('<:yay2:859375710153867265> **GIVEAWAY ZAKOŃCZONY** <:yay2:859375710153867265>',embed)
          await message.channel.send(`Gratulacje ${winners.join(', ')}! Wygrałeś(aś) powyższą nagrodę!`)
          // let arr = bot.settings.get(guild.id).giveaways;
          // index = arr.indexOf([message.id,message.channel.id,author.id,winnerCount,endAt,prize,endTime,[]]);
          // arr.splice(index,1);
          // bot.settings.set(guild.id,arr,'giveaways');
        }, 100);
      } else {
        console.log('GIVEAWAY ERROR');
        message.channel.send('GIVEAWAY ERROR');
      }
    });
  })

  function editMsg(msg) {
    let time = 60000;
    if (endAt - Date.now() < 10000) time = 1000;
    else if (endAt - Date.now() < 70000) time = endAt - Date.now() - 10000;
    setTimeout(function(){
      if (endAt>Date.now()) { 
        msg.edit('🎉 **GIVEAWAY** 🎉', buildEmbed()); 
        editMsg(msg);
      }
    }, time); 
  }
  
  
  function buildEmbed() {
    let winnerword = "zwycięzców";
    if (winnerCount==1) winnerword = "zwycięzca";
    let timeleft = ms(endAt - Date.now());
    if (timeleft.endsWith('ms')) {timeleft = '1s'}
    let embed = new Discord.MessageEmbed()
    //.setAuthor('Giveaway', message.client.user.avatarURL)
    .setTitle(`Giveaway`)
    .setColor('#ca0e08')
    .setDescription(`Kliknij 🎉 aby wziąć udział! \nKoniec za: **${msToTime(endAt - Date.now(),'writtenOut')}**`)
    .setFooter(`${winnerCount} ${winnerword} | Koniec `)
    .setTimestamp(endAt);
    if (prize.startsWith("http"))
      embed.setImage(prize);
    else
    embed.setDescription(`Do wygrania: **${prize}**\n` + embed.description);
    return (embed);
  }
};

module.exports.help = {
  perms: ["MODERATOR"],
  args:[{type:"count"},{type:"duration"},{type:"string"}]
}
