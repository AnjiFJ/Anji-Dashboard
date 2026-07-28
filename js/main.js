/* =========================================================
 * main.js — 时钟 & 启动入口
 * ========================================================= */
function pad2(n){ return ("0"+n).slice(-2); }
function tickClock(){
  var d = new Date();
  document.getElementById("clockTime").textContent =
    pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds());
  var week = ["日","一","二","三","四","五","六"][d.getDay()];
  document.getElementById("clockDate").textContent =
    d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())+" 周"+week;
}
setInterval(tickClock, 1000);
tickClock();

// 默认渲染总览 Tab
renderOverview();
