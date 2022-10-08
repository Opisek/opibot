const Discord = require("discord.js");
const { loc } = require("./localizer.js");

function simpleEmbed(title, description, color) {
  let embed = new Discord.MessageEmbed();
  if (title != "") embed.setTitle(title);
  if (description != "") embed.setDescription(description);
  embed.setColor(color == "invisible" ? "0x5429d6" : color);
  return embed;
}

module.exports = {
  msgListener: function(channel, user, time, conf) {
    let listener = new Discord.MessageCollector(channel, m => m.author.id == (user == "" ? m.author.id : user), {time: time * 1000});
    listener.on("end", (c,r) => {
      if (!(r && r === "user")) channel.send(simpleEmbed("",loc("err.timeout",conf.language), conf.colors.failure));
    });
    return listener;
  },
  reactionListener: function(msg, channel, user, time, conf, silent = false) {
    let listener = msg.createReactionCollector((reaction, u) => u.id == (user == "" ? u.id : user), { time: time * 1000});
    listener.on("end", (c,r) => {
      if (!(r && r === "user") && !silent) {
        channel.send(simpleEmbed("",loc("err.timeout",conf.language), conf.colors.failure));
        if (msg != null) {
          msg.reactions.removeAll();
        }
      }
    });
    return listener;
  }
};