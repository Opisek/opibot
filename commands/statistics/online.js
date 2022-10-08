const embeds = require("../internal/embeds.js");
const images = require("../internal/images.js");
const { loc, dur } = require("../internal/localizer.js")
const moment = require("moment");
const ms = require("ms");
const Discord = require("discord.js");

exports.run = (client, message, args, guildConf) => {
    const l = guildConf.language;

    if (args.user != "219073782768336896" && args.user != "305115474612584448") return message.channel.send(embeds.simpleEmbed(loc("err.outage",l),loc("err.outageVerbose",l),guildConf.colors.failure));

    const guild = message.guild;
    const stats = client.statistics.get(guild.id);
    if (!stats || !stats.userdata) return embeds.exception(message.channel, guildConf, "online.js || statistics or userdata absent");
    let durr = 86400000;
    if (args.duration != null) {
        if (args.duration > 86400000) {
            embeds.sendSimpleEmbed(loc("err.incorrectTime",l),loc("err.incorrectTime",l,["24h"]), guildConf.colors.failure, message.channel);
            return; 
        }
        durr = args.duration;
    }
    if (args.user == null) { // whole server
        let logs = [];
        guild.members.cache.forEach(member => {
            let userdata = stats.userdata[member.id];
            if (userdata && userdata.presence && userdata.presence.detailed) {
                userdata = userdata.presence.detailed.today;
                let i = 0;
                let last = null;
                if (userdata[0][1] == "offline" || userdata[0][1] == false) i = 1;
                for (; i < userdata.length; i++) {
                    let cur = userdata[i][1];
                    if (cur == "message") continue;
                    let now = cur != "offline" && cur != false;
                    if (now != last) logs.push([userdata[i][0], now]);
                    last = now;
                }
            }
        });
        //console.log(logs);
        logs = logs.sort(function (a, b) {return a[0] - b[0]});
        let embed = embeds.simpleEmbed(loc("stats.presence.title",l),"",guildConf.colors.primary);
        const currentTime = Date.now();
        embed.attachFiles(images.timeGraph(logs, currentTime - durr, currentTime, durr / 1440));
        embed.setImage("attachment://graph.png"); 
        message.channel.send(embed);
    } else { // single user
        let user = guild.members.cache.get(args.user);
        let fields = [];

        let last = loc("usr.presence.unknown",l);

        let userdata = stats.userdata[user.id];
        if (userdata) {
            if (userdata.presence) {
            if (userdata.presence.last.seen != "") {
                const currentTime = moment().valueOf();
                last = dur(guildConf.userdata[user.id].presence.last.seen - currentTime,l,"2")
            }
            fields.push([
                loc("usr.presence.last",l),
                user.user.presence.status != "offline" ? loc("usr.presence.now",l) : last,
                false
            ]);

            let timeOnline = userdata.presence.online.time;
            let timeIdle = userdata.presence.idle.time;
            let timeDnd = userdata.presence.dnd.time;
            let timeOffline = userdata.presence.offline.time;

            const currentTime = moment().valueOf();
            const lastChange = userdata.presence.last.at;
            const deltaTime = currentTime - lastChange;

            switch (userdata.presence.last.type) {
                case "online":
                timeOnline += deltaTime;
                break;
                case "idle":
                timeIdle += deltaTime;
                break;
                case "dnd":
                timeDnd += deltaTime;
                break;
                case "offline":
                timeOffline += deltaTime;
                break;
            }

            const timeTotal = timeOnline + timeIdle + timeDnd + timeOffline;

            fields.push([
                loc("usr.presence.status.online",l),
                `${loc("usr.presence.timeTotal",l)}: ${
                timeOnline == 0
                    ? loc("usr.presence.never",l)
                    : dur(timeOnline,l)
                }\n${loc("usr.presence.percentage",l)}: ${Math.round((timeOnline / timeTotal) * 1000) /
                10}%`,
                false
            ]);
            fields.push([
                loc("usr.presence.status.idle",l),
                `${loc("usr.presence.timeTotal",l)}: ${
                timeIdle == 0 ? loc("usr.presence.never",l) : dur(timeIdle,l)
                }\n${loc("usr.presence.percentage",l)}: ${Math.round((timeIdle / timeTotal) * 1000) /
                10}%`,
                false
            ]);
            fields.push([
                loc("usr.presence.status.dnd",l),
                `${loc("usr.presence.timeTotal",l)}: ${
                timeDnd == 0 ? loc("usr.presence.never",l) : dur(timeDnd,l)
                }\n${loc("usr.presence.percentage",l)}: ${Math.round((timeDnd / timeTotal) * 1000) / 10}%`,
                false
            ]);
            fields.push([
                loc("usr.presence.status.offline",l),
                `${loc("usr.presence.timeTotal",l)}: ${
                timeOffline == 0
                    ? loc("usr.presence.never",l)
                    : dur(timeOffline,l)
                }\n${loc("usr.presence.percentage",l)}: ${Math.round((timeOffline / timeTotal) * 1000) /
                10}%`,
                false
            ]);

            let embed = embeds.fieldsEmbed(
                user.user.username +
                (user.nickname
                    ? ` | ${user.nickname}`
                    : "") /* + (user.user.bot ? " [BOT]" : "")*/,
                loc("usr.presence.title",l,[`<@${user.user.id}>`]),
                fields,
                guildConf.colors.primary,
                "",
                user.user.displayAvatarURL
            );
            let data = userdata.presence.detailed.today;
            console.log(data);
            if (data) {
                if (data[0][1] == "offline" && data.length > 1) data.shift();
                embed.attachFiles(images.timeGraph(data, currentTime - durr, currentTime, durr / 1440, 1));
                embed.setImage("attachment://graph.png");
            }
            message.channel.send(embed);
            } else {
            message.channel.send(
                embeds.simpleEmbed(
                loc("usr.presence.unknown",l),
                loc("usr.presence.unknownVerbose",l,[`<@${user.user.id}>`]),
                guildConf.colors.failure
                )
            );
            }
        } else {
            message.channel.send(
            embeds.simpleEmbed(
                loc("usr.presence.unknown",l),
                loc("usr.presence.unknownVerbose",l,[`<@${user.user.id}>`]),
                guildConf.colors.failure
            )
            );
        }
    }
};
module.exports.help = {
  perms: ["MODERATOR"],
  args:[{type:"duration",optional:true},{type:"user",optional:true}]
};
