const Discord = require("discord.js");
const Canvas = require('canvas');
const moment = require('moment-timezone');

const margin = 30;
const width = 640;
const height = 360;

const background = "#2f3136";
const blue = "#54a4b3";
const darkblue = "#325961";
const red = "#cf5b5b";
const darkred = "#753b3b";
const yellow = "#e8cf6b";
const darkyellow = "#baab70";
const green = "#6ad970";
const darkgreen = "#57965b";
const grey = "#949494";

module.exports = {
  timeGraph: function(data, startTime, endTime, betweenTime, maxNum = 100000000) {
    const canvas = Canvas.createCanvas(width + 2 * margin, height + 2 * margin);
    const ctx = canvas.getContext('2d');

    let difTime = endTime - startTime;

    let startMoment = moment.tz(startTime, "Europe/Warsaw");
    let startHour = Number(startMoment.format("H"));
    let startMinute = Number(startMoment.format("m"));

    let points = [];
    let pointscol = [];
    for (let i = startTime; i <= endTime; i+= betweenTime) {
      points.push(0);
      pointscol.push([blue, darkblue]);
    }
    
    let currentTime = data[0][0];
    let dataIndex = 0;
    let total = 0;
    let lastMax = 0;
    let latest = "";
    let lastcol = "";
    let largest = 0;
    
    let ongoingoffline = false;

    // parse data
    let currentPiece = 0;
    if (currentTime >= startTime) currentPiece = Math.ceil((currentTime - startTime) / betweenTime);
    while (dataIndex < data.length && startTime + currentPiece * betweenTime <= endTime) {
      let localMax = total;
      while (dataIndex < data.length && data[dataIndex][0] <= startTime + currentPiece * betweenTime) {
        latest = data[dataIndex++][1];
        if (currentPiece == 0 && latest == "message") continue;
        if (latest == "offline" || latest == false) total--;
        else total++;
        if (total > maxNum) total = maxNum;
        if (total > localMax) localMax = total;
      }
      lastcol = [blue, darkblue]
      if (latest == "online") lastcol = [green, darkgreen];
      else if (latest == "idle") lastcol = [yellow, darkyellow];
      else if (latest == "dnd") lastcol = [red, darkred];
      else if (latest == "offline" && (localMax != 0 || lastMax != 0)) lastcol = pointscol[Math.max(currentPiece-1,0)];
      pointscol[currentPiece] = lastcol;
      points[currentPiece++] = localMax;
      if (localMax > largest) largest = localMax;
      if (latest == "message") total = 0;
      lastMax = localMax;
    }
    while (startTime + currentPiece * betweenTime <= endTime) {
      pointscol[currentPiece] = lastcol;
      points[currentPiece++] = total;
    }

    // points top

    let top = 0;
    let topindex = 0;
    //let tops = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5]; 
    let tops = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 7.5, 8, 9]; 
    let toppieces = {
      1:4, 
      1.5:3, 
      2:4, 
      2.5:5, 
      3:3, 
      3.5:5, 
      4:4, 
      4.5:3, 
      5:5, 
      5.5:5, 
      6:4, 
      6.5:5, 
      7:4,
      7.5:5,
      8:4,
      8.5:5,
      9:3,
      9.5:5
    };
    let dec = 0;
    while(largest > top || top % 1 != 0) {
      if (topindex >= tops.length) {
        topindex = 0;
        dec++;
      }
      top = tops[topindex++] * Math.pow(10, dec);
    }
    topindex--;

    // points shade
    let smallPiece = width / (difTime / betweenTime);
    let bottomY = height + margin;
    let lastX = margin;
    let lastY = bottomY;
    let bottomOnly = true;
    ctx.beginPath();
    ctx.moveTo(lastX, bottomY);
    for (let i = 0; i < points.length; i++) {
      let currentX = margin + smallPiece * i;
      let currentY = height + margin - height * points[i] / top
      if (i > 0 && (pointscol[i][1] != pointscol[i-1][1] || currentY == bottomY)) {
        ctx.fillStyle = pointscol[i-1][1];
        ctx.lineTo(lastX, bottomY);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(lastX, bottomY);
        ctx.lineTo(lastX, lastY);
        bottomOnly = lastY == bottomY;
      }
      ctx.lineTo(currentX, currentY);
      if (bottomOnly && currentY != bottomY) bottomOnly = false;
      lastX = currentX;
      lastY = currentY;
    }
    ctx.lineTo(lastX, bottomY);
    ctx.fillStyle = pointscol[pointscol.length-1][1];
    ctx.closePath();
    ctx.fill();
    
    // points line
    ctx.lineWidth = 2;
    lastX = margin;
    lastY = bottomY;
    bottomOnly = true;
    ctx.beginPath();
    ctx.moveTo(lastX, bottomY);
    for (let i = 0; i < points.length; i++) {
      let currentX = margin + smallPiece * i;
      let currentY = height + margin - height * points[i] / top
      if (i > 0 && (pointscol[i][0] != pointscol[i-1][0] || currentY == bottomY)) {
        ctx.strokeStyle = pointscol[i-1][0];
        if (!bottomOnly && i > 2) ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        bottomOnly = lastY == bottomY;
      }
      ctx.lineTo(currentX, currentY);
      if (bottomOnly && currentY != bottomY) bottomOnly = false;
      lastX = currentX;
      lastY = currentY;
    }
    ctx.strokeStyle = pointscol[pointscol.length-1][0];
    ctx.stroke();

    // axes
    ctx.strokeStyle = grey;
    ctx.lineWidth = 1;
    ctx.fillStyle = grey;
    ctx.textAlign = "center";
    ctx.beginPath();
    ctx.moveTo(width + margin, height + margin);
    ctx.lineTo(margin, height + margin);
    ctx.lineTo(margin, margin);

    // axes x desc
    let hourstotal = difTime / 3600000;
    let piece = width / hourstotal;
    let offset = piece / 60 * startMinute;
    let i = 0;
    if (offset != 0) i = 1;
    let halves = false;
    let halvesoffset = 0;
    let reps = Math.ceil(hourstotal);
    if (hourstotal <= 2) {
      reps *= 2;
      piece /= 2;
      halves = true;
      halvesoffset = startMinute <= 30 ? 0 : 1;
      if (startMinute >= 30) startMinute -= 30;
      offset = piece / 30 * startMinute;
    }
    for (; i <= reps; i++) {
      let x = margin + piece * i - offset;
      if (x > margin + width) continue;
      ctx.moveTo(x, height + margin - 5);
      ctx.lineTo(x, height + margin + 5);
      ctx.font = "13px sans-serif"
      let hour;
      if (halves) {
        hour = startHour + Math.floor((i + halvesoffset) / 2);
        if (hour > 24) hour -= 24;
        if (hour == 0) hour = 24;
        if ((i + halvesoffset) % 2 != 0) hour += ":30";
        else hour += ":00";
      }
      else {
        hour = startHour + i;
        if (hour > 24) hour -= 24;
        if (hour == 0) hour = 24;
      }
      ctx.fillText(hour, x, height + margin + 20);
    }

    // axes y desc
    let pieces = toppieces[tops[topindex]];
    piece = height / pieces;
    ctx.textAlign = "right";
    for (i = 1; i <= pieces; i++) {
      if (top / pieces * i % 1 != 0) continue;
      let y = height + margin - piece * i;
      ctx.moveTo(margin - 5, y);
      ctx.lineTo(margin + 5, y);
      ctx.font = "13px sans-serif"
      ctx.fillText(top / pieces * i, margin - 7, y + 4);
    }

    ctx.stroke();

    //ctx.fillStyle = "green";
    //ctx.fillRect(0, 0, width, height);

    return new Discord.MessageAttachment(canvas.toBuffer(), "graph.png");
  }
};