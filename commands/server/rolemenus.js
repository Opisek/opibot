const embeds = require("../internal/embeds.js");
const listeners = require("../internal/listeners.js");
const parser = require("../internal/parser.js");
const { loc } = require("../internal/localizer.js");

exports.run = (client, message, args, guildConf) => {
  let channel = message.channel;
  let guild = channel.guild;
  let user = message.author;
  
  let workSettings = {name:"",roles:{},xor:false,channel:"",msg:""};
  let index;
  let notAdded;
  let newChannel;
  
  main();
  
  function main() {
    if (!guildConf.rolegivers) {
        guildConf.rolegivers = [];
        client.settings.set(guild.id, guildConf);
    }
    channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.instructions", guildConf.language), guildConf.colors.primary))
      .then(async function(msg) {
      let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
      emojiListener.on('collect', r => {
        if (r.emoji.name=='➕') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          workSettings = {name:"",roles:{},xor:false,channel:"",msg:""};
          index = guildConf.rolegivers.length;
          notAdded = true;
          name(true);
        }
        if (r.emoji.name=='✏️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          allmenus();
        }
        if (r.emoji.name=='✅') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          embeds.sendSimpleEmbed("",loc("res.saved", guildConf.language), guildConf.colors.success, channel);
        }
      });
      await msg.react('➕'); 
      await msg.react('✏️'); 
      await msg.react('✅'); 
    });
  }
  
  function allmenus() {
    if (guildConf.rolegivers.length == 0) {
      channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.empty", guildConf.language), guildConf.colors.primary))
      .then(async function(msg) {
        let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
        emojiListener.on('collect', r => {
          if (r.emoji.name=='✅') {
            if (guildConf.autodelete) msg.delete();
            emojiListener.stop();
            main();
          }
        });
        await msg.react('✅');
      });
    } else {
      let list = {Menus:[]};
      for (let i = 0; i < guildConf.rolegivers.length; i++) list.Menus.push(guildConf.rolegivers[i].name);
      channel.send(embeds.listEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.changepick", guildConf.language), list, "num", guildConf.colors.primary))
        .then(async function(msg) {
        let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
        let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
        emojiListener.on('collect', r => {
          if (r.emoji.name=='✅') {
            if (guildConf.autodelete) msg.delete();
            emojiListener.stop();
            listener.stop();
            main();
          }
        });
        listener.on("collect", async function(m) {
          if (guildConf.autodelete) m.delete();
          let option = await pickOption(m, list.length, channel, user, guild, channel, guildConf, client);
          if (option != null) {
            if (guildConf.autodelete) msg.delete();
            listener.stop();
            emojiListener.stop();
            index = option - 1;
            workSettings = guildConf.rolegivers[option - 1];
            newChannel = false;
            notAdded = false;
            view();
          }
        });
        await msg.react('✅');
      });
    }
  }
  
  function view() {
    let list = {[workSettings.name]:[]};
    let orderedEmojis = [];
    Object.keys(workSettings.roles).forEach(function(emojiname){
      let work = workSettings.roles[emojiname];
      let emojidone = work.emojiid == null ? emojiname : `<:${emojiname}:${work.emojiid}>`;
      list[workSettings.name].push(` ${emojidone} ${guild.roles.cache.get(work.role)}`);
      orderedEmojis.push(emojidone);
    });
    //guild.channels.cache.get(workSettings.channel)
    //workSettings.xor ? "Only one role can be picked." : "Multiple roles can be picked."
    channel.send(embeds.listEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.changeinstructions", guildConf.language,[guild.channels.cache.get(workSettings.channel), workSettings.xor ? loc("rolegiver.setonepick", guildConf.language) : loc("rolegiver.setmultpick", guildConf.language)]), list, "num", guildConf.colors.primary))
      .then(async function(msg) {
      let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      emojiListener.on('collect', r => {
        if (r.emoji.name=='✅') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          if (newChannel || workSettings.msg == null || workSettings.msg == "") {
            if (!(workSettings.msg == null || workSettings.msg == "")) {
              guild.channels.cache.get(guildConf.rolegivers[index].channel).messages.fetch(workSettings.msg)
              .then(m => {
                m.delete();
              });
            }
            guild.channels.cache.get(workSettings.channel).send(makeEmbed())
            .then(async function (m) {
              workSettings.msg = m.id;
              if (guildConf.rolegivers.length < index) guildConf.rolegivers.push(workSettings)
              else guildConf.rolegivers[index] = workSettings;
              client.settings.set(guild.id, guildConf);
              embeds.sendSimpleEmbed("",loc("res.saved", guildConf.language), guildConf.colors.success, channel);
              for (let i = 0; i < orderedEmojis.length; i++) {
                await m.react(orderedEmojis[i]);
              }
            });
          } else {
            let cachechan = guild.channels.cache.get(workSettings.channel);
            cachechan.messages.fetch(workSettings.msg)
            .then(async function (m) {
              await m.edit(makeEmbed())
              if (guildConf.rolegivers.length < index) guildConf.rolegivers.push(workSettings)
              else guildConf.rolegivers[index] = workSettings;
              client.settings.set(guild.id, guildConf);
              embeds.sendSimpleEmbed("",loc("res.saved", guildConf.language), guildConf.colors.success, channel);
              for (let i = 0; i < orderedEmojis.length; i++) {
                await m.react(orderedEmojis[i]);
              }
            })
            .catch(function (e) {
              cachechan.send(makeEmbed())
              .then(async function (m) {
                workSettings.msg = m.id;
                if (guildConf.rolegivers.length < index) guildConf.rolegivers.push(workSettings)
                else guildConf.rolegivers[index] = workSettings;
                client.settings.set(guild.id, guildConf);
                embeds.sendSimpleEmbed("",loc("res.saved", guildConf.language), guildConf.colors.success, channel);
                for (let i = 0; i < orderedEmojis.length; i++) {
                  await m.react(orderedEmojis[i]);
                }
              });
              
            });
          }
        }
        if (r.emoji.name=='✏️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          name(false);
        }
        if (r.emoji.name=='➕') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          role(false, "");
        }
        if (r.emoji.name=='🔒') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          exclusivity(false);
        }
        if (r.emoji.name=='📄') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          chan(false);
        }
        if (r.emoji.name=='🗑️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          listener.stop();
          (async function(){
            let consent = await embeds.confirmationEmbed(loc("rolegiver.deletetitle", guildConf.language), loc("rolegiver.deletemenu", guildConf.language, [workSettings.name]), guildConf.colors.warning, channel, message.author.id, guildConf);
            if (consent != null)  {
              if (consent) {
                if (!notAdded) {
                  try {guild.channels.cache.get(guildConf.rolegivers[index].channel).messages.fetch(guildConf.rolegivers[index].msg)
                    .then(m => {
                        m.delete();
                    });
                  } catch(e) {}
                  guildConf.rolegivers.splice(index, 1);
                  client.settings.set(guild.id, guildConf);
                }
                main();
              } else {
                view();
              }
            }
          })();
        }
      });
      listener.on("collect", async function(m) {
        if (guildConf.autodelete) {
          msg.delete();
          m.delete();
        }
        let option = await pickOption(m, list.length, channel, user, guild, channel, guildConf, client);
        if (option != null) {
            listener.stop();
            emojiListener.stop();
            let consent = await embeds.confirmationEmbed(loc("rolegiver.deletetitle", guildConf.language), loc("rolegiver.deleterole", guildConf.language, [guild.roles.cache.get(workSettings.roles[orderedEmojis[option - 1]].role)]), guildConf.colors.warning, channel, message.author.id, guildConf);
            if (consent != null) {
            if (consent) {
                delete workSettings.roles[orderedEmojis[option]];
                view();
            } else {
                view();
            }
            }
        }
      });
      try {await msg.react('✅');}catch(e){}
      try {await msg.react('✏️');}catch(e){}
      try {await msg.react('➕');}catch(e){}
      try {await msg.react('🔒');}catch(e){}
      try {await msg.react('📄');}catch(e){}
      try {await msg.react('🗑️');}catch(e){}
    });
  }

  function name(isNew) {
    channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.getname", guildConf.language), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      listener.on("collect", m => {
        if (guildConf.autodelete) {
            msg.delete();
            m.delete();
        }
        listener.stop();
        workSettings.name = m.content;
        if (isNew) {
          role(true, "");
        } else {
          view();
        }
      });
    });
  }
  
  function role(isNew, editing) {
    channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.getrole", guildConf.language), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      let doneListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
      let active = true;
      let disabled = false;
      listener.on("collect", async function (m) {
        if (!disabled) {
          doneListener.stop();
          disabled = true;
        }
        if (!active) return;
        if (guildConf.autodelete) m.delete();
        active = false;
        let id = await parser.parseArguments(client, guild, guildConf, channel, user.id, [m.content], [{type:"role"}], false);
        if (id == null || !id.role) {
          embeds.sendSimpleEmbed(loc("err.err",guildConf.language),`${loc("err.wrongFormat",guildConf.language)}\n${loc("err.tryAgain",guildConf.language)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
          active = true;
        } else if (id.role == "undefined") {
          listener.stop();
          role(isNew, editing);
        } else {
          if (guildConf.autodelete) msg.delete();
          listener.stop();
          channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.getemoji", guildConf.language, [guild.roles.cache.get(id.role)]), guildConf.colors.primary))
            .then(async function(msgg) {
            let emojiListener = listeners.reactionListener(msgg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
            emojiListener.on('collect', r => {
              if (workSettings.roles[r.emoji.name] == null || editing == r.emoji.name) {
                if (guildConf.autodelete) msgg.delete();
                emojiListener.stop();
                if (isNew || editing == "") {
                  workSettings.roles[r.emoji.name] = {role:id.role,emojiid:r.emoji.id == null ? null : r.emoji.id.toString()};
                  if (!isNew) view();
                }
                if (isNew) {
                  role(isNew, "");
                }
              } else {
                embeds.sendSimpleEmbed("",`${loc("rolegiver.emojiinuse", guildConf.language)} ${loc("err.tryAgain", guildConf.language)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
              }
            });
          });
        }
      });
      doneListener.on('collect', r => {
        if (r.emoji.name=='✅') {
          if (guildConf.autodelete) msg.delete();
          listener.stop();
          doneListener.stop();
          if (isNew) exclusivity(true);
          else view();
        }
      });
      await msg.react('✅'); 
    });
  }
  
  async function exclusivity(isNew) {
    let xor = await embeds.confirmationEmbed(loc("rolegiver.title", guildConf.language), loc("rolegiver.getxor", guildConf.language), guildConf.colors.primary, channel, message.author.id, guildConf);
    if (xor != null) {
      workSettings.xor = !xor;
      if (isNew) {
        chan(isNew);
      } else {
        view();
      }
    }
  }
  
  function chan(isNew) {
     channel.send(embeds.simpleEmbed(loc("rolegiver.title", guildConf.language),loc("rolegiver.getchannel", guildConf.language), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      let active = true;
      listener.on("collect", async function (m) {
        if (!active) return;
        if (guildConf.autodelete) m.delete();
        active = false;
        let id = await parser.parseArguments(client, guild, guildConf, channel, user.id, [m.content], [{type:"channel"}], false);
        if (id == null || !id.channel) {
          embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.wrongFormat",l)}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
          active = true;
        } else {
          if (id.channel != "undefined") {
            if (guildConf.autodelete) msg.delete();
            listener.stop();
            if (id.channel != workSettings.channel) newChannel = true;
            workSettings.channel = id.channel;
            view();
          } else {
            if (guildConf.autodelete) msg.delete();
            listener.stop();
            chan(isNew);
          }
        }
      });
    });
  }
  
  function makeEmbed() {
    let elist = "";
    Object.keys(workSettings.roles).forEach(function(emojiname){
      let work = workSettings.roles[emojiname];
      elist = elist + "\n" +  (work.emojiid == null ? emojiname : `<:${emojiname}:${work.emojiid}>`) + " " + guild.roles.cache.get(workSettings.roles[emojiname].role).name;
    });
    elist.substring(2);
    return embeds.simpleEmbed(workSettings.name, elist, guildConf.colors.primary);
  }
}

async function pickOption(msg, max, channel, user, guild, channel, guildConf, client) {
    const l = guildConf.language;
    let args = await parser.parseArguments(client, guild, guildConf, channel, user.id, [msg.content], [{type:"count"}], false);
    if (args == null) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.nan",l,[msg])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
    else if (args.count > max || args.count < 0) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.notInRange",l,[args.count])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, message.channel, guildConf.autodelete, guildConf.timeouts.autodelete);
    else return args.count;
    return null;
  }

module.exports.help = {
    perms: ["MANAGE_ROLES"],
    args:[]
};