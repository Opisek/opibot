const embeds = require("../internal/embeds.js");
const { loc, dur } = require("../internal/localizer.js")
const moment = require('moment');

exports.run = (client, message, args, guildConf) => {
  const l = guildConf.language;
  const guild = message.guild;

  const stats = client.statistics.get(guild.id);
  let user = guild.members.cache.get(args.user);
  if ((!stats || !stats.userdata) && (user.id == "219073782768336896" || user.id == "305115474612584448")) return embeds.exception(message.channel, guildConf, "user.js || statistics or userdata absent");

  let roles = user.roles.cache.sort((b, a) => { return a.position - b.position}).array()
  let fields = [];

  //
  // STATUS
  //

  let status = user.user.presence.status;
  switch (status) {
    case "online": status = "🟢"; break;
    case "idle": status = "🟡"; break;
    case "dnd": status = "🔴"; break;
    case "offline": status = "✖️"; break;
  }
  if (user.user.bot) status += ' 🤖';

  //
  // LAST SEEN
  //

  const currentTime = moment().valueOf();
  let last = loc("err.outage",l);
  if (user.id == "219073782768336896" || user.id == "305115474612584448") {
    last = "unknown";
    if (stats.userdata[user.id])
    {
      if (stats.userdata[user.id].presence)
      {
        if (stats.userdata[user.id].presence.last.seen != "")
        {
          last = dur(stats.userdata[user.id].presence.last.seen - currentTime,l,"2");
        }
      }
    }
  }

  //
  // INFO FIELDS
  //

  fields.push([loc("usr.info.tag",l), user.user.tag, true]);
  fields.push([loc("usr.info.id",l), user.user.id, true]);
  fields.push([loc("usr.activity.status",l), status, true]);
  fields.push([loc("usr.info.accSince",l), moment(user.user.createdAt).format('DD.MM.YYYY HH:mm'), true]);
  fields.push([loc("usr.info.memberSince",l), moment(user.joinedAt).format('DD.MM.YYYY HH:mm'), true]);
  fields.push([loc("usr.presence.last",l), user.user.presence.status != "offline" ? loc("usr.presence.now",l) : last, true]);
  fields.push([loc("usr.info.roles",l), roles.length > 1 ? '**' + roles.slice(0,roles.length-1).join(/*" ▸ "*/" • ") + '**' : loc("gen.none",l), false]);

  //
  // ACTIVITIES
  //

  let activities = user.user.presence.activities;
  if (activities.length > 0) {
    for (let i = 0; i < activities.length; i++) {
      let details = [];
      if (activities[i].details != null) details.push(activities[i].details);
      if (activities[i].emoji != null || activities[i].state != null) {
        let emoji = activities[i].emoji;
        let state = activities[i].state;
        if (emoji != null) {
          if (emoji.id != null) {
            if (emoji.animated) {
              emoji = `<a:${emoji.name}:${emoji.id}>`;
            } else {
              emoji = `<${emoji.name}:${emoji.id}>`;
            }
          } else {
            emoji = emoji.name;
          }
        } else {
          emoji = ""
        }
        if (state != null) {
          if (emoji != "") emoji += " " + state;
          else emoji = state;
        }
        details.push(emoji);
      }
      if (activities[i].timestamps) {
        if (activities[i].timestamps.start) details.push(dur(currentTime - activities[i].timestamps.start,l,"3")); // localize time
        if (activities[i].timestamps.end) details.push(loc("usr.activity.end",l) + " " + dur(activities[i].timestamps.end - currentTime,l,"1")); // localize time
      }
      detailstext = "";
      if (details.length == 1) { 
        detailstext = details[0];
      } else {
        detailstext += "• " + details[0];
        for (let j = 1; j < details.length; j++) {
          detailstext += "\n• " + details[j];
        }
      }
      fields.push([activities[i].name == "Custom Status" ? loc("usr.activity.custom",l) : activities[i].name, detailstext, true]);
    }
  }

  //
  // SEND
  //

  message.channel.send(
    embeds.fieldsEmbed(user.user.username + (user.nickname ? ` | ${user.nickname}` : ""),
      loc("usr.info.title",l,[`<@${user.user.id}>`]), 
      fields, 
      guildConf.colors.primary, 
      "", 
      user.user.avatarURL()
    )
  );
}
module.exports.help = {
    perms: ["MODERATOR"],
    args:[{type:"user"}]
};