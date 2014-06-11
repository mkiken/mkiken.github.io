/* global alert */
"use strict";

//キャンバスのサイズ
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 600;

//落ちてくる画像のサイズ
var IMG_WIDTH = 100;
var IMG_HEIGHT = 20;

//ポイントの基準になる線のキャンバス内の下からのマージン
var BORDER_BOTTOM_MARGIN = 100;

//基準線からどれだけ離れていても許容するか
var DIFF_PERFECT = 5;
var DIFF_GOOD = 10;

var imgs = [];
var posY = [];

var IMG_PATH = ["dorothy.png", "alice.png", "tinkerbell.png"];
var MARGIN_LEFT = [100, 250, 400];
var key2Idx = {'Z': 0, 'X': 1, 'C': 2};
var speedY = [];

var canvasOffset;
var borderLine;

var $status, $point, $maxCombo, $nowCombo, $maxPush, $maxPoint, $time, $main, $field;


var rapidRate = 15;
var minSpeed = 10;

var sumPoint = 0;

var badPenalty = -25;

var maxCombo = 0;
var nowCombo = 0;
var maxPush = 0;
var maxPoint = 0;

var $stDisplay = [];
var stNum = [0, 0, 0, 0];
var st2Str = ["PERFECT", "GOOD", "BAD", "MISS"];
var st2Class = ["perfect", "good", "bad", "miss"];

var timer_genObj, timer_img_move;

var gametime = 30000;

function initGlobalVar() {
  sumPoint = 0;
  // maxCombo = 0;
  nowCombo = 0;
  // maxPush = 0;
  // maxPoint = 0;
  for (var i = 0; i < stNum.length; i++) {
    stNum[i] = 0;
  }
  imgs = [];
  posY = [];
  speedY = [];
}

// 初期化
(function ($, window) {
  // console.log($);
  $field = $('canvas#field');
  $field[0].width = CANVAS_WIDTH;
  $field[0].height = CANVAS_HEIGHT;
  //こっちではresizeになるので駄目
  // field.width(CANVAS_WIDTH);
  // field.height(CANVAS_HEIGHT);

  var sp = $('div#space');
  sp.width(CANVAS_WIDTH);
  sp.height(CANVAS_HEIGHT);
  // sp.css({position: 'absolute'});

  canvasOffset = $field.offset();
  // console.log(canvasOffset);
  borderLine = canvasOffset.top + CANVAS_HEIGHT - BORDER_BOTTOM_MARGIN;

  $status = $('p#status');
  $point = $('span#point');
  $maxCombo = $('span#maxCombo');
  $nowCombo = $('span#nowCombo');
  $maxPoint = $('span#maxPoint');
  $maxPush = $('span#maxPush');
  $stDisplay.push($('span#stPerfect'));
  $stDisplay.push($('span#stGood'));
  $stDisplay.push($('span#stBad'));
  $stDisplay.push($('span#stMiss'));
  $time = $('#time');
  $main = $('#main');

  window.addEventListener('keydown', initialKeyEvent);

  $main.addClass('out');
  initCanvas();

}(window.jQuery, window));

function drawGameCanvas() {
  var ctx = $field[0].getContext('2d');
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (var i = 0; i < MARGIN_LEFT.length; i++) {
    ctx.fillStyle = "rgb(" +
                         Math.floor(Math.random() * 255) + ", " +
                         Math.floor(Math.random() * 255) + ", " +
                         Math.floor(Math.random() * 255) + ")";
    ctx.fillRect(MARGIN_LEFT[i], 0, IMG_WIDTH, borderLine);
  }
  ctx.beginPath();
  //追加部分
  ctx.lineWidth = 5;
  // ctx.strokeStyle = '#0000FF';
  ctx.strokeStyle = 'yellow';

  ctx.moveTo(0, CANVAS_HEIGHT - BORDER_BOTTOM_MARGIN);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - BORDER_BOTTOM_MARGIN);
  ctx.closePath();
  ctx.stroke();
}
function initialKeyEvent(e) {
  var code = e.keyCode;
  // var key = String.fromCharCode(code);
  // console.log('key is ', key, code);
  if (code === 13) { //enter
    console.log('game start!');
    game();
  }
}

function startTimer() {
  var _time = gametime;
  setInterval(function () {
    if (0 < _time) {
      _time -= 1000;
      $time.text(_time / 1000);
    }
  }, 1000);
}

function initCanvas() {
  var ctx = $field[0].getContext('2d');
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.font = "40pt 'Arial'";
  ctx.fillStyle = "white";
  ctx.strokeStyle = "blue";
  ctx.textAlign = "center";
  ctx.fillText("Press Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

function resetParameterDisplay() {
  $point.text(0);
  $nowCombo.text(0);
  for (var i = 0; i < $stDisplay.length; i++) {
    $stDisplay[i].text(0);
  }

}


function game() {
  initGlobalVar();
  drawGameCanvas();
  $main.removeClass('out');
  $main.addClass('in');
  resetParameterDisplay();

  for (var i = 0; i < IMG_PATH.length; i++) {
    imgs.push([]);
    posY.push([]);
    // delayGenerate(Math.random());
    //落ちてくるスピードを設定
    speedY.push(Math.random() * rapidRate + minSpeed);
  }

  $(window).keydown(keydownfunc);
  //画像移動処理タイマー
  timer_img_move = setInterval(function () {
  // $('img').stop().animate({top:'+=' + '10' + 'px'},100);
  // $('img').translate(0, 10);
    for (var i = 0; i < IMG_PATH.length; i++) {
      for (var j = imgs[i].length - 1; j >= 0; j--) {
        posY[i][j] += speedY[i];
        if (posY[i][j] > canvasOffset.top + CANVAS_HEIGHT) {
          if (imgs[i][j].is(':hidden') === false) {
            imgs[i][j].hide();
            reflectPushResult(3, badPenalty, false);
          }
          imgs[i].pop();
          posY[i].pop();
        } else {
          // console.log('pos', i, j,  posY[i][j])
          imgs[i][j].css({top: posY[i][j], position: 'absolute'});
          // imgs[i][j].css({top: posY[i][j], position:'absolute'});

        }
      }
    }
  }, 30);

  //新オブジェクト生成タイマー
  timer_genObj = setInterval(function () {
    for (var i = 0; i < IMG_PATH.length; i++) {
      if (Math.random() > 0.9) {
        genarateNewObj(i);
      }
    }
  }, 500);
  //ちょっと遅延させて無理矢理初期化
  setTimeout(gameEnd, gametime + 200);
  startTimer();
}

function gameEnd() {
  clearInterval(timer_genObj);
  clearInterval(timer_img_move);
  $main.removeClass('in');
  $main.addClass('out');
  initCanvas();
  alert("your score is " + sumPoint + ".");
  $('#space img').remove();
}

function reflectPushResult(status, pts, isSuccess) {
  $status.text(st2Str[status] + "( " + pts + " pts)");
  $status.removeClass();
  $status.addClass(st2Class[status]);
  sumPoint += pts;
  if (isSuccess) {
    nowCombo++;
    if (pts > maxPush) {
      maxPush = pts;
      $maxPush.text(maxPush);
    }
    maxCombo = Math.max(maxCombo, nowCombo);
    $maxCombo.text(maxCombo);
    if (sumPoint > maxPoint) {
      maxPoint = sumPoint;
      $maxPoint.text(maxPoint);
    }
  } else {
    nowCombo = 0;
  }

  stNum[status]++;
  $stDisplay[status].text(stNum[status]);

  $point.text(sumPoint);

  $nowCombo.text(nowCombo);
  $point.text(sumPoint);

}


function genarateNewObj(n) {
  // console.log('path = ', IMG_PATH);
  var img = $('<img src="images/' + IMG_PATH[n] + '" width="' + IMG_WIDTH + '" height="' + IMG_HEIGHT + '" />');
  // console.log(img);
  img.appendTo($('#space'));
  // $('img').css({top:10, left: 100, position:'absolute'});
  img.css({top: canvasOffset.top, left: canvasOffset.left + MARGIN_LEFT[n], position: 'absolute'});
  // img.css({top:-CANVAS_HEIGHT, left: -CANVAS_WIDTH + MARGIN_LEFT[n]});

  // console.log('before unshift', imgs[n], imgs);
  imgs[n].unshift(img);
  posY[n].unshift(canvasOffset.top);

}

function keydownfunc(event) {
  var code = event.keyCode;
  var key = String.fromCharCode(code);
  // console.log("pressed, ", String.fromCharCode(code));
  var idx = key2Idx[key];
  // console.log('idx = ', idx);
  if (idx !== undefined) {
    // console.log(code, key, idx);
    for (var i = posY[idx].length - 1; 0 <= i; i--) {
      var y = posY[idx][i];
      var pts = Math.max(Math.round((DIFF_GOOD - Math.abs(borderLine - IMG_HEIGHT / 2 - posY[idx][i])) * speedY[i]), 0);

      if (y < borderLine - 100) {
        break;
      } else if (borderLine - IMG_HEIGHT / 2 - DIFF_PERFECT <= y && y <= borderLine - IMG_HEIGHT / 2 + DIFF_PERFECT) {
        imgs[idx][i].hide();
        reflectPushResult(0, pts * 3, true);
        break;
      } else if (borderLine - IMG_HEIGHT / 2 - DIFF_GOOD <= y && y <= borderLine - IMG_HEIGHT / 2 + DIFF_GOOD) {
        imgs[idx][i].hide();
        reflectPushResult(1, pts, true);
        break;
      } else {
        reflectPushResult(2, badPenalty, false);
        break;
      }
    }
  }
}
