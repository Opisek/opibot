const Discord = require('discord.js');
const { MessageEmbed } = require("discord.js"); 
const moment = require('moment');
require('moment-duration-format');
let os = require('os')
let cpuStat = require("cpu-stat")


module.exports.run = async (bot, interaction, args, data) => {
  cpuStat.usagePercent(function(err, percent, seconds) {if (err) { return console.log(err);}});
  const mUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const duration = moment.duration(bot.uptime).format(" d[d] h[h] m[m] s[s]");
  let bicon = bot.user.displayAvatarURL();
  let botembed = new EmbedBuilder()
  .setColor('#40c1ac')
  .setThumbnail(bicon)
  .addFields([
    {"name": "<:bot:743083217103618068> Nazwa", "content": bot.user.username, "inline": true},
    {"name": "<:autor:743083217091035156> Autor", "content": `Opisek, TomoS`, "inline": true},
    {"name": "<:kalendarz:743083169754120234> Utworzony", "content": moment(bot.user.createdAt).tz("Europe/Warsaw").format("DD.MM.YYYY, HH:mm"), "inline": true},
    {"name": "<:prefix:743083217082646618> Prefix", "content": `/`, "inline": true},
    {"name": "<:biblioteka:743083216868475021> Biblioteka", "content": `JavaScript`, "inline": true},
    {"name": "<:procesor:743083216868737126> Procesor", "content": `Cortex-A72 (ARMv7)`, "inline": true},
    {"name": "<:uptime:743083216810016790> Uptime", "content": moment.duration(bot.uptime).format(' D[d] H[h] m[m] s[s]'), "inline": true},
    {"name": "<:djs:743083216939909161> Discord.js", "content": `v${Discord.version}`, "inline": true},
    {"name": "<:nodejs:743083217053024377> Node", "content": `${process.version}`, "inline": true},
    {"name": "<:platforma:743083217271128105> Platforma", "content": `Raspberry Pi OS`, "inline": true},
    {"name": "<:data:743083217057349632> Baza danych", "content": `Enmap`, "inline": true},
    {"name": "<:wersja:743083216810016821> Wersja bota", "content": `Rozwojowa`, "inline": true}
  ])
  interaction.sendEmbed(botembed);
};

module.exports.help = {
  desc:"Sprawdza parametry bota",
  perms:["DEVELOPER"]
}