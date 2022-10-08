const embeds = require("./embeds.js");
const { loc } = require("./localizer.js");
const importance = {
    "joined":0,
    "left":0,
    "muted":1,
    "unmuted":1,
    "banned":1,
    "unbanned":1,
    "kicked":1,
    "messageEdited":0,
    "messageDeleted":0
}
const channels = ["lowimportancelogs","logs","admin"];
module.exports = {
  log: function(guild, conf, action, user, channel = null, content = null, content2 = null) {
    let imp = importance[action];
    let chan = null;
    while (imp >= 0 && chan == null) chan = guild.channels.cache.get(conf.channels[channels[imp--]]);
    if (chan == null) return;
    const l = conf.language;
    let description = "";
    let thumbnail = null;
    console.log(action);
    if (action == "muted" || action == "unmuted" || action == "banned" || action == "unbanned" || action == "kicked") {
      if (content) description = `Reason: ${content}`;
    }
    else if (action == "messageEdited") {
      description = `${loc("logs.term.from",l)}: ``${content}``\n${loc("logs.term.to",l)}: ``${content2}``\n${loc("logs.term.in",l)}: <#${channel}>`;
    }
    else if (action == "messageDeleted") {
      description = `${loc("logs.term.msg",l)}: ``${content}``\n${loc("logs.term.in",l)}: <#${channel}>`;
    }
    else if (action == "joined" || action == "left") {
      let thumbnail = user.avatarURL;
    }
    chan.send(embeds.simpleEmbed(loc(`logs.action.${action}`,l,[user.username]), description, conf.colors.primary, thumbnail));
  }
};