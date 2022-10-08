const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const bot = new Discord.Client({fetchAllMembers: true});
const moment = require('moment');

module.exports.run = async (bot, message, args, channel, guild, member) => {
    message.delete();
    let TextChannels = message.guild.channels.cache.filter(c => c.type !== 'text').size;
    let VoiceChannels = message.guild.channels.cache.filter(e => e.type === 'voice').size;
    let totalOnline = message.guild.members.cache.filter(m => m.user.presence.status !== "online").size;
    let totalAway = message.guild.members.cache.filter(m => m.user.presence.status !== "idle").size;
    let totalDoNotDisturb = message.guild.members.cache.filter(m => m.user.presence.status !== "dnd").size;
    let totalOffline = message.guild.members.cache.filter(m => m.user.presence.status !== "offline").size;
    let sicon = message.guild.iconURL();
    let bans = message.guild.fetchBans().then(bans => {
    let serverembed = new MessageEmbed()
    .setTimestamp(new Date())
    .setDescription("**Informacje o serwerze**")
    .setFooter("© Copyright by Opisek", message.guild.iconURL())
    .setColor("#40c1ac")
    .addField("<:owner:859372811885215764> Właściciel", message.guild.owner, true)
    .addField("<:nazwa:859372811608260639> Nazwa serwera", message.guild.name, true)
    .addField("<:region:859372811729371147> Region", message.guild.region, true)
    .addField("<:safety:859372811809718302> Poziom weryfikacji", message.guild.verificationLevel, true)
    .addField("<:kalendarz:859372792952520704> Utworzony", moment(message.guild.createdAt).tz("Europe/Warsaw").format("DD.MM.YYYY, HH:mm"), true)
    .addField("<:kalendarz:859372792952520704> Dołączyłeś(aś)", moment(message.member.joinedAt).tz("Europe/Warsaw").format("DD.MM.YYYY, HH:mm"), true)
    .addField("<:home:859372812073697280> Kanał główny", `<#737808052870185022>`, true)
    .addField("<:role:859372811675762688> Role", message.guild.roles.cache.size, true)
    .addField("<:bany:859372811373641729> Bany", bans.size, true)
    .addField("<:kanaly:859372811742347284> Kanały", `Tekstowe: ${message.guild.channels.cache.filter(chan => chan.type === 'text').size} \nGłosowe: ${message.guild.channels.cache.filter(chan => chan.type === 'voice').size}\n`, true)
    .addField("<:stats:859372811800674324> Statystyki", `Ludzi: ${message.guild.members.cache.filter(member => !member.user.bot).size}\nBotów: ${message.guild.members.cache.filter(member => member.user.bot).size}\nRazem: ${message.guild.memberCount}`, true)
    .addField("<:global:859372811876171836> Status członków", `Dostępny: ${message.guild.members.cache.filter(m => m.user.presence.status == "online").size}\nZaraz wracam: ${message.guild.members.cache.filter(m => m.user.presence.status === 'idle').size}\nNie przeszkadzać: ${message.guild.members.cache.filter(m => m.user.presence.status === 'dnd').size}\nNiewidoczny: ${message.guild.members.cache.filter(m => m.user.presence.status == "offline").size}`, true)
    .addField("<:boost:859374935448354846> Poziom serwera", `${message.guild.premiumTier}`, true)
    .addField("<:boost:859374935448354846> Ulepszeń serwera", `${message.guild.premiumSubscriptionCount || '0'}`, true)

    message.channel.send(serverembed);
  
    }).catch(console.error);
    };

module.exports.help = {
  perms: [],
  args:[],
  clients:["Senu", "OpiBot", "Piwniczka", "Edkowe Królestwo"]
}
