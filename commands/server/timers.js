const embeds = require("../internal/embeds.js");
const listeners = require("../internal/listeners.js");
const parser = require("../internal/parser.js");
const { loc, dur } = require("../internal/localizer.js");

const { newTimer } = require("../../bot.js");

exports.run = (client, message, args, guildConf) => {
  let channel = message.channel;
  let guild = channel.guild;
  let user = message.author;

  const l = guildConf.language;
  
  let workSettings = {title:"",desc:"",freq:"",next:"",chan:""};
  let index;
  
  main();
  
  function main() {
    if (!guildConf.timers) {
        guildConf.timers = [];
        client.settings.set(guild.id, guildConf);
    }
    channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.instructions",l), guildConf.colors.primary))
      .then(async function(msg) {
      let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
      emojiListener.on('collect', r => {
        if (r.emoji.name=='➕') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          workSettings = {title:"",desc:"",freq:"",next:"",chan:""};
          index = guildConf.timers.length;
          title(true);
        }
        if (r.emoji.name=='✏️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          allmenus();
        }
        if (r.emoji.name=='✅') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          embeds.sendSimpleEmbed("",loc("res.saved",l), guildConf.colors.success, channel);
        }
      });
      await msg.react('➕'); 
      await msg.react('✏️'); 
      await msg.react('✅'); 
    });
  }
  
  function allmenus() {
    if (guildConf.timers.length == 0) {
      channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.empty",l), guildConf.colors.primary))
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
      for (let i = 0; i < guildConf.timers.length; i++) list.Menus.push(`"${guildConf.timers[i].title}" ${dur(guildConf.timers[i].next - Date.now(),l,1)} ${dur(guildConf.timers[i].freq,l,4)}`);
      channel.send(embeds.listEmbed(loc("timers.title",l),loc("timers.change.pick",l), list, "num", guildConf.colors.primary))
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
            workSettings = guildConf.timers[option - 1];
            view();
          }
        });
        await msg.react('✅');
      });
    }
  }
  
  function view() {
    //guild.channels.cache.get(workSettings.channel)
    //workSettings.xor ? "Only one role can be picked." : "Multiple roles can be picked."
    while (workSettings.next && workSettings.next < Date.now()) workSettings.next = workSettings.next += workSettings.freq;
    channel.send(embeds.fieldsEmbed(
      loc("timers.title",l),
      loc("timers.change.instructions",l), 
      [
        [
          loc("timers.props.title",l),
          workSettings.title ? workSettings.title : loc("gen.none",l)
        ],
        [
          loc("timers.props.desc",l),
          workSettings.desc ? workSettings.desc : loc("gen.none",l)
        ],
        [
          loc("timers.props.freq",l),
          workSettings.freq ? dur(workSettings.freq,l,4) : loc("gen.none",l)
        ],
        [
          loc("timers.props.next",l),
          workSettings.next ? dur(workSettings.next - Date.now(),l,1) : loc("gen.none",l)
        ],
        [
          loc("timers.props.chan",l),
          workSettings.chan ? `<#${workSettings.chan}>` : loc("gen.none",l)
        ],
      ], 
      guildConf.colors.primary
      ))
      .then(async function(msg) {
      let emojiListener = listeners.reactionListener(msg, channel, message.author.id, guildConf.timeouts.reactionCollector, guildConf);
      emojiListener.on('collect', r => {
        if (r.emoji.name=='✅') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          while (workSettings.next && workSettings.next < Date.now()) workSettings.next = workSettings.next += workSettings.freq;
          let toInvoke = index;
          if (guildConf.timers.length < index) {
            guildConf.timers.push(workSettings)
            toInvoke = guildConf.timers.length;
          }
          else guildConf.timers[index] = workSettings;
          client.settings.set(guild.id, guildConf);
          newTimer(client, guild, toInvoke);
          embeds.sendSimpleEmbed("",loc("res.saved",l), guildConf.colors.success, channel);
        }
        else if (r.emoji.name=='✏️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          title(false);
        }
        else if (r.emoji.name=='📝') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          desc(false);
        }
        else if (r.emoji.name=='⏱️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          freq(false, "");
        }
        else if (r.emoji.name=='⏭️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          next(false);
        }
        else if (r.emoji.name=='📄') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          chan(false);
        }
        else if (r.emoji.name=='🗑️') {
          if (guildConf.autodelete) msg.delete();
          emojiListener.stop();
          (async function(){
            let consent = await embeds.confirmationEmbed(loc("timers.delete.title",l), loc("timers.delete.desc",l, [workSettings.title]), guildConf.colors.warning, channel, message.author.id, guildConf);
            if (consent != null)  {
              if (consent) {
                guildConf.timers.splice(index, 1);
                client.settings.set(guild.id, guildConf);
                main();
              } else {
                view();
              }
            }
          })();
        }
      });
      try {await msg.react('✅');}catch(e){}
      try {await msg.react('✏️');}catch(e){}
      try {await msg.react('📝');}catch(e){}
      try {await msg.react('⏱️');}catch(e){}
      try {await msg.react('⏭️');}catch(e){}
      try {await msg.react('📄');}catch(e){}
      try {await msg.react('🗑️');}catch(e){}
    });
  }

  function title(isNew) {
    channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.get.title",l), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      listener.on("collect", m => {
        if (guildConf.autodelete) {
            msg.delete();
            m.delete();
        }
        listener.stop();
        workSettings.title = m.content;
        if (isNew) {
          desc(true, "");
        } else {
          view();
        }
      });
    });
  }

  function desc(isNew) {
    channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.get.desc",l), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      listener.on("collect", m => {
        if (guildConf.autodelete) {
            msg.delete();
            m.delete();
        }
        listener.stop();
        workSettings.desc = m.content;
        if (isNew) {
          freq(true, "");
        } else {
          view();
        }
      });
    });
  }

  function freq(isNew, editing) {
    channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.get.freq",l), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      let active = true;
      listener.on("collect", async function (m) {
        if (!active) return;
        if (guildConf.autodelete) m.delete();
        active = false;
        let durget = await parser.parseArguments(client, guild, guildConf, channel, user.id, [m.content], [{type:"duration"}], false);
        if (durget == null || !durget.duration) {
          embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.wrongFormat",l)}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
          active = true;
        } else {
          listener.stop();
          if (guildConf.autodelete) {
            msg.delete();
            m.delete();
          }
          workSettings.freq = durget.duration;
          if (isNew) {
            next(true, "");
          } else {
            view();
          }
        }
      });
    });
  }

  function next(isNew, editing) {
    channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.get.next",l), guildConf.colors.primary))
      .then(async function(msg) {
      let listener = listeners.msgListener(channel, message.author.id, guildConf.timeouts.messageCollector, guildConf);
      let active = true;
      listener.on("collect", async function (m) {
        if (!active) return;
        if (guildConf.autodelete) m.delete();
        active = false;
        let durget = await parser.parseArguments(client, guild, guildConf, channel, user.id, [m.content], [{type:"duration"}], false);
        if (durget == null || !durget.duration) {
          embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.wrongFormat",l)}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
          active = true;
        } else {
          listener.stop();
          if (guildConf.autodelete) {
            msg.delete();
            m.delete();
          }
          workSettings.next = Date.now() + durget.duration;
          if (isNew) {
            chan(true, "");
          } else {
            view();
          }
        }
      });
    });
  }
  
  function chan(isNew) {
     channel.send(embeds.simpleEmbed(loc("timers.title",l),loc("timers.get.chan",l), guildConf.colors.primary))
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
            workSettings.chan = id.channel;
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
}

async function pickOption(msg, max, channel, user, guild, channel, guildConf, client) {
  let args = await parser.parseArguments(client, guild, guildConf, channel, user.id, [msg.content], [{type:"count"}], false);
  if (args == null) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.nan",l,[msg])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, channel, guildConf.autodelete, guildConf.timeouts.autodelete);
  else if (args.count > max || args.count < 0) embeds.sendSimpleEmbed(loc("err.err",l),`${loc("err.notInRange",l,[args.count])}\n${loc("err.tryAgain",l)}`, guildConf.colors.failure, message.channel, guildConf.autodelete, guildConf.timeouts.autodelete);
  else return args.count;
  return null;
}

module.exports.help = {
    perms: ["MODERATOR"],
    args:[]
};