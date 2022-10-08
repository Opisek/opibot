const listeners = require("./listeners.js");
const embeds = require("./embeds.js");
const { loc } = require("./localizer.js");

const maxcol = 15;

module.exports = {
  modal: function(queries, id, l = null) {
    let components = [];
    for (const [i, query] of queries.entries()) {
      components.push({
        "type": 1,
        "components": [{
          "type": 4,
          "custom_id": i.toString(),
          "label": query.label,
          "style": 1,
          "min_length": 1,
          "max_length": 4000,
          "placeholder": query.placeholder,
          "required": true
        }]
      });
    }
    return {
      "title": "testing",
      "custom_id": id,
      "components": components,
    };
  },
  role: async function(guild, conf, channel, user, query) {
    if (query == null || query == "" || query.length < 2) return null;
    const l = conf.language;
    const ad = conf.autodelete;
    const adt = conf.timeouts.autodelete;
    let picked = null;
    let role = await guild.roles.cache.get(query);
    if (role != undefined) {
      return role.id;
    }
    if (query.endsWith('>'))
    {
      if (query.startsWith('<@&'))
      {
        role = await guild.roles.cache.get(query.substr(3).slice(0, -1));
      }
      else if (query.startsWith('<@'))
      {
        role = await guild.roles.cache.get(query.substr(2).slice(0, -1));
      }
      if (role != undefined) {
        return role.id;
      }
    }
    let found = Array.from(guild.roles.cache.filter(r => r.name.toLowerCase().includes(query.toLowerCase())).values());
    if (found.length > 0)
    {
      if (found.length > maxcol) {
        return null;
      }
      if (found.length == 1 && found[0].name.toLowerCase() == query.toLowerCase()) return found[0].id;
      specify(found, channel, user, l, ad, adt);   
      return await new Promise(function (resolve, reject) {
          (function waitForChoice(){
            if (picked != null) return resolve(picked == "undefined" ? undefined : picked);
            setTimeout(waitForChoice, 50);
          })();
      });
    }
    else
    {
      return null;
    }
    function specify(collection, channel, user, l, ad, adt)
    {
      let idlist = [];
      for (let i = 0; i < collection.length; i++) {
        idlist.push(`<@&${collection[i].id}>`);
      }
      if (collection.length == 1) {
        channel.send(embeds.simpleEmbed(loc("queries.searchInconclusive",l), loc("queries.confirmRole",l,[collection[0]]), conf.colors.warning))
          .then(async function(m) {
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          reactionList.on("collect", function(r) {
            if (r.emoji.name == "✅") {
              if (ad) m.delete();
              reactionList.stop();
              picked = collection[0].id;
            } else if (r.emoji.name == "❌") {
              if (ad) m.delete();
              reactionList.stop();
              picked = "undefined";
            }
          });
          await m.react('✅');
          await m.react('❌');
        });
      } else {
        let inparg = {};
        inparg[loc("queries.rolesFound",l)] = idlist;
        channel.send(embeds.listEmbed(loc("queries.multipleRoles",l), loc("queries.specifyRole",l), inparg, "num", conf.colors.warning))
          .then(async function(m) {
          let msgList = listeners.msgListener(channel, user, conf.timeouts.messageCollector, conf);
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          msgList.on("collect", function (m2){
            let choice = m2.content;
            if (isNaN(Number(choice))) {
              embeds.sendSimpleEmbed("",`${loc("err.nan",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt);   
            } else {
              if (Number(choice) <= 0 || Number(choice) > collection.length)
              {
                embeds.sendSimpleEmbed("",`${loc("err.notInRange",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt);    
              }
              else
              {
                if (ad) {
                  m.delete();
                  m2.delete();
                }
                msgList.stop();
                reactionList.stop();
                picked = collection[choice-1].id;
              }
            }
          });
          reactionList.on("collect", function (r){
            if (r.emoji.name == "❌")
            {
              if (ad) m.delete();
              msgList.stop();
              reactionList.stop();
              picked = "undefined";
            }
          })
          await m.react('❌');
        });
      }
    }
  },
  channel: async function(guild, conf, channel, user, query) {
    if (query == null || query == "" || query.length < 2) return null;
    const l = conf.language;
    const ad = conf.autodelete;
    const adt = conf.timeouts.autodelete;
    let picked = null;
    let chan = await guild.channels.cache.get(query);
    if (chan != undefined) {
      return chan.id;
    }
    if (query.endsWith('>'))
    {
      if (query.startsWith('<#!'))
      {
        chan = await guild.channels.cache.get(query.substr(3).slice(0, -1));
      }
      else if (query.startsWith('<#'))
      {
        chan = await guild.channels.cache.get(query.substr(2).slice(0, -1));
      }
      if (chan != undefined) {
        return chan.id;
      }
    }
    let found = Array.from(guild.channels.cache.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) && r.type != "category").values());
    if (found.length > 0)
    {
      if (found.length > maxcol) {
        return null;
      }
      if (found.length == 1 && found[0].name.toLowerCase() == query.toLowerCase()) return found[0].id;
      specify(found, channel, user, l, ad, adt);  
      return await new Promise(function (resolve, reject) {
          (function waitForChoice(){
            if (picked != null) return resolve(picked == "undefined" ? undefined : picked);
            setTimeout(waitForChoice, 50);
          })();
      });
    }
    else
    {
      return null;
    }
    function specify(collection, channel, user, l, ad, adt)
    {
      let idlist = [];
      for (let i = 0; i < collection.length; i++) {
        idlist.push(`<#${collection[i].id}>`);
      }
      if (collection.length == 1) {
        channel.send(embeds.simpleEmbed(loc("queries.searchInconclusive",l), loc("queries.confirmChannel",l,[collection[0]]), conf.colors.warning))
          .then(async function(m) {
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          reactionList.on("collect", function(r) {
            if (r.emoji.name == "✅") {
              if (ad) m.delete();
              reactionList.stop();
              picked = collection[0].id;
            } else if (r.emoji.name == "❌") {
              if (ad) m.delete();
              reactionList.stop();
              picked = "undefined";
            }
          });
          await m.react('✅');
          await m.react('❌');
        });
      } else {
        let inparg = {};
        inparg[loc("queries.channelsFound",l)] = idlist;
        channel.send(embeds.listEmbed(loc("queries.multipleChannels",l), loc("queries.specifyChannel",l), inparg, "num", conf.colors.warning))
          .then(async function(m) {
          let msgList = listeners.msgListener(channel, user, conf.timeouts.messageCollector, conf);
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          msgList.on("collect", function (m2){
            let choice = m2.content;
            if (isNaN(Number(choice))) {
              embeds.sendSimpleEmbed("",`${loc("err.nan",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt);   
            } else {
              if (Number(choice) <= 0 || Number(choice) > collection.length)
              {
                embeds.sendSimpleEmbed("",`${loc("err.notInRange",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt); 
              }
              else
              {
                if (ad) {
                  m.delete();
                  m2.delete();
                }
                msgList.stop();
                reactionList.stop();
                picked = collection[choice-1].id;
              }
            }
          });
          reactionList.on("collect", function (r){
            if (r.emoji.name == "❌")
            {
              if (ad) m.delete();
              msgList.stop();
              reactionList.stop();
              picked = "undefined";
            }
          })
          await m.react('❌');
        });
      }
    }
  },
  user: async function(guild, conf, channel, user, query) {
    if (query == null || query == "" || query.length < 2) return null;
    const l = conf.language;
    const ad = conf.autodelete;
    const adt = conf.timeouts.autodelete;
    let picked = null;
    let usr = await guild.members.cache.get(query);
    if (usr != undefined) {
      return usr.user.id;
    }
    if (query.endsWith('>'))
    {
      if (query.startsWith('<@!'))
      {
        usr = await guild.members.cache.get(query.substr(3).slice(0, -1));
      }
      else if (query.startsWith('<@'))
      {
        usr = await guild.members.cache.get(query.substr(2).slice(0, -1));
      }
      if (usr != undefined) {
        return usr.user.id;
      }
    }
    return await guild.members.fetch().then(fetched => (async function(arguments) {
      let found = Array.from(fetched.filter(r => r.user.username.toLowerCase().includes(query.toLowerCase()) || r.nickname && r.nickname.toLowerCase().includes(query.toLowerCase())).values());
      if (found.length > 0)
      {
        if (found.length > maxcol) {
          return null;
        }
        if (found.length == 1 && (found[0].user.username.toLowerCase() == query.toLowerCase() || (found[0].nickname && found[0].nickname.toLowerCase() == query.toLowerCase()))) return found[0].id;
        specify(found, channel, user, l, ad, adt);   
        return await new Promise(function (resolve, reject) {
            (function waitForChoice(){
              if (picked != null) return resolve(picked == "undefined" ? undefined : picked);
              setTimeout(waitForChoice, 50);
            })();
        });
      }
      else
      {
        return null;
      }
    })());
    function specify(collection, channel, user, l, ad, adt)
    {
      let idlist = [];
      for (let i = 0; i < collection.length; i++) {
        idlist.push(`<@${collection[i].id}>`);
      }
      if (collection.length == 1) {
        channel.send(embeds.simpleEmbed(loc("queries.searchInconclusive",l), loc("queries.confirmUser",l,[collection[0]]), conf.colors.warning))
          .then(async function(m) {
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          reactionList.on("collect", function(r) {
            if (r.emoji.name == "✅") {
              if (ad) m.delete();
              reactionList.stop();
              picked = collection[0].id;
            } else if (r.emoji.name == "❌") { 
              if (ad) m.delete();
              reactionList.stop();
              picked = "undefined";
            }
          });
          await m.react('✅');
          await m.react('❌');
        });
      } else {
        let inparg = {};
        inparg[loc("queries.usersFound",l)] = idlist;
        channel.send(embeds.listEmbed(loc("queries.multipleUsers",l), loc("queries.specifyUser",l), inparg, "num", conf.colors.warning))
          .then(async function(m) {
          let msgList = listeners.msgListener(channel, user, conf.timeouts.messageCollector, conf);
          let reactionList = listeners.reactionListener(m, channel, user, conf.timeouts.reactionCollector, conf);
          msgList.on("collect", function (m2){
            let choice = m2.content;
            if (isNaN(Number(choice))) {
              embeds.sendSimpleEmbed("",`${loc("err.nan",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt);
            } else {
              if (Number(choice) <= 0 || Number(choice) > collection.length)
              {
                embeds.sendSimpleEmbed("",`${loc("err.notInRange",l,[choice])} ${loc("err.tryAgain",l)}`, conf.colors.failure, channel, ad, adt);     
              }
              else
              {
                if (ad) {
                  m.delete();
                  m2.delete();
                }
                msgList.stop();
                reactionList.stop();
                picked = collection[choice-1].id;
              }
            }
          });
          reactionList.on("collect", function (r){
            if (r.emoji.name == "❌")
            {
              if (ad) m.delete();
              msgList.stop();
              reactionList.stop();
              picked = "undefined";
            }
          })
          await m.react('❌');
        });
      }
    }
  },
};