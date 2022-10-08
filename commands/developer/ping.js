exports.run = (client, interaction, args, guildConf) => {
    let pingtime =  new Date().getTime() - interaction.firstMessage.createdTimestamp + " ms";
    interaction.sendText("pong " + pingtime);
}
module.exports.help = {
    perms: ["DEVELOPER"],
    args:[]
};