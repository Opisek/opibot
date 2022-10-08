const { EmbedBuilder } = require("discord.js");
const api = require("novelcovid")
const { loc, locNum } = require("../internal/localizer.js");

module.exports.run = async (bot, interaction, args, guildConf)=> {
    const l = guildConf.language;
    if(!args.country) api.all().then(response => {interaction.sendEmbed(form(response, bot.settings.get(interaction.guild.id).colors.primary, l));});
    else api.countries({country:args.country}).then(response => {interaction.sendEmbed(form(response, bot.settings.get(interaction.guild.id).colors.primary, l, args.country));});
}

function form(response, col, l, country = null) {
    return new EmbedBuilder()
    .setColor(col)
    .setTitle(country ? loc("covid.curCountry",l,[country]) : loc("covid.curWorld",l))
    .addFields([
        {"name": loc("covid.all",l), "value": locNum(response.cases, l), "inline": true},
        {"name": loc("covid.newCases",l), "value": locNum(response.todayCases, l), "inline": true},
        {"name": loc("covid.active",l), "value": locNum(response.active, l), "inline": true},
        {"name": loc("covid.deceased",l), "value": locNum(response.deaths, l), "inline": true},
        {"name": loc("covid.newDeceased",l), "value": locNum(response.todayDeaths, l), "inline": true},
        {"name": loc("covid.cured",l), "value": locNum(response.recovered, l), "inline": true}
    ])
    .setThumbnail("https://i.ibb.co/Wf2X8zD/giphy.gif")
}

exports.help = {
    perms: [],
    args:[{type:"country",optional:true}]
}