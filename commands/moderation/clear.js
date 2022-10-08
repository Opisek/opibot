const Discord = require("discord.js");
const ms = require('ms');

exports.run = (client, message, args, guildConf) => {
  message.delete();
  let adminRank = guildConf.admin;
  let chan = message.channel;
  let lastMessages = args.count;
  var delround = Math.ceil(lastMessages/100);
  var attime = Math.ceil(lastMessages/delround);
  for (var delIndex=0;delIndex<delround;delIndex++) {
    chan.messages.fetch({limit:attime}).then((messages) => {
      chan.bulkDelete(messages).then(messages => {
        if (msg) message.channel.send(`🗑 Pomyślnie usunięto ${args.count} wiadomości.`).then(message => message.delete());
        else message.delete();
      });
    });
  }
  

}
module.exports.help = {
    perms: ["MANAGE_MESSAGES"],
    args:[{type:"count"}]
}
