//
//
//
//
//  SENUBOT
//
//
//
//

//
//
//  CONSTANTS
//
//

const CLIENTS = {
  "455320380962373652": {
    name:"OpiBot",
    token:"NDU1MzIwMzgwOTYyMzczNjUy.Wx0AJg.omIbXYimSnDITfkazWnPzIkwjT8",
    owner:"305115474612584448",
    language:"en",
    statuses: ["youtube.com/Opisek","twitch.tv/Opisek","twitter.com/OpisekOpi"],
    radio: null
  },
  "768044442686717962": {
    name:"Piwniczka",
    token:"NzY4MDQ0NDQyNjg2NzE3OTYy.X46vIA.x0A-ysH8UMNRhzkeiaxggmL_M6U",
    owner:"151436376712151041",
    language:"pl",
    statuses: ["twitch.tv/tomo92s","TS: piwniczka.ddns.net"],
    radio: null
  },
  "885846093995331664": {
    name:"Edkowe Królestwo",
    token:"ODg1ODQ2MDkzOTk1MzMxNjY0.YTs-dw.ktkPFpV6gIemT3Q22MGzJfDUHzA",
    owner:"151436376712151041",
    language:"pl",
    statuses: ["twitch.tv/eddy_gra","malistreamerzy.pl"],
    radio: null
  },

};

const Discord = require('discord.js');
const ms = require('ms'); 
const fs = require('fs');
const moment = require('moment-timezone');
const Enmap = require('enmap');
const path = require('path');

const tools = require("./tools.js");
const msToTime = tools.msToTime;

const ytdl = require("ytdl-core");
const prism = require('prism-media');

const embeds = require("./commands/internal/embeds.js");
const interactions = require("./commands/internal/interactions.js");
const perms = require("./commands/internal/permissions.js");
const parser = require("./commands/internal/parser.js");
const queries = require("./commands/internal/queries.js");
const { loc, dur } = require("./commands/internal/localizer.js");
const { log } = require("./commands/internal/logs.js");

//
//
//  LANGUAGES
//
//

let changes = false;
transData = JSON.parse(fs.readFileSync("./translations.json"));
let languages = Object.keys(transData);
languages.splice(languages.indexOf("en"), 1);
iterateEntries(transData.en, "");
function iterateEntries(dir, path) {
  for (const [key, value] of Object.entries(dir)) {
    let final = (typeof value == "string" || Array.isArray(value));
    let newPath = path == "" ? key : `${path}.${key}`;
    for (let i = 0; i < languages.length; i++) {
      if (getEntry(languages[i], newPath) == null) {
        setEntry(languages[i], newPath, final ? null : {});
        changes = true;
        console.error(`MISSING TRANSLATION: ${languages[i]}.${newPath}`);
      }
    }
    if (!final) iterateEntries(dir[key], newPath);
  }
}
function getEntry(lang, path) {
  let dir = transData[lang];
  let steps = path.split(".");
  for (let i = 0; i < steps.length; i++) dir = dir[steps[i]];
  return dir;
}
function setEntry(lang, path, entry) {
  let dir = transData[lang];
  let steps = path.split(".");
  for (let i = 0; i < steps.length - 1; i++) dir = dir[steps[i]];
  dir[steps[steps.length - 1]] = entry;
}
if (changes) {
  fs.writeFileSync("./translations.json", JSON.stringify(transData, null, 2), function (err) {
    if (err) return console.log(err);
  });
}

//
//
//  FUNCTIONS
//
//

//
//  LOG
//

function clog(args, error = false) {
  args[0] = args[0].user ? args[0].user.username : args[0];
  if (error) console.error(args.join("   |   "));
  else console.log(args.join("   |   "));
}

//
//  RANDOM
//

function randomNumber(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


//
//
//
//
//  CLIENT
//
//
//
//

//const bannedCategories = ["internal", "functionality", "disabled"];
const bannedCategories = ["internal", "functionality", "disabled", "moderation", "music", "special", "statistics"]; // temp

let interactionResolver = new interactions.InteractionResolver();

for (const [CLIENTID, CLIENTDATA] of Object.entries(CLIENTS)) {

  //
  //
  //  COMMANDS
  //
  //

  const client = new Discord.Client({intents: new Discord.IntentsBitField(32767)});

  client.commands = {};
  let categories = fs.readdirSync(path.join(__dirname, './commands/'));
  categories.filter(f => f.split(".").length == 1 && !bannedCategories.includes(f)).sort().forEach((c, i) => {
    fs.readdirSync(path.join(__dirname, `./commands/${c}/`)).filter(f => f.split(".").pop() == "js").forEach((f, i) => {
      let props = require(`./commands/${c}/${f}`);
      if (!props.help.clients || props.help.clients.includes(CLIENTDATA.name)) {
        props.help.cat = c;
        clog([CLIENTDATA.name, "commands", `${c}/${f} loaded successfully`]);
        let cmdname = f.split(".")[0];
        client.commands[cmdname] = props;
      }
    });
  });

  
  
  let defaultSettings = require("./settings.json");
  const globalSettings = require("./globalsettings.json");

  //moment.locale(""); // to investigate
  client.settings = new Enmap({name:"settings"});
  client.statistics = new Enmap({name:"statistics"});
  client.setMaxListeners(1000);

  //
  //
  //  READY
  //
  //

  client.on('ready', async () => {

    //
    //  INIT
    //

    // SETTINGS

    clog([client, "startup", "starting up"]);
    clog([client, "startup", "awaiting settings"]);
    await client.settings.defer;
    clog([client, "startup", "done"]);

    clog([client, "startup", "global settings"]);
    if (!client.settings.has("0")) {
      clog([client, "startup", "initial settings"]);
      client.settings.set("0", globalSettings);
    }
    let conf = client.settings.get("0");
    let changed = false;
    Object.keys(globalSettings).forEach(k => {
      if (!conf.hasOwnProperty(k)) {
        clog([client, "startup", "new default setting"]);
        conf[k] = globalSettings[k];
        change = true;
      }
    });
    if (changed) client.settings.set("0", conf);
    clog([client, "startup", "done"]);

    // CHESTS

    if (client.user.id == "436828817668177920") {
      clog([client, "startup", "initiating chests"]);
      dropChest(client);
      clog([client, "startup", "done"]);
    }

    // ACTIVITY

    clog([client, "startup", "initiating client activity"]);
    let statusIndex = 0;
    setInterval(function () {
      client.user.setActivity(CLIENTS[client.user.id].statuses[statusIndex++],{type:"WATCHING"});
      if(statusIndex === CLIENTS[client.user.id].statuses.length) statusIndex = 0;
    }, 20000);
    clog([client, "startup", "done"]);

    client.guilds.cache.forEach(guild => {
      
      // GUILD SETTINGS

      clog([client, "startup", guild.name, "guild settings"]);
      if(!client.settings.has(guild.id)) {
        clog([client, "startup", guild.name, "initial settings"]);
        client.settings.set(guild.id, defaultSettings);
        let guildConf = client.settings.get(guild.id);
        guildConf.language = CLIENTDATA.language;
        client.settings.set(guild.id, guildConf);
      }
      let guildConf = client.settings.get(guild.id) || defaultSettings;
      let changed = false;
      Object.keys(defaultSettings).forEach(k => {
        if (!guildConf.hasOwnProperty(k)) {
          clog([client, "startup", guild.name, "new default settings"])
          guildConf[k] = defaultSettings[k];
          changed = true;
        }
      });
      clog([client, "startup", guild.name, "done"]);

      client.settings.set(guild.id, guildConf);
    });

    // REBOOT MESSAGE

    let globalData = client.settings.get("0");

    let timeDiff = moment().valueOf() - globalData.lastActivity;
    if (timeDiff >= 60000 * 7.5) {
      client.users.fetch(CLIENTDATA.owner).then(function(u) {
        interactions.sendEmbedToChannel(u, embeds.simpleEmbed(
          loc("bot.startup", CLIENTDATA.language),
          loc("bot.offlineFor", CLIENTDATA.language, [client.user.username, dur(timeDiff, CLIENTDATA.language, 3)]), // localize time
          defaultSettings.colors.success
        ))
      });
    }

    globalData.lastActivity = moment().valueOf();
    globalData.upSince = moment().valueOf();

    if (globalData.rebooted != "") {
      let rebootchannel = client.channels.cache.get(globalData.rebooted.rebootedChannel);
      if (rebootchannel != null) interactions.sendEmbedToChannel(rebootchannel, embeds.simpleEmbed("",loc("bot.rebootComplete", CLIENTDATA.language),client.settings.get(globalData.rebooted.rebootedGuild).colors.success));
      globalData.rebooted = "";
    }
    
    client.settings.set("0", globalData);

    clog([client, "startup", "done"]);
  });

  client.on('error', console.error);
  
  client.on("guildCreate", guild => {
    let guildConf = /*client.settings ? client.settings.get(guild.id) || defaultSettings : */defaultSettings;
    const l = guildConf.language;
    interactions.sendEmbedToChannel(guild.owner, embeds.simpleEmbed(loc("server.welcome",l), loc("server.added",l,[guild.name, guild.owner.user.username, client.user.id]), defaultSettings.colors.success));
    let stats = {};
    //guild.members.cache.forEach(member => {updateUserPresenceLogs(member, stats);});
    client.settings.set(guild.id, guildConf);
    client.statistics.set(guild.id, stats);
  });
  client.on("guildDelete", guild => {
      client.settings.delete(guild.id);
  });

  //
  //
  //  MESSAGE SENT
  //
  //

  client.on("messageCreate", async message => {
    if (message.author.bot || message.channel.type == 'dm') return;
    //userActivity(client, message.guild.members.cache.get(message.author.id));

    const guild = message.guild;
    const channel = message.channel;
    let guildConf = client.settings.get(guild.id) || {defaultSettings};
    const l = guildConf.language;
    const ad = guildConf.autodelete;
    const adt = guildConf.timeouts.autodelete;

    let stats = client.statistics.get(guild.id) || {};
    if (!stats.userdata) stats.userdata = {};
    if (stats.userdata[message.author.id]) {
      if (stats.userdata[message.author.id].presence) {
        stats.userdata[message.author.id].presence.last.at = moment().valueOf();
        client.statistics.set(guild.id, stats);
      }
    }

    if (guildConf.mutes) {
      if (guildConf.mutes[message.author.id] && !perms.checkPerms(guildConf, message, "admin", false)) {
        message.delete();
        const mutedRaw = guildConf.roles.muted;
        const member = guild.member(message.author);
        if (mutedRaw != undefined && mutedRaw != "everyone" && member) {
          let mutedRole = guild.roles.cache.get(mutedRaw);
          if (mutedRole) {
            if (member.roles.cache.get(mutedRaw)) {
              updateMutedRole(client, guild, mutedRole);
            } else {
              member.roles.add(mutedRole);
            }
          }
          else {
            mutedRole = createMutedRole(client, guild);
            if (mutedRole) member.roles.add(mutedRole);
          }
        }
        else {
          const mutedRole = createMutedRole(client, guild);
          if (mutedRole) member.roles.add(mutedRole);
        }
        return;
      }
    }
    
    const tagid = `<@${client.user.id}>`;
    const alttagid = `<@!${client.user.id}>`;

    const isCalled = message.content.startsWith(guildConf.prefix) || message.content.startsWith(tagid) || message.content.startsWith(alttagid);

    if (message.content == tagid || message.content == alttagid) {
      const interaction = new interactions.Interaction(interactionResolver);
      await interaction.start(message, "Prefix");
      await interaction.sendEmbed(embeds.simpleEmbed("", loc("bot.prefix", guildConf.language, [guildConf.prefix]), guildConf.colors.primary));
      interaction.stop();
      return;
    }

    if (!isCalled) {
    } else {
      let slice = guildConf.prefix.length;
      if (message.content.startsWith(tagid)) slice = tagid.length;
      if (message.content.startsWith(alttagid)) slice = alttagid.length;

      const content = message.content.slice(slice).trim();
      const args = content.split(" ");
      const command = args.shift().toLowerCase();

      try {
        // Thread
        const interaction = new interactions.Interaction(interactionResolver);
        await interaction.start(message, command);

        // Parameters
        let commandfile = client.commands[command];
        let cmdchannel = guild.channels.cache.get(guildConf.channels.commands);
        if (commandfile.help.cat == "music") cmdchannel = guild.channels.cache.get(guildConf.channels.music);
        let isMod = perms.checkPerms(guildConf, interaction, ["MODERATOR"], false);

        // Command channel set
        if (!cmdchannel && !isMod) {
          interaction.sendEmbed(embeds.simpleEmbed(loc("err.err",l), loc("server.cmdChannel",l), guildConf.colors.failure))
          return;
        }

        // Command channel used
        if (!isMod && cmdchannel.id != message.channel.id) {
          interaction.sendEmbed(embeds.simpleEmbed(loc("err.err",l), loc("err.wrongChannel",l,[cmdchannel.id]), guildConf.colors.failure))
          return;
        }

        // Command exists and allowed
        if (!commandfile || !perms.checkPerms(guildConf, interaction, commandfile.help.perms)) {
          return;
        }

        // Arguments specified
        let newargs = await parser.parseArguments(client, guild, guildConf, message.channel, message.author.id, args, commandfile.help.args);
        if (newargs == null) {
          interaction.sendEmbed(embeds.simpleEmbed(loc("cmds.help.help",l),loc("cmds.help.usage",l, [guildConf.prefix, command]), guildConf.colors.failure))
          return;
        }

        // Command executed
        let cmdPromise = commandfile.run(client, interaction, newargs, guildConf);

        // Command result
        if (cmdPromise != undefined) {
          cmdPromise.then(() => {
            if (commandfile.help.cat == "music") {
              //newMusicTick(client, guild);
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        //console.log(`${message.author.username} ran the command ${command}`);
      }
    }
  });

  client.on("interactionCreate", async interaction => {
    let args = interaction.customId.split(';');
    let id = args.shift();
    if ("values" in interaction) args = args.concat(interaction.values).map(x => parseInt(x));
    if (interaction.type == 5) { // response
      interaction.deferUpdate();
      for (value of interaction.fields.fields) args.push(value[1].value);
      let success = interactionResolver.resolve(id, args, interaction.user);
    } else {
      let query = interactionResolver.query(id, args[0], args[1]);
      if (query) {
        interaction.showModal(queries.modal(query, `${id};${args[0]};${args[1]}`));
      } else {
        let success = interactionResolver.resolve(id, args, interaction.user);
        if (success) interaction.deferUpdate();
        else embeds.disable(interaction);
      }
    }
  })

  //
  //
  //  LOGIN
  //
  //

  client.login(CLIENTDATA.token);
}