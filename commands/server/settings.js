const embeds = require("../internal/embeds.js");
const listeners = require("../internal/listeners.js");
const parser = require("../internal/parser.js");
const { loc } = require("../internal/localizer.js");

const settings = {
  "general": {
    "prefix": "symbol",
    "language": "language",
    "greeting": "string",
    "greetings": "*string"
  },
  "roles": {
    "roles-mod": "role",
    "roles-music": "role",
    "roles-entry": "role"
  },
  "channels": {
    "channels-admin": "channel",
    "channels-logs": "channel",
    "channels-lowimportancelogs": "channel",
    "channels-commands": "channel",
    "channels-music": "channel",
    "channels-welcome": "channel"
  },
  "colors": {
    "colors-primary": "color",
    "colors-success": "color",
    "colors-warning": "color",
    "colors-failure": "color"
  }
}

exports.run = (client, interaction, args, guildConf) => { 
  main(client, interaction);
}

async function main(client, interaction) {
  let res = false;
  while (!res) res = await pageList(client, interaction, "");
  let conf = client.settings.get(interaction.guild.id);
  interaction.sendEmbed(embeds.simpleEmbed("",loc("res.saved", conf.language), conf.colors.success));
}

async function pageList(client, interaction, path) {
  let done = null;
  const conf = client.settings.get(interaction.guild.id);
  const l = conf.language;
  let dir = settings;
  if (path != "") {
    const steps = path.split(".");
    for (let i = 0; i < steps.length; i++) dir = dir[steps[i]];
  }
  const keys = Object.keys(dir);
  let entries = [];
  let selectionEntries = [];
  for (let i = 0; i < keys.length; i++) {
    let value;
    if (typeof dir[keys[i]] == "string") {
      value = loc(`settings.settings.${keys[i]}`, l);
      entries.push(`**${value}**: ${getValue(conf, keys[i], dir[keys[i]], l)}`);
    }
    else {
      value = loc(`settings.cat.${keys[i]}`, l);
      entries.push(`**${value}**`);
    }
    selectionEntries.push({"label": value});
  }
  let picked = await interaction.sendEmbed(
    embeds.listEmbed(
      loc("settings.term.set", l),
      `${loc("settings.chooseOpt", l)}\n${loc("gen.finish", l)}`,
      {[loc("settings.term.opt", l)]:entries},
      "point",
      conf.colors.primary
    ), 
    [
      [{"type": "select", "content": selectionEntries}],
      [{"type": "button", "content": {"label": loc(`gen.finishButton`, l), "emoji": {"name": "✅", "id": null}, "style": 3}}]
    ]
  )
  let res = false;
  if (picked[0] == 1) done = true;
  else {
    picked = keys[picked[2]];
    path = `${path == "" ? "" : `${path}.`}${picked}`;
    if (typeof dir[picked] == "string") while (!res) res = await pageChange(client, interaction, path);
    else while (!res) res = await pageList(client, interaction, path);
    done = false;
  }
  return await new Promise(function (resolve, reject) {
    (function waitForChoice(){
      if (done != null) return resolve(done);
      setTimeout(waitForChoice, 50);
    })();
  });
}

async function pageChange(client, interaction, path) {
  let done = null;
  let conf = client.settings.get(interaction.guild.id);
  const l = conf.language;
  let steps = path.split(".");
  const set = steps[steps.length - 1];
  let type = settings;
  for (let i = 0; i < steps.length; i++) type = type[steps[i]];
  if (type.startsWith("*")) {
    await pageArray(client, interaction, path);
    done = true;
  } else {
    const name = loc(`settings.settings.${set}`, l);
    const initital = getValue(conf, set, type, l, true);
    let response = await interaction.sendEmbed(
      embeds.simpleEmbed(
        loc("settings.term.change", l),
        loc("settings.chooseNew", l, [name, `\`\`${parser.getData(type, l).examples.join("`` ``")}\`\``]),
        conf.colors.primary
      ),
      [
        [
          {"type": "button", "content": {"label": loc(`gen.inputButton`, l), "style": 1}, "query": [{"label": name, "type": type, "placeholder": getValue(conf, set, type, l)}]},
          {"type": "button", "content": {"label": loc(`gen.cancelButton`, l), "style": 4}}
        ]
      ]
    )
    if (response[1] == 1) done = true;
    else console.log(response);
    /*.then(async function(msg) {
      let rl = listeners.reactionListener(msg, channel, user.id, conf.timeouts.reactionCollector, conf, true);
      let ml = listeners.msgListener(channel, user.id, conf.timeouts.messageCollector, conf);
      rl.on('collect', r => {
        if (r.emoji.name=='❌') {
          rl.stop();
          ml.stop();
          if (ad) msg.delete();
          done = true;  
        }
      });
      let parsingM = false;
      ml.on("collect", async function (m) {
        if (parsingM) return;
        parsingM = true;
        if (ad) m.delete();
        let value = await parser.parseArguments(client, guild, conf, channel, user.id, [m.content], [{type:type}], false);
        if (value == null) {
          embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.wrongFormat",l)}\n${loc("err.tryAgain",l)}`, conf.colors.failure, channel, conf.autodelete, conf.timeouts.autodelete);
        } else {
          value = value[Object.keys(value)[0]];
          rl.stop();
          ml.stop();
          if (ad) msg.delete();
          if (await embeds.confirmationEmbed(loc("settings.term.confirm",l), loc("settings.chooseConsent",l,[name, initital, formatValue(value, type, l, true)]), conf.colors.warning, channel, user.id, conf))
          {
            conf = client.settings.get(guild.id);
            let dir = conf;
            let steps = set.split("-");
            for (let i = 0; i < steps.length-1; i++) dir = dir[steps[i]];
            dir[steps[steps.length-1]] = value;
            client.settings.set(guild.id, conf);
            done = true;
          } 
          else {
            done = false;
          }
        }
        parsingM = false;
      });
      await msg.react('❌'); 
    });*/
  }
  return await new Promise(function (resolve, reject) {
    (function waitForChoice(){
      if (done != null) return resolve(done);
      setTimeout(waitForChoice, 50);
    })();
  });
}

async function pageArray(client, guild, channel, user, path) {
  let done = null;
  let conf = client.settings.get(guild.id);
  const l = conf.language;
  const ad = conf.autodelete;
  let steps = path.split(".");
  const set = steps[steps.length - 1];
  let type = settings;
  for (let i = 0; i < steps.length; i++) type = type[steps[i]];
  type = type.substring(1);

  let stepsConf = set.split("-");

  let options = [loc("settings.term.arr.new",l),loc("settings.term.arr.remove",l)];

  function getArrayEmbed() {
    let dir = conf;
    for (let i = 0; i < stepsConf.length; i++) dir = dir[stepsConf[i]];
    let formatted = [];
    if (dir.length == 0) formatted.push(loc("settings.term.arr.empty", l));
    else for (let i = 0; i < dir.length; i++) formatted.push(formatValue(dir[i], type, l));

    let term1 = loc("settings.term.arr.entries", l);
    let term2 = loc("settings.term.opt", l);
    return embeds.listEmbed(
      loc("settings.term.change", l),
      `${loc("settings.chooseOpt", l)}\n${loc("gen.finish", l)}`,
      {[term1]:formatted,[term2]:options},
      {[term1]:"point",[term2]:"num"},
      conf.colors.primary
    );
  }

  let busy = false;
  channel.send(getArrayEmbed()).then(async function(msg) {
    let rl = listeners.reactionListener(msg, channel, user.id, conf.timeouts.reactionCollector, conf, true);
    let ml = listeners.msgListener(channel, user.id, conf.timeouts.messageCollector, conf);
    rl.on('collect', r => {
      if (r.emoji.name=='✅') {
        rl.stop();
        ml.stop();
        if (ad) msg.delete();
        done = true;
      }
    });
    ml.on("collect", async function (m) {
      if (!busy) {
        if (m == "1") {
          busy = true;
          await pageArrayAdd(client, guild, channel, user, path);
          busy = false;
        }
        else if (m == "2") {
          busy = true;
          await pageArrayRemove(client, guild, channel, user, path);
          busy = false;
        }
      }
    });
    await msg.react('✅'); 
  });

  return await new Promise(function (resolve, reject) {
    (function waitForChoice(){
      if (done != null) return resolve(done);
      setTimeout(waitForChoice, 50);
    })();
  });
}

async function pageArrayAdd(client, guild, channel, user, path) {

}

async function pageArrayRemove(client, guild, channel, user, path) {

}

async function pickOption(msg, max, channel, user, guild, channel, guildConf, client) {
  const l = guildConf.language;
  let args = await parser.parseArguments(client, guild, guildConf, channel, user.id, [msg.content], [{type:"count"}], false);
  if (args == null) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.nan",l,[msg])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
  else if (args.count > max || args.count < 0) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.notInRange",l,[args.count])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, message.channel, guildConf.autodelete, guildConf.timeouts.autodelete);
  else return args.count;
  return null;
}

function getValue(conf, path, type, l, field = false) {
  let dir = conf;
  let steps = path.split("-");
  for (let i = 0; i < steps.length; i++) dir = dir[steps[i]];
  return formatValue(dir, type, l, field);
}

function formatValue(val, type, l, field = false) {
  if (type.startsWith("*")) return `${val.length == 0 ? loc("gen.lists.entry.none",l) : val.length == 1 ? `1 ${loc("gen.lists.entry.singular",l)}` : `${val.length} ${loc("gen.lists.entry.plural",l)}`} ${loc("gen.lists.entry.type",l)} '${loc(`cmds.args.${type.substring(1)}.name`,l)}'`;
  if (type == "role") return val != "" && val != null ? `<@&${val}>` : formatValue(loc("gen.none",l), "string", l, field);
  if (type == "channel") return val != "" && val != null ? `<#${val}>` : formatValue(loc("gen.none",l), "string", l, field);
  return field ? `\`\`${val}\`\`` : val;
}

module.exports.help = {
    perms: ["ADMINISTRATOR"],
    args:[]
};