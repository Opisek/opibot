const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const tools = require("../../tools.js");
const emoji = tools.emoji;
const ms = require("ms");
const quizlist = require("../../quizlist2.js");
const quizes = quizlist.quizes;
const quizNames = Object.keys(quizes);
const moment = require("moment-timezone");
const lang = 'pl';

  //yellow   0xf4d122
  //blue     0x4286f4
  //green    0x3ee035
  //red      0xff3030

module.exports.run = async (bot, message, args, guildConf) => {  
  
  // bot.on("message", async message => {
  //   if(message.author.bot) stopCol();
  // });
  message.delete();
  
  let cmdchannels = [];
  let chan1 = message.guild.channels.cache.find(channel => channel.name.startsWith("quiz"));
  let chan2 = message.guild.channels.cache.find(channel => channel.name.startsWith("testowanie"))
  let chan3 = message.guild.channels.cache.find(channel => channel.name.startsWith("beta-testy"))
      cmdchannels.push(chan1);
      cmdchannels.push(chan2);
      cmdchannels.push(chan3);
  if (!cmdchannels.includes(message.channel)) {return message.reply('**Quiz zakończony. Zapraszamy na kolejny w niedalekiej przyszłości.**');}
  
  const guild = message.guild;
  const GUILDID = guild.id;
  const chan = message.channel;
  const author = message.author;
  const member = message.member;
  let dmchan = null;
  let userAnswers = [];
  
  guildConf = bot.settings.get(GUILDID);
  if(!guildConf.quizcooldown) guildConf.quizcooldown = {};
  if(!guildConf.quizcooldown[author.id]) guildConf.quizcooldown[author.id] = {};
  let userCooldowns = guildConf.quizcooldown[author.id];
  bot.settings.set(GUILDID,guildConf);
  
  start();
  
  function start() {
    guildConf = bot.settings.get(GUILDID);
    userCooldowns = guildConf.quizcooldown[author.id];
    
    let embed = new MessageEmbed();
    embed.setColor(0x4286f4);
    embed.setTitle('Quiz wiedzy o Wikingach');
    embed.setDescription(`Witaj **${author.username}**! Wpisz numer quizu jako odpowiedź do bota, aby rozpocząć.`)
    embed.setImage('https://i.imgur.com/nOwc6rq.jpg')

    let i = 0;
    for (let key in quizes) {
        let block = '';
        if(userCooldowns[key] > Date.now()) block = '🚫 ';
        if(Date.now()-member.joinedAt<quizes[key].mintime) block='🕒 ';
        if (quizes[key].role!=null) {
          let hasRoles = false;
          let rolesToHave = 'none';
          let applicable = false;
          if (quizes[key].role!=null) {
            let hasRoles = 0;
            let requiredRoles = quizes[key].role.split(',');
            let roleNames = [];
            for (let i of requiredRoles) {
              roleNames.push(guild.roles.find('id',i).name);
              if(message.member.roles.cache.find('id',i)) hasRoles++;
            }
            rolesToHave = roleNames.join(' oraz ');
            applicable = (hasRoles>=quizes[key].minroles);
          } else {applicable = true};
          if (!applicable) block = '🔒 ';
        }
        if(userCooldowns[key]==true) block = '✅ ';
        i++
        if (!quizes.hasOwnProperty(key)) continue;
        embed.addField(i,block + key);
    }

    author.send(embed)
    .then(function(message){
      dmchan = message.channel;
      const collector = new Discord.MessageCollector(message.channel, m => m.author.id === author.id, { time: 600000});
        collector.on('collect', m => {
            let picked = m.content;
            //if (Number.isNaN(Number(picked))) picked = -1;
            collector.stop();
            pickedQuiz(picked-1);
        });
        // function stopCol() {
        //   collector.stop(); 
        // }
        bot.on("message", async message => {
          if(message.author.bot&&message.channel==dmchan) collector.stop();
        });
    });
  }
  
  function pickedQuiz(picked) {
    if (Number.isNaN(Number(picked))||picked+1>quizNames.length) {
      let embed = new MessageEmbed();
      embed.setColor(0xff3030);
      embed.setTitle('Błąd');
      embed.setDescription(`Nie znaleziono quizu o numerze \`${picked+1}\``);
      author.send(embed)
      .then(async function(message){
        const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
        await message.react("✅");
        collector.on('collect', r => {
          collector.stop();
          start();
          return;
        });
      });
      return;
    }
    guildConf = bot.settings.get(GUILDID);
    userCooldowns = guildConf.quizcooldown[author.id];
    let pickedName = quizNames[picked];
    
    
    if (userCooldowns[pickedName] == true) {
      let embed = new MessageEmbed();
      embed.setColor(0xff3030);
      embed.setTitle('Już przeszedłeś/przeszłaś ten quiz!');
      embed.setDescription(`Już raz ukończyłeś(aś) ten quiz. Gratulacje!`);
      author.send(embed)
      .then(async function(message){
        const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
        await message.react("✅");
        collector.on('collect', r => {
          collector.stop();
          start();
          return;
        });
      });
      return;
    }
    
    if (quizes[pickedName].role!=null) {
      let hasRoles = false;
      let rolesToHave = 'none';
      let applicable = false;
      if (quizes[pickedName].role!=null) {
        let hasRoles = 0;
        let requiredRoles = quizes[pickedName].role.split(',');
        let roleNames = [];
        for (let i of requiredRoles) {
          console.log(i);
          roleNames.push(guild.roles.cache.find('id',i).name);
          if(message.member.roles.cache.find('id',i)) hasRoles++;
          console.log(hasRoles);
        }
        rolesToHave = roleNames;
        rolesToHave.length = quizes[pickedName].minroles;
        rolesToHave = rolesToHave.join(' oraz ');
        // console.log(hasRoles);
        // console.log(requiredRoles.length);
        applicable = (hasRoles>=quizes[pickedName].minroles);
      } else {applicable = true};
      if (!applicable) {
        let embed = new MessageEmbed();
        embed.setColor(0xff3030);
        embed.setTitle('Nie możesz zagrać w ten quiz!');
        embed.setDescription(`Aby zagrać w ten quiz, potrzebna Ci będzie ranga **${rolesToHave}**`);
        author.send(embed)
        .then(async function(message){
          const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
          await message.react("✅");
          collector.on('collect', r => {
            collector.stop();
            start();
            return;
          });
        });
        return;
      }
    }  
    
    //if(Date.now()-member.joinedAt<quizes[key].mintime) block='🕒 ';
    
    if (Date.now()-member.joinedAt<quizes[pickedName].mintime) {
      let embed = new MessageEmbed();
      embed.setColor(0xff3030);
      embed.setTitle('Zwolnij!');
      embed.setDescription(`Niestety nie możesz jeszcze rozwiązać tego quizu. Spróbuj ponownie za **${ms(quizes[pickedName].mintime-(Date.now()-member.joinedAt))}**`);
      author.send(embed)
      .then(async function(message){
        const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
        await message.react("✅");
        collector.on('collect', r => {
          collector.stop();
          start();
          return;
        });
      });
      return;
    }
    
    //let date = moment(userCooldowns[pickedName]).tz("Europe/Warsaw").format("DD.MM.YYYY HH:mm");;
    if (userCooldowns[pickedName] > Date.now()) {
      let date = ms(userCooldowns[pickedName]-Date.now());
      let embed = new MessageEmbed();
      embed.setColor(0xff3030);
      embed.setTitle('Zwolnij!');
      embed.setDescription(`Niestety nie możesz jeszcze rozwiązać tego quizu. Spróbuj ponownie za **${date}**`);
      author.send(embed)
      .then(async function(message){
        const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
        await message.react("✅");
        collector.on('collect', r => {
          collector.stop();
          start();
          return;
        });
      });
      return;
    }
    
    let quiz = quizes[pickedName];
    let embed = new MessageEmbed();
    embed.setColor(0x3ee035);
    embed.setTitle("Czy chcesz rozpocząć?");
    let reward = '';
    let desc = `
    Wybrałeś(aś) quiz **${pickedName}**, który ma **${quiz.questions.length} pytań**.
    \nNa każde pytanie masz **${ms(quiz.timePerQuestion)}** czasu. 
    \n**Opis:** \n ${quiz.description}`;
    if (quiz.reward[0]=='role') {
      reward = `rolę **${guild.roles.cache.find('id',quiz.reward[1]).name}**`;
    }
    if (reward != '') desc += `\n\nJeżeli odpowiesz na minimum ${quiz.requirement} pytań, otrzymasz ${reward}.`;
    desc += `\n\n Czy chcesz zagrać w ten quiz?`;
    embed.setDescription(desc);
    author.send(embed)
    .then(async function(message){
      const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
      await message.react("✅");
      await message.react("❌");
      collector.on('collect', r => {
        collector.stop();
        if(r.emoji.name=='✅') {
          beginQuiz(picked);
        } else {
          start();
        }
        return;
      });
    });
  }
  
  function beginQuiz(num) {
    guildConf = bot.settings.get(GUILDID);
    userCooldowns = guildConf.quizcooldown[author.id];
    let name = quizNames[num];
    let cooldown = quizes[name].cooldown;
    //userCooldowns[name] = cooldown + Date.now();
    bot.settings.set(GUILDID,guildConf);
    userAnswers = [];
    askQuestion(num,0);
  }
  
  function askQuestion(questionindex,num) {
    let pickedName = quizNames[questionindex];
    let quiz = quizes[pickedName];
    let questions = quiz.questions;
    let q = questions[num]
    let question = q.question;
    let answers =  q.answers;
    let correctReaction = emoji[String.fromCharCode(97 + q.correct)];
    let time = quiz.timePerQuestion;
    
    let embed = new MessageEmbed();
    embed.setTitle(`${pickedName} | Pytanie ${num+1}`);
    embed.setColor(0x4286f4);
    if (q.image!=null) {
      embed.setImage(q.image); 
    }
    let answersText = '';
    for(let i in answers) {
      answersText = answersText + '\n\n' + (emoji[String.fromCharCode(97 + Number(i))] + ' ' + answers[i]);
    }
    embed.setDescription(questions[num].question + answersText);
    author.send(embed)
    .then(async function(message){
      const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: time});
      collector.on('collect', r => {
        collector.stop();
        let isCorrect = false;
        if(r.emoji.name==correctReaction) isCorrect = true;
        userAnswers.push(isCorrect);
        if (num+1<questions.length) {
          askQuestion(questionindex,num+1);
        } else {
          finish(questionindex);
        }
      });
      for (let i=0;i<answers.length;i++) {
         await message.react(emoji[String.fromCharCode(97 + i)]); 
      }  
      collector.on('end', (c,r) => {
        if (r=='time') {
          userAnswers.push(false);
          timeOut(questionindex,num);  
        }
      });
    });
  }
  
  function timeOut(questionindex,num) {
    let pickedName = quizNames[questionindex];
    let quiz = quizes[pickedName];
    let questions = quiz.questions;
    let embed = new MessageEmbed();
      embed.setColor(0xff3030);
      embed.setTitle('Koniec czasu');
      embed.setDescription(`Upłynął czas odpowiedzi na pytanie. Kliknij ✅, kiedy będziesz gotów/gotowa kontynuować.`);
      author.send(embed)
      .then(async function(message){
        const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
        await message.react("✅");
        collector.on('collect', r => {
          collector.stop();
          if (num+1<questions.length) {
          askQuestion(questionindex,num+1);
          } else {
            finish(questionindex);
          }
          return;
        });
      });  
  }
  
  function finish(num) {
    let pickedName = quizNames[num];
    let q = quizes[pickedName];
    let total = userAnswers.length;
    let right = 0;
    for (let i of userAnswers) if(i) right++
    if (right>=quizes[pickedName].requirement) {
      guildConf = bot.settings.get(GUILDID);
      userCooldowns = guildConf.quizcooldown[author.id];
      userCooldowns[pickedName] = true;
      bot.settings.set(GUILDID,guildConf);  
      if (q.reward[0]=='role') {
        if (q.reward[2]!='') {
          let oldRole = guild.roles.find('id',q.reward[2]);
          try{member.removeRole(oldRole)}catch(e){}
        }
        let newRole = guild.roles.cache.find('id',q.reward[1]);
        member.addRole(newRole);
        let roleEmbed = new MessageEmbed()
        roleEmbed.setColor('#e5bc4e')
        roleEmbed.setDescription(`**${member.user.username}\u200e#${member.user.discriminator}** otrzymał(a) rangę **${newRole.name}**`);
        chan.send(roleEmbed);
      }
      let success = new MessageEmbed()
      success.setColor('#e5bc4e')
      success.setDescription(`**${member.user.username}\u200e#${member.user.discriminator}** pomyślnie ukończył quiz odpowiadając na **${right}** z **${total}** pytań! 🎉`);
      guild.channels.cache.get("739145436614361219").send(success);
    } else {
      guildConf = bot.settings.get(GUILDID);
      userCooldowns = guildConf.quizcooldown[author.id];
      let name = quizNames[num];
      let cooldown = quizes[name].cooldown;
      userCooldowns[name] = cooldown + Date.now();
      bot.settings.set(GUILDID,guildConf);  
    }
    let embed = new MessageEmbed();
    embed.setColor(0x3ee035);
    if (lang=='pl') {
      embed.setTitle("Koniec quizu!");
      embed.setDescription(`Ukończyłeś(aś) quiz **${pickedName}**.\nOdpowiedziałeś(aś) poprawnie na **${right}** z **${total}** pytań!\n\nMożesz powtórzyć ten quiz za 2 minuty.`);
    }
    author.send(embed)
    .then(async function(message){
      const collector = message.createReactionCollector((reaction, user) => user.id === author.id, { time: 600000});
      await message.react("✅");
      await message.react("❌");
      collector.on('collect', r => {
        collector.stop();
        if(r.emoji.name=='✅') {
          start();
        }
        return;
      });
    });
  }
}

module.exports.help = {
  perms:["ADMINISTRATOR"],
  args:[],
  clients:["Senu"]
}