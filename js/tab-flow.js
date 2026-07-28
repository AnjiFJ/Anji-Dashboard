/* =========================================================
 * tab-flow.js — 上线流量：信息栏 + 大件/小件切换 + 汇总卡片 + 图表/明细
 * ========================================================= */
var flowGroup = "big";

function renderFlow(){
  Promise.all([dataLoader.loadMetaData(), dataLoader.loadFlowData()]).then(function(rs){
    var META = rs[0], data = rs[1];
    if(!data) return;
    document.getElementById("flowLoading").style.display="none";
    document.getElementById("flowBody").style.display="block";
    document.getElementById("flowInfo").innerHTML =
      "<span>数据日期：<b>"+META.dateRange+"</b></span>"+
      "<span>生产节拍：<b>"+META.takt+"</b></span>"+
      "<span>数据更新：<b>"+META.updated+"</b></span>";
    if(document.getElementById("flowTableBig").dataset.done){ updateFlowView(data); return; }
    document.getElementById("flowTableBig").dataset.done = "1";

    function buildTable(el, rows){
      var html = "<thead><tr><th>线路</th>";
      data.shifts.forEach(function(s){ html += "<th>"+s+" 流量</th><th>"+s+" 饱和度</th>"; });
      html += "</tr></thead><tbody>";
      rows.forEach(function(r){
        html += "<tr><td><b>"+escapeHtml(r.line)+"</b></td>";
        r.data.forEach(function(d){
          var pct = Math.round(d.sat*100)+"%";
          var cls = d.sat>=0.9?"r":(d.sat>=0.7?"y":"g");
          html += "<td>"+d.flow+"</td><td><span class='tag "+cls+"'>"+pct+"</span></td>";
        });
        html += "</tr>";
      });
      el.innerHTML = html + "</tbody>";
    }
    buildTable(document.getElementById("flowTableBig"), data.big);
    buildTable(document.getElementById("flowTableSmall"), data.small);

    // 大件/小件 切换
    document.getElementById("flowPill").addEventListener("click", function(e){
      var pill = e.target.closest(".pill");
      if(!pill) return;
      flowGroup = pill.dataset.group;
      var pills = this.querySelectorAll(".pill");
      for(var i=0;i<pills.length;i++) pills[i].classList.toggle("active", pills[i]===pill);
      updateFlowView(data);
    });
    updateFlowView(data);
  });
}

// 汇总卡片 + 饱和度图 + 明细显隐（随大件/小件切换）
function updateFlowView(data){
  var rows = flowGroup==="big" ? data.big : data.small;
  document.getElementById("flowBigSec").style.display   = flowGroup==="big"   ? "block":"none";
  document.getElementById("flowSmallSec").style.display = flowGroup==="small" ? "block":"none";

  var total=0, high=0, severe=0;
  rows.forEach(function(r){ r.data.forEach(function(d){
    total++;
    if(d.sat>=0.95) severe++;
    else if(d.sat>=0.85) high++;
  });});
  var cards = [
    {label:"线路班次总数", val:total,  color:"#3b82f6"},
    {label:"高饱和 (>85%)", val:high,   color:"#fbbf24"},
    {label:"严重饱和 (>95%)", val:severe, color:"#f87171"}
  ];
  document.getElementById("flowCards").innerHTML = cards.map(function(c){
    return "<div class='stat-card' style='--accent:"+c.color+"'>"+
      "<div class='label'>"+c.label+"</div>"+
      "<div class='value'>"+c.val+"</div>"+
      "<div class='unit'>"+(flowGroup==="big"?"大件线路":"小件线路")+"</div></div>";
  }).join("");

  var lastIdx = data.shifts.length-1;
  document.getElementById("flowShiftLabel").textContent =
    "班次：" + data.shifts[lastIdx] + " · " + (flowGroup==="big"?"大件":"小件");

  destroyChart("flow");
  allCharts["flow"] = new Chart(document.getElementById("flowChart"), {
    type:"bar",
    data:{
      labels: rows.map(function(r){return r.line;}),
      datasets:[{
        label:"饱和度",
        data: rows.map(function(r){return Math.round(r.data[lastIdx].sat*1000)/10;}),
        backgroundColor: rows.map(function(r){return satColor(r.data[lastIdx].sat)+"cc";}),
        borderColor: rows.map(function(r){return satColor(r.data[lastIdx].sat);}),
        borderWidth:1, borderRadius:6, maxBarThickness:52
      },{
        label:"85% 高饱和线", type:"line",
        data: rows.map(function(){return 85;}),
        borderColor:"#fbbf24", borderDash:[6,5], borderWidth:1.5,
        pointRadius:0, fill:false
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{labels:{boxWidth:12}},
        tooltip:{callbacks:{label:function(c){return " "+c.dataset.label+"："+c.parsed.y+"%";}}}
      },
      scales:{
        y:{min:0, max:110, ticks:{callback:function(v){return v+"%";}},
           grid:{color:"rgba(90,140,255,.10)"}},
        x:{grid:{display:false}}
      }
    }
  });
}
