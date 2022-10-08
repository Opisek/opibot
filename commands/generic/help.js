const embeds = require("../internal/embeds.js");
const perms = require("../internal/permissions.js");
const parser = require("../internal/parser.js");
const { loc } = require("../internal/localizer.js");
exports.run = async (client, interaction, args, conf) => {
  const l = conf.language;
  let cmd = null;
  if (args.cmd != null) cmd = client.commands[args.cmd];
  if (cmd && perms.checkPerms(conf, interaction, cmd.help.perms, false)) { // specific cmd
    let list = [];
    list.push([loc("cmds.term.desc",l), loc(`cmds.cmds.${args.cmd}`,l)]); // cmd desc
    let argsdesc = [];
    let argslist = parser.getSorted(cmd.help.args);
    let multstring = false;
    for (let i = 0; i < argslist.length; i++) { // cmd args
      let data = {...argslist[i], ...parser.getData(argslist[i].type, l)};
      if (data.multiple && data.type == "string") multstring = true;
      argsdesc.push(`• ${data.name} \`\`${data.examples.join("\`\` \`\`")}\`\`${data.optional ? ` (${loc("cmds.term.opt",l)})` : ""}${data.multiple ? ` (${loc("cmds.term.mult",l)} ${data.min ? data.min : data.optional ? 0 : 1}${data.max ? `-${data.max}` : "+"})` : ""}`);
    }
    argsdesc = argsdesc.length > 0 ? argsdesc.join("\n") : loc("cmds.term.noArgs",l); // no args
    list.push([loc("cmds.term.args",l), argsdesc]);
    if (multstring) list.push([loc("gen.info",l), loc("cmds.term.multString",l)]);
    await interaction.sendEmbed(embeds.fieldsEmbed(loc("cmds.term.specificCmd",l,[args.cmd]), "", list, conf.colors.primary, null, null));
  } else { // all cmds
    let list = {};
    for (const cmdi in client.commands) {
      let cmd = client.commands[cmdi];
      let cmdcat = loc(`cmds.cat.${cmd.help.cat}`,l);
      if (!(cmdcat in list)) list[cmdcat] = [];
      if (perms.checkPerms(conf, interaction, cmd.help.perms, false)) list[cmdcat].push(`**${cmdi}**: ${loc(`cmds.cmds.${cmdi}`,l)}`); // entry
    }
    for (let cat in list) if (list[cat].length == 0) delete list[cat]; // reduce empty categories
    list = Object.fromEntries(Object.entries(list).sort()); // sort categories
    await interaction.sendEmbed(embeds.listEmbed(loc("cmds.term.cmds",l), "", list, "point", conf.colors.primary));
  }
  interaction.stop();
}
module.exports.help = {
    perms: [],
    args:[{type:"cmd", optional:true}]
};