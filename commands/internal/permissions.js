const Discord = require("discord.js");
const embeds = require("./embeds.js");
const { loc } = require("./localizer.js");

module.exports = {
  checkPerms: function(conf, interaction, requirement, error = true) {
    const l = conf.language;
    const member = interaction.member;
    const memberPermissions = member.permissions;
    const guild = interaction.guild;
    
    let permissioned = true;
    let missingPerms = [];

    let isAdmin = memberPermissions.has("ADMINISTRATOR");

    for (let i = 0; i < requirement.length; i++) {
      let hasPerm = false;
      switch (requirement[i]) {
        case "DEVELOPER":
          hasPerm = ["305115474612584448","151436376712151041"].includes(member.user.id);
          break;
        case "MODERATOR":
          const modRole = guild.roles.cache.get(conf.roles.mod);
          hasPerm = (modRole && member.roles.cache.get(modRole.id)) || isAdmin;
          break;
        case "MUSIC":
          const musicRole = guild.roles.cache.get(conf.roles.music);
          hasPerm = (musicRole && member.roles.cache.get(musicRole.id)) || isAdmin;
          break;
        default:
          try {
          hasPerm = memberPermissions.has(requirement[i]);
          } catch(e) {console.error("permissions.js - no such permission exists: " + requirement[i])}
          break;
      }
      if (!hasPerm) {
        permissioned = false;
        missingPerms.push(requirement[i]);
      }
    }

    if (!permissioned && error) interaction.sendEmbed(embeds.listEmbed(loc("err.noPerms",l), loc("err.noPermsVerbose",l), {[loc("err.missingPerms",l)]:missingPerms}, "point", conf.colors.failure));
    return permissioned;
  }
};