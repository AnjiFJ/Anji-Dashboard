/* =========================================================
 * tab-overview.js — 总览：先总体，点卡片进明细
 * ========================================================= */
function renderOverview(){
  Promise.all([
    dataLoader.loadMetaData(), dataLoader.loadFlowData(),
    dataLoader.loadDailyData(), dataLoader.loadDaokouData(),
    dataLoader.loadPeiliaoData()
  ]).then(function(rs){
    var META = rs[0], FLOW = rs[1], DAILY = rs[2], DAOKOU = rs[3], PEILIAO = rs[4];
    if(!META || !FLOW || !DAILY || !DAOKOU || !PEILIAO) return;

    document.getElementById("overviewInfo").innerHTML =
      "<span>数据日期：<b>"+META.dateRange+"</b></span>"+
      "<span>生产节拍：<b>"+META.takt+"</b></span>"+
      "<span>数据更新：<b>"+META.updated+"</b></span>";

    // 上线流量汇总
    var fTotal=0, fHigh=0, fSevere=0;
    FLOW.big.concat(FLOW.small).forEach(function(r){ r.data.forEach(function(d){
      fTotal++;
      if(d.sat>=0.95) fSevere++;
      else if(d.sat>=0.85) fHigh++;
    });});
    document.getElementById("ovFlowCards").innerHTML = [
      {label:"线路班次总数", val:fTotal, color:"#3b82f6", unit:FLOW.shifts[FLOW.shifts.length-1]+" 班次"},
      {label:"高饱和 (>85%)", val:fHigh, color:"#fbbf24", unit:"需关注"},
      {label:"严重饱和 (>95%)", val:fSevere, color:"#f87171", unit:"需立即处理"}
    ].map(ovCardHtml).join("");

    // 每日统计汇总
    var n = DAILY.shifts.length-1;
    document.getElementById("ovDailyCards").innerHTML = [
      {label:"到货箱数", val:DAILY.arrive[n].toLocaleString(), color:"#22d3ee", unit:"箱", extra:ovDelta(DAILY.arrive[n],DAILY.arrive[n-1])},
      {label:"上架箱数", val:DAILY.shelf[n].toLocaleString(),  color:"#3b82f6", unit:"箱", extra:ovDelta(DAILY.shelf[n],DAILY.shelf[n-1])},
      {label:"拣货箱数", val:DAILY.pick[n].toLocaleString(),   color:"#a78bfa", unit:"箱", extra:ovDelta(DAILY.pick[n],DAILY.pick[n-1])},
      {label:"出库箱数", val:DAILY.out[n].toLocaleString(),    color:"#34d399", unit:"箱", extra:ovDelta(DAILY.out[n],DAILY.out[n-1])}
    ].map(ovCardHtml).join("");

    // 道口汇总（当月）
    var mi = DAOKOU.months.length-1, sum=0, pass=0;
    DAOKOU.teams.forEach(function(t,ti){ sum+=DAOKOU.rates[ti][mi]; if(DAOKOU.rates[ti][mi]>=95) pass++; });
    var avg = (sum/DAOKOU.teams.length).toFixed(1);
    document.getElementById("ovDaokouCards").innerHTML = [
      {label:DAOKOU.months[mi]+" 平均及时率", val:avg+"%", color:avg>=95?"#34d399":"#fbbf24", unit:"合格线 95%"},
      {label:"合格班组", val:pass+" / "+DAOKOU.teams.length, color:"#34d399", unit:"及时率 ≥95%"}
    ].map(ovCardHtml).join("");

    // 配料汇总
    var pStations=0, pPeople=0, pPosts=0;
    PEILIAO.areas.forEach(function(a){
      pPeople += a.people;
      a.rows.forEach(function(r){ pStations++; pPosts += r.gongwei+r.sps+r.sort; });
    });
    document.getElementById("ovPeiliaoCards").innerHTML = [
      {label:"配料区", val:PEILIAO.areas.length, color:"#22d3ee", unit:"个"},
      {label:"覆盖工位", val:pStations, color:"#3b82f6", unit:"个"},
      {label:"岗位需求合计", val:pPosts, color:"#a78bfa", unit:"人/岗"},
      {label:"现有配料人数", val:pPeople, color:"#34d399", unit:"人"}
    ].map(ovCardHtml).join("");
  });
}

function ovCardHtml(c){
  return "<div class='stat-card' style='--accent:"+c.color+"'>"+
    "<div class='label'>"+c.label+"</div>"+
    "<div class='value'>"+c.val+"</div>"+
    (c.unit?"<div class='unit'>"+c.unit+"</div>":"")+
    (c.extra?c.extra:"")+"</div>";
}
function ovDelta(cur, prev){
  var x=(cur-prev)/prev*100;
  var cls=x>=0?"up":"down", arrow=x>=0?"▲":"▼";   // 中式习惯：升红降绿
  return "<div class='delta "+cls+"'>"+arrow+" "+Math.abs(x).toFixed(1)+"%</div>";
}

// 卡片点击跳转对应 Tab
document.querySelectorAll(".card-grid[data-goto]").forEach(function(grid){
  grid.addEventListener("click", function(){ switchMainTab(grid.dataset.goto); });
});
