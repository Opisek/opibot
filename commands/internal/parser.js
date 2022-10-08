const embeds = require("./embeds.js");
const queries = require("./queries.js");
const { loc, getLangs } = require("./localizer.js");
const ms = require("ms");

const types = {"user":-1,"role":-1,"channel":-1,"cmd":1,"dbkey":1,"country":3,"language":1,"color":1,"count":1,"duration":2,"json":-1,"reason":-1,"string":-1,"symbol":1};
const countries = [ {name: 'Afghanistan', code: 'AF'}, {name: 'Åland Islands', code: 'AX'}, {name: 'Albania', code: 'AL'}, {name: 'Algeria', code: 'DZ'}, {name: 'American Samoa', code: 'AS'}, {name: 'AndorrA', code: 'AD'}, {name: 'Angola', code: 'AO'}, {name: 'Anguilla', code: 'AI'}, {name: 'Antarctica', code: 'AQ'}, {name: 'Antigua and Barbuda', code: 'AG'}, {name: 'Argentina', code: 'AR'}, {name: 'Armenia', code: 'AM'}, {name: 'Aruba', code: 'AW'}, {name: 'Australia', code: 'AU'}, {name: 'Austria', code: 'AT'}, {name: 'Azerbaijan', code: 'AZ'}, {name: 'Bahamas', code: 'BS'}, {name: 'Bahrain', code: 'BH'}, {name: 'Bangladesh', code: 'BD'}, {name: 'Barbados', code: 'BB'}, {name: 'Belarus', code: 'BY'}, {name: 'Belgium', code: 'BE'}, {name: 'Belize', code: 'BZ'}, {name: 'Benin', code: 'BJ'}, {name: 'Bermuda', code: 'BM'}, {name: 'Bhutan', code: 'BT'}, {name: 'Bolivia', code: 'BO'}, {name: 'Bosnia and Herzegovina', code: 'BA'}, {name: 'Botswana', code: 'BW'}, {name: 'Bouvet Island', code: 'BV'}, {name: 'Brazil', code: 'BR'}, {name: 'British Indian Ocean Territory', code: 'IO'}, {name: 'Brunei Darussalam', code: 'BN'}, {name: 'Bulgaria', code: 'BG'}, {name: 'Burkina Faso', code: 'BF'}, {name: 'Burundi', code: 'BI'}, {name: 'Cambodia', code: 'KH'}, {name: 'Cameroon', code: 'CM'}, {name: 'Canada', code: 'CA'}, {name: 'Cape Verde', code: 'CV'}, {name: 'Cayman Islands', code: 'KY'}, {name: 'Central African Republic', code: 'CF'}, {name: 'Chad', code: 'TD'}, {name: 'Chile', code: 'CL'}, {name: 'China', code: 'CN'}, {name: 'Christmas Island', code: 'CX'}, {name: 'Cocos (Keeling) Islands', code: 'CC'}, {name: 'Colombia', code: 'CO'}, {name: 'Comoros', code: 'KM'}, {name: 'Congo', code: 'CG'}, {name: 'Congo, The Democratic Republic of the', code: 'CD'}, {name: 'Cook Islands', code: 'CK'}, {name: 'Costa Rica', code: 'CR'}, {name: 'Cote D\'Ivoire', code: 'CI'}, {name: 'Croatia', code: 'HR'}, {name: 'Cuba', code: 'CU'}, {name: 'Cyprus', code: 'CY'}, {name: 'Czech Republic', code: 'CZ'}, {name: 'Denmark', code: 'DK'}, {name: 'Djibouti', code: 'DJ'}, {name: 'Dominica', code: 'DM'}, {name: 'Dominican Republic', code: 'DO'}, {name: 'Ecuador', code: 'EC'}, {name: 'Egypt', code: 'EG'}, {name: 'El Salvador', code: 'SV'}, {name: 'Equatorial Guinea', code: 'GQ'}, {name: 'Eritrea', code: 'ER'}, {name: 'Estonia', code: 'EE'}, {name: 'Ethiopia', code: 'ET'}, {name: 'Falkland Islands (Malvinas)', code: 'FK'}, {name: 'Faroe Islands', code: 'FO'}, {name: 'Fiji', code: 'FJ'}, {name: 'Finland', code: 'FI'}, {name: 'France', code: 'FR'}, {name: 'French Guiana', code: 'GF'}, {name: 'French Polynesia', code: 'PF'}, {name: 'French Southern Territories', code: 'TF'}, {name: 'Gabon', code: 'GA'}, {name: 'Gambia', code: 'GM'}, {name: 'Georgia', code: 'GE'}, {name: 'Germany', code: 'DE'}, {name: 'Ghana', code: 'GH'}, {name: 'Gibraltar', code: 'GI'}, {name: 'Greece', code: 'GR'}, {name: 'Greenland', code: 'GL'}, {name: 'Grenada', code: 'GD'}, {name: 'Guadeloupe', code: 'GP'}, {name: 'Guam', code: 'GU'}, {name: 'Guatemala', code: 'GT'}, {name: 'Guernsey', code: 'GG'}, {name: 'Guinea', code: 'GN'}, {name: 'Guinea-Bissau', code: 'GW'}, {name: 'Guyana', code: 'GY'}, {name: 'Haiti', code: 'HT'}, {name: 'Heard Island and Mcdonald Islands', code: 'HM'}, {name: 'Holy See (Vatican City State)', code: 'VA'}, {name: 'Honduras', code: 'HN'}, {name: 'Hong Kong', code: 'HK'}, {name: 'Hungary', code: 'HU'}, {name: 'Iceland', code: 'IS'}, {name: 'India', code: 'IN'}, {name: 'Indonesia', code: 'ID'}, {name: 'Iran, Islamic Republic Of', code: 'IR'}, {name: 'Iraq', code: 'IQ'}, {name: 'Ireland', code: 'IE'}, {name: 'Isle of Man', code: 'IM'}, {name: 'Israel', code: 'IL'}, {name: 'Italy', code: 'IT'}, {name: 'Jamaica', code: 'JM'}, {name: 'Japan', code: 'JP'}, {name: 'Jersey', code: 'JE'}, {name: 'Jordan', code: 'JO'}, {name: 'Kazakhstan', code: 'KZ'}, {name: 'Kenya', code: 'KE'}, {name: 'Kiribati', code: 'KI'}, {name: 'Korea, Democratic People\'S Republic of', code: 'KP'}, {name: 'Korea, Republic of', code: 'KR'}, {name: 'Kuwait', code: 'KW'}, {name: 'Kyrgyzstan', code: 'KG'}, {name: 'Lao People\'S Democratic Republic', code: 'LA'}, {name: 'Latvia', code: 'LV'}, {name: 'Lebanon', code: 'LB'}, {name: 'Lesotho', code: 'LS'}, {name: 'Liberia', code: 'LR'}, {name: 'Libyan Arab Jamahiriya', code: 'LY'}, {name: 'Liechtenstein', code: 'LI'}, {name: 'Lithuania', code: 'LT'}, {name: 'Luxembourg', code: 'LU'}, {name: 'Macao', code: 'MO'}, {name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK'}, {name: 'Madagascar', code: 'MG'}, {name: 'Malawi', code: 'MW'}, {name: 'Malaysia', code: 'MY'}, {name: 'Maldives', code: 'MV'}, {name: 'Mali', code: 'ML'}, {name: 'Malta', code: 'MT'}, {name: 'Marshall Islands', code: 'MH'}, {name: 'Martinique', code: 'MQ'}, {name: 'Mauritania', code: 'MR'}, {name: 'Mauritius', code: 'MU'}, {name: 'Mayotte', code: 'YT'}, {name: 'Mexico', code: 'MX'}, {name: 'Micronesia, Federated States of', code: 'FM'}, {name: 'Moldova, Republic of', code: 'MD'}, {name: 'Monaco', code: 'MC'}, {name: 'Mongolia', code: 'MN'}, {name: 'Montserrat', code: 'MS'}, {name: 'Morocco', code: 'MA'}, {name: 'Mozambique', code: 'MZ'}, {name: 'Myanmar', code: 'MM'}, {name: 'Namibia', code: 'NA'}, {name: 'Nauru', code: 'NR'}, {name: 'Nepal', code: 'NP'}, {name: 'Netherlands', code: 'NL'}, {name: 'Netherlands Antilles', code: 'AN'}, {name: 'New Caledonia', code: 'NC'}, {name: 'New Zealand', code: 'NZ'}, {name: 'Nicaragua', code: 'NI'}, {name: 'Niger', code: 'NE'}, {name: 'Nigeria', code: 'NG'}, {name: 'Niue', code: 'NU'}, {name: 'Norfolk Island', code: 'NF'}, {name: 'Northern Mariana Islands', code: 'MP'}, {name: 'Norway', code: 'NO'}, {name: 'Oman', code: 'OM'}, {name: 'Pakistan', code: 'PK'}, {name: 'Palau', code: 'PW'}, {name: 'Palestinian Territory, Occupied', code: 'PS'}, {name: 'Panama', code: 'PA'}, {name: 'Papua New Guinea', code: 'PG'}, {name: 'Paraguay', code: 'PY'}, {name: 'Peru', code: 'PE'}, {name: 'Philippines', code: 'PH'}, {name: 'Pitcairn', code: 'PN'}, {name: 'Poland', code: 'PL'}, {name: 'Portugal', code: 'PT'}, {name: 'Puerto Rico', code: 'PR'}, {name: 'Qatar', code: 'QA'}, {name: 'Reunion', code: 'RE'}, {name: 'Romania', code: 'RO'}, {name: 'Russian Federation', code: 'RU'}, {name: 'RWANDA', code: 'RW'}, {name: 'Saint Helena', code: 'SH'}, {name: 'Saint Kitts and Nevis', code: 'KN'}, {name: 'Saint Lucia', code: 'LC'}, {name: 'Saint Pierre and Miquelon', code: 'PM'}, {name: 'Saint Vincent and the Grenadines', code: 'VC'}, {name: 'Samoa', code: 'WS'}, {name: 'San Marino', code: 'SM'}, {name: 'Sao Tome and Principe', code: 'ST'}, {name: 'Saudi Arabia', code: 'SA'}, {name: 'Senegal', code: 'SN'}, {name: 'Serbia and Montenegro', code: 'CS'}, {name: 'Seychelles', code: 'SC'}, {name: 'Sierra Leone', code: 'SL'}, {name: 'Singapore', code: 'SG'}, {name: 'Slovakia', code: 'SK'}, {name: 'Slovenia', code: 'SI'}, {name: 'Solomon Islands', code: 'SB'}, {name: 'Somalia', code: 'SO'}, {name: 'South Africa', code: 'ZA'}, {name: 'South Georgia and the South Sandwich Islands', code: 'GS'}, {name: 'Spain', code: 'ES'}, {name: 'Sri Lanka', code: 'LK'}, {name: 'Sudan', code: 'SD'}, {name: 'Suriname', code: 'SR'}, {name: 'Svalbard and Jan Mayen', code: 'SJ'}, {name: 'Swaziland', code: 'SZ'}, {name: 'Sweden', code: 'SE'}, {name: 'Switzerland', code: 'CH'}, {name: 'Syrian Arab Republic', code: 'SY'}, {name: 'Taiwan, Province of China', code: 'TW'}, {name: 'Tajikistan', code: 'TJ'}, {name: 'Tanzania, United Republic of', code: 'TZ'}, {name: 'Thailand', code: 'TH'}, {name: 'Timor-Leste', code: 'TL'}, {name: 'Togo', code: 'TG'}, {name: 'Tokelau', code: 'TK'}, {name: 'Tonga', code: 'TO'}, {name: 'Trinidad and Tobago', code: 'TT'}, {name: 'Tunisia', code: 'TN'}, {name: 'Turkey', code: 'TR'}, {name: 'Turkmenistan', code: 'TM'}, {name: 'Turks and Caicos Islands', code: 'TC'}, {name: 'Tuvalu', code: 'TV'}, {name: 'Uganda', code: 'UG'}, {name: 'Ukraine', code: 'UA'}, {name: 'United Arab Emirates', code: 'AE'}, {name: 'United Kingdom', code: 'GB'}, {name: 'United States', code: 'US'}, {name: 'United States Minor Outlying Islands', code: 'UM'}, {name: 'Uruguay', code: 'UY'}, {name: 'Uzbekistan', code: 'UZ'}, {name: 'Vanuatu', code: 'VU'}, {name: 'Venezuela', code: 'VE'}, {name: 'Viet Nam', code: 'VN'}, {name: 'Virgin Islands, British', code: 'VG'}, {name: 'Virgin Islands, U.S.', code: 'VI'}, {name: 'Wallis and Futuna', code: 'WF'}, {name: 'Western Sahara', code: 'EH'}, {name: 'Yemen', code: 'YE'}, {name: 'Zambia', code: 'ZM'}, {name: 'Zimbabwe', code: 'ZW'} ];

module.exports = {
  parseArguments: async function(client, guild, conf, channel, user, raw, req, print = true) {
    const l = conf.language;
    let finished = {};
    let rawlist = [[]];
    for (let i = 0; i < raw.length;) {
        raw[i] = raw[i].trim();
        if (raw[i] == "") raw.splice(i, 1);
        else {
            let nextraw = raw[i++];
            if (nextraw == "|") rawlist.push([]);
            else rawlist[rawlist.length-1].push(nextraw);
        }
    }
    req.sort(function(a, b) {return Object.keys(types).indexOf(a.type) - Object.keys(types).indexOf(b.type);});
    for (let i = 0; i < req.length; i++) { // FOR EVERY ARGUMENT
        let curreq = req[i];
        let found = false;
        let foundCollection = [];
        let discaredCollection = [];
        let argsLeft = req.length - i;
        if ((argsLeft == 1 && curreq.multiple) || (argsLeft == 2 && (curreq.multiple || req[i+1].multiple))) argsLeft = 3;
        for (let j = 0; j < rawlist.length; j++) { // FOR EVERY ARGS FRAGMENT
            let rawnow = rawlist[j];
            let k;
            let l;
            let result;
            for (k = 0; k < rawnow.length; k++) {
                if (k != 0 && (argsLeft == 1 || (argsLeft == 2 && rawlist.length > 1))) break;
                for (l = rawnow.length - k; l > 0; l--) {
                    if (l != rawnow.length - k && (argsLeft == 1 || ((argsLeft == 2) && (k > 0 || rawlist.length > 1)))) break;
                    let pass = rawnow.slice(k, k+l).join(" ");
                    if (discaredCollection.includes(pass)) continue;
                    result = await get(client, conf, guild, channel, user, curreq.type, pass, l);
                    if (result != undefined && result != null) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) {
                if (k == 0 && l == rawnow.length) rawlist.splice(j, 1);
                else if (k == 0) rawlist[j] = rawlist[j].slice(k+l, rawlist[j].length);
                else if (k + l == rawlist[j].length) rawlist[j] = rawlist[j].slice(0, k);
                else {
                    rawlist.splice(j+1, 0, rawlist[j].slice(k+l, rawlist[j].length));
                    rawlist[j] = rawlist[j].slice(0, k);
                }
                if (curreq.multiple) {
                    foundCollection.push(result);
                    j = -1;
                    found = false;
                } else {
                    finished[curreq.type] = result;
                    break;
                }
            }
        }
        if (curreq.multiple) {
            if (foundCollection.length == 0 && !curreq.optional) {
                if (print) embeds.sendSimpleEmbed(loc("err.err",l), loc("err.missingArgument",l,[loc(`cmds.args.${[curreq.type]}`,l).name]), conf.colors.failure, channel, conf.autodelete, conf.timeouts.autodelete);
                return null;
            }
            let min = 0;
            if (curreq.min) min = curreq.min;
            if (foundCollection.length < min) {
                if (print) embeds.sendSimpleEmbed(loc("err.err",l), loc("err.multArgsTooFew",l,[loc(`cmds.args.${[curreq.type]}`,l).name]), conf.colors.failure, channel, conf.autodelete, conf.timeouts.autodelete);
                return null;
            }
            if (curreq.max && foundCollection.length > curreq.max) {
                if (print) embeds.sendSimpleEmbed(loc("err.err",l), loc("err.multArgsTooMany",l,[loc(`cmds.args.${[curreq.type]}`,l).name]), conf.colors.failure, channel, conf.autodelete, conf.timeouts.autodelete);
                return null;
            }
            finished[curreq.type] = foundCollection;
        } else if (!found && !curreq.optional) {
            if (print) embeds.sendSimpleEmbed(loc("err.err",l), loc("err.missingArgument",l,[loc(`cmds.args.${[curreq.type]}`,l).name]), conf.colors.failure, channel, conf.autodelete, conf.timeouts.autodelete);
            return null;
        }
    }
    return finished;
  },
  getSorted: function(req) {
      return req.sort(function(a, b) {return Object.keys(types).indexOf(a.type) - Object.keys(types).indexOf(b.type);});
  },
  getData: function(req, l) {
    return loc(`cmds.args.${req}`,l);
  }
};

async function get(client, conf, guild, channel, user, type, pass, l) {
    if (types[type] != -1 && l > types[type]) return null;
    if (type == "user") return await queries.user(guild, conf, channel, user, pass);
    if (type == "role") return await queries.role(guild, conf, channel, user, pass);
    if (type == "channel") return await queries.channel(guild, conf, channel, user, pass);
    if (type == "cmd") return client.commands[pass] ? pass : null;
    if (type == "dbkey") return conf.hasOwnProperty(pass.split(".")[0]) ? pass : null;
    if (type == "country") {
        let words = pass.split(" ");
        for (let i = 0; i < words.length; i++) words[i] = words[i].toUpperCase().substring(0, 1) + words[i].toLowerCase().substring(1)
        pass = words.join(" ");
        let found = false;
        for (let i = 0; i < countries.length; i++) {
            if (countries[i].name == pass) {
                found = true;
                break;
            }
        }
        return found ? pass : null;
    }
    if (type == "language") return getLangs().includes(pass) ? pass : null;
    if (type == "count") {
        const num = Number(pass);
        return (!isNaN(num) && num > 0 && num % 1 == 0) ? num : null;
    }
    if (type == "duration") {
        const dur = ms(pass);
        return isNaN(dur) ? null : dur;
    }
    if (type == "json") {
        try {return JSON.parse(pass)} catch (e) {return null;}
    }
    if (type == "color") {
        pass = pass.toLowerCase();
        if (pass.startsWith("0x")) pass = "#" + pass.substring(2);
        return RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$').test(pass) ? pass : null;
    }
    return pass;
}