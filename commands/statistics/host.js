const Discord = require("discord.js"); 
const moment = require('moment');
require('moment-duration-format');
let os = require('os')
let cpuStat = require("cpu-stat")
const embeds = require("../internal/embeds.js");
const { loc } = require("../internal/localizer.js")

module.exports.run = async (bot, message, args, data) => {
  const l = data.language;
  let fields = [];
  let cpuLol;
  cpuStat.usagePercent(function(err, percent, seconds) {
    if (err) {
        return console.log(err);
    }
    const mUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const duration = moment.duration(bot.uptime).format(" d[d] h[h] m[m] s[s]");
    message.delete();
    fields.push([loc("stats.host.cpu",l), `${percent.toFixed(2)}%`]);
    fields.push([loc("stats.host.ram",l), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`]);
    message.channel.send(
      embeds.fieldsEmbed(
        loc("stats.host.title",l),
        "",
        fields, 
        data.colors.primary, 
        ""
      )
    );
  });
}

module.exports.help = {
  perms: ["DEVELOPER"],
  args:[]
}