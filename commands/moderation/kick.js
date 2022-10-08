const Discord = require("discord.js");
const { Client, CategoryChannel, MessageEmbed } = require("discord.js");


module.exports.run = async (bot, message, args, guildConf) => {
    message.delete(1000);
    
    let kUser = message.guild.members.cache.get(args.user);
    let kReason = args.string == null ? "Brak Powodu" : args.string;

    let kickEmbed = new MessageEmbed()
                .setAuthor('👈 KICK')
                .setColor('#e56b00')
                .setDescription(`
                **Wyrzucony użytkownik:**  ${kUser.user.username}\u200e#${kUser.user.discriminator}
                **Wyrzucony przez:**  ${message.author.username}
                **Powód:**  ${kReason}`, false)
                .setTimestamp(new Date());

    message.channel.send(`Użytkownik ${kUser.user.username}\u200e#${kUser.user.discriminator} został wyrzucony z serwera za **${kReason}**.`)
  
    let kickChannel = message.guild.channels.cache.find(c =>c.name === "logi");
    if(!kickChannel) return message.channel.send("Can't find incidents channel.");

     let kickEmbed2 = new MessageEmbed()
    .setDescription(`👈 Zostałeś(aś) wyrzucony(a) z serwera **${message.guild.name}** przez **${message.author.username}** za **${kReason}**`)
    .setColor("#e56b00")  
       
    kickChannel.send(kickEmbed); 
    kUser.send(kickEmbed2).then(() => message.guild.member(kUser).kick(kReason)).catch((e) => message.guild.member(kUser).kick(kReason));
}

module.exports.help = {
  perms:["KICK_MEMBERS"],
  args:[{type:"user"},{type:"reason",optional:true}]
}
