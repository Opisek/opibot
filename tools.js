module.exports = {
  emoji: {
  "yes":"👍",
  "no":"👎",
  "idk":"🤷",
  "shrug":"🤷",
  "a":"🇦",
  "b":"🇧",
  "c":"🇨",
  "d":"🇩",
  "e":"🇪",
  "f":"🇫",
  "g":"🇬",  
  "h":"🇭",
  "i":"🇮",
  "j":"🇯",
  "k":"🇰",
  "l":"🇱",
  "m":"🇲",
  "n":"🇳",
  "o":"🇴",
  "p":"🇵",
  "q":"🇶",
  "r":"🇷",
  "s":"🇸",
  "t":"🇹",
  "u":"🇺",
  "v":"🇻",
  "w":"🇼",
  "x":"🇽",
  "y":"🇾",
  "z":"🇿",
  "happy":"🙂",
  "sad":"🙁",
  "crying":"😭",
  "cry":"😭",
  "tears":"😭",
  "laughing":"😆",
  "xd":"😆",
  "laugh":"😆",
  "joy":"😂",
  "lol":"😂",
  "en":"🇺🇸",
  "pl":"🇵🇱",
  "de":"🇩🇪",
  "ru":"🇷🇺",
  "check":"✅",
  "cross":"❌",
  "back":"🔙",
  "briefcase":"💼",
  "pager":"📟",
  "game_die":"🎲",
  "musical_note":"🎵",
  "gear":"⚙",
  "arrow_backward": "◀"  
  },
  msToTime: function(duration,format) {
    let milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24),
      days = parseInt((duration / (1000 * 60 * 60 * 24))),
      hourss = hours-Math.floor(hours/10)*10,
      minutess = minutes-Math.floor(minutes/10)*10,
      secondss = seconds-Math.floor(seconds/10)*10;
    let hoursZero = (hours < 10) ? "0" + hours : hours;
    let minutesZero = (minutes < 10) ? "0" + minutes : minutes;
    let secondsZero = (seconds < 10) ? "0" + seconds : seconds;
    
    let hoursPrefix = '';
    if (hourss<5&&hourss>1&&(hours>20||hours<10)) hoursPrefix = 'y';
    if (hours==1) hoursPrefix = 'ę';

    let minPrefix = '';
    if (minutess<5&&minutess>1&&(minutes>20||minutes<10)) minPrefix = 'y';
    if (minutes==1) minPrefix = 'ę';

    let secPrefix = '';
    if (secondss<5&&secondss>1&&(seconds>20||seconds<10)) secPrefix = 'y';
    if (seconds==1) secPrefix = 'ę';

    let dayz = "";
    if (days == 0) {
        days = ""
    } else {
        dayz = (days == 1) ? " dzień " : " dni ";
    }
    
    switch(format) {
      case('writtenOut'):

          if (days>=1) {
            return `${days}${dayz}${hours} godzin${hoursPrefix} i ${minutes} minut${minPrefix}`
          } else if (hours>=1) {
          return `${hours} godzin${hoursPrefix} i ${minutes} minut${minPrefix}`
        } else if (minutes>=15) {
          return `${minutes} minut${minPrefix}` 
        } else if (minutes>=1) {
          return `${minutes} minut${minPrefix} i ${seconds} sekund${secPrefix}` 
        } else {
          return `${seconds} sekund${secPrefix}` 
        }
      default:
        return hoursZero + ":" + minutesZero;
    }
  }}