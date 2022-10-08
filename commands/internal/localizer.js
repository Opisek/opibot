const translations = require("../../translations.json");
module.exports = {
  loc: function(key, language, arguments = []) {
    return loc(key, language, arguments, language);
  },
  locNum: function(num, language) {
    if (!num) return null;
    const digitSep = language == "en" ? ',' : '.';
    const decSep = language == "en" ? '.' : ',';
    return num.toString().replace(".", decSep).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${digitSep}`);
  },
  getLangs: function() {
    return Object.keys(translations);
  },
  dur: function(time, language, type) {
    if (!type) type = 0;
    // types:
    // 0 - x time       | x czasu
    // 1 - in x time    | za x czasu
    // 2 - x time ago   | x czasu temu
    // 3 - for x time   | przez x czasu
    // 4 - every x time | co x czasu
    // 5 - since x time | od x czasu
    seconds = Math.floor(Math.abs(time/1000));
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    let days = Math.floor(hours / 24);
    hours -= days * 24;
    let months = Math.floor(days / 30.5);
    days -= Math.ceil(months * 30.5);
    let years = Math.floor(months / 12);
    months -= years * 12;

    let sword, mword, hword, dword, mmword, yword, and;
    let suf = "";
    let pref = "";
    
    switch(language) {
      case "pl":
        function ending(number) {
          if (number == 1) return "ę";
          let mod = number % 10;
          if (mod >= 2 && mod <= 4 && (number < 5 || number > 14)) return "y";
          return "";
        }
        sword = "sekund";
        mword = "minut";
        hword = "godzin";
        if (type == 5) {
          if (seconds == 1) sword += "y";
          if (minutes == 1) mword += "y";
          if (hours == 1) hword += "y";
          dword = days == 1 ? "dnia" : "dni";
          mmword = months == 1 ? "miesiąca" : "miesięcy";
          yword = years == 1 ? "roku" : "lat";
        } else {
          sword += ending(seconds);
          mword += ending(minutes);
          hword +=  ending(hours);
          dword = days == 1 ? "dzień" : "dni";
          if (months == 1) mmword = "miesiąc";
          else if (ending(months) == "y") mmword = "miesiące";
          else mmword = "miesiące"
          if (years == 1) yword = "rok";
          else if (ending(years) == "y") yword = "lata";
          else yword = "lat"
        }
        if (type == 1) pref = "za";
        else if (type == 2) suf = "temu";
        else if (type == 3) pref = "przez";
        else if (type == 4) pref = "co";
        else if (type == 5) pref = "od";
        and = "i";
        break;
      case "de":
        sword = seconds == 1 ? "Sekunde" : "Sekunden";
        mword = minutes == 1 ? "Minute" : "Minuten";
        hword = hours == 1 ? "Stunde" : "Stunden";
        dword = days == 1 ? "Tag" : "Tagen";
        mmword = months == 1 ? "Monat" : "Monaten";
        yword = years == 1 ? "Jahr" : "Jahren";
        if (type == 1) pref = "in";
        else if (type == 2) pref = "vor";
        else if (type == 3) suf = "lang";
        else if (type == 4) pref = "alle";
        else if (type == 4) pref = "seit";
        and = "und";
        break;
      default:
        sword = seconds == 1 ? "second" : "seconds";
        mword = minutes == 1 ? "minute" : "minutes";
        hword = hours == 1 ? "hour" : "hours";
        dword = days == 1 ? "day" : "days";
        mmword = months == 1 ? "month" : "months";
        yword = years == 1 ? "year" : "years";
        if (type == 1) pref = "in";
        else if (type == 2) suf = "ago";
        else if (type == 3) pref = "for";
        else if (type == 4) pref = "every";
        else if (type == 4) pref = "since";
        and = "and";
        break;
    }

    if (pref != "") pref += " ";
    if (suf != "") suf = " " + suf;

    let n1, n2, w1, w2;
    if (years > 0) {
      n1 = years;
      n2 = months;
      w1 = yword;
      w2 = mmword;
    }
    else if (months > 0) {
      n1 = months;
      n2 = days;
      w1 = mmword;
      w2 = dword;
    }
    else if (days > 0) {
      n1 = days;
      n2 = hours;
      w1 = dword;
      w2 = hword;
    }
    else if (hours > 0) {
      n1 = hours;
      n2 = minutes;
      w1 = hword;
      w2 = mword;
    }
    else if (minutes > 0) {
      n1 = minutes;
      n2 = seconds;
      w1 = mword;
      w2 = sword;
    } 
    else if (seconds) {
      n1 = seconds;
      n2 = 0;
      w1 = sword;
      w2 = "";
    }

    return `${pref}${n1} ${w1}${n2 == 0 ? "" : ` ${and} ${n2} ${w2}`}${suf}`;
  }
};
function loc (key, language, arguments, initialLanguage) {
    let path = (`${language}.${key}`).split(".");
    let dir = translations;
    for (let i = 0; i < path.length;) if (!(dir = dir[path[i++]])) return language == "en" ? loc("err.missingTranslation", initialLanguage, arguments, initialLanguage) : loc(key, "en", arguments, initialLanguage);
    for (let i = 0; i < arguments.length;) dir = dir.replace(`$${i}`, arguments[i++]);
    return dir;
}