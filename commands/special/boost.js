const { Client, CategoryChannel, MessageEmbed } = require("discord.js");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Nie masz odpowiednich uprawnień.");
  if(message.member.hasPermission("MANAGE_MESSAGES")){
  message.delete();
  var number = "21";
  var embed = new MessageEmbed()
  .setTitle("SERVER BOOSTING")
  .setDescription('**Lista osób, które wsparły nasz serwer poprzez wzmocnienia:**\n\n1. `vimosky#5892`\n2. `Cysiek#6969`\n3. `Cheesoo#2137`\n4. `JacksonNTP#2938`\n5. `TomoS#7230`\n6. `El Mentor#3550`\n7. `funkcyjka#9223`\n8. `Mati#4072`\n9. `Maisie Harington#2997`\n10. `Altsin#3333`\n11. `Cartman#0521`\n12. `Altaïr w niedoli#0684`\n13. `Pumba#1588`\n14. `Argahawk#4360`\n15. `Nerumia#7522`\n16. `Karel#8364`\n17. `Dawix7777#1939`\n18. `Sarkinis#0656`\n19. `Yusuf_#5892`\n20. `Rudy#9862`\n21. `Makin#0001`\n22. `Wikvskaa#5168`\n23. `Enter#6725`\n24. `Pomidean#9876`\n25. `206_kemuri_Nekotricio_206#2992`\n26. `AcgamerSixd#7379`\n27. `azbioro#3343`\n28. `cowabunga_dude#0345`\n29. `Hollow Kitten#8499`\n30. `Papryk#7652`\n31. `Delta#3490`\n32. `Marcel B.#5360`\n33. `SZEF POWRACA#3553`\n34. `Luna Vadash#2314`')
  .setImage("https://cdn.discordapp.com/attachments/738799641193349130/751733827612835840/nitro.gif")
  .setColor('#36393f')

  message.channel.send(embed)
  };
}

module.exports.help = {
  perms:[],
  args:[],
  clients:["Senu"]
}