/* =========================================================
 * tab-daily.js — 每日数据统计：卡片 + 折线 + 明细表
 * ========================================================= */
function renderDaily(){
  dataLoader.loadDailyData().then(function(data){
    if(!data) return;
    document.getElementById("dailyLoading").style.display="none";
    document.getElementById("dailyBody").style.display="block";
    if(document.getElementById("dailyCards").dataset.done) return;
    document.getElementById("dailyCards").dataset.done = "1";

    var n = data.shifts.length-1;
    document.getElementById("dailyShiftLabel").textContent = "最新班次：" + data.shifts[n];

    function delta(cur, prev){
      var d = ((cur-prev)/prev*100);
      var cls = d>=0 ? "up" : "down";           // 中式习惯：升红降绿
      var arrow = d>=0 ? "▲" : "▼";
      return "<div class='delta "+cls+"'>"+arrow+" "+Math.abs(d).toFixed(1)+"% vs 上一班次</div>";
    }
    var cards = [
      {label:"到货箱数", val:data.arrive[n], prev:data.arrive[n-1], color:"#22d3ee"},
      {label:"上架箱数", val:data.shelf[n],  prev:data.shelf[n-1],  color:"#3b82f6"},
      {label:"拣货箱数", val:data.pick[n],   prev:data.pick[n-1],   color:"#a78bfa"},
      {label:"出库箱数", val:data.out[n],    prev:data.out[n-1],    color:"#34d399"}
    ];
    document.getElementById("dailyCards").innerHTML = cards.map(function(c){
      return "<div class='stat-card' style='--accent:"+c.color+"'>"+
        "<div class='label'>"+c.label+"</div>"+
        "<div class='value'>"+c.val.toLocaleString()+"</div>"+
        "<div class='unit'>箱</div>"+ delta(c.val, c.prev) +"</div>";
    }).join("");

    // 折线图（时间正序）
    destroyChart("daily");
    allCharts["daily"] = new Chart(document.getElementById("dailyChart"), {
      type:"line",
      data:{
        labels:data.shifts,
        datasets:[
          {label:"到货", data:data.arrive, borderColor:"#22d3ee", backgroundColor:"#22d3ee", tension:.3, pointRadius:3},
          {label:"上架", data:data.shelf,  borderColor:"#3b82f6", backgroundColor:"#3b82f6", tension:.3, pointRadius:3},
          {label:"拣货", data:data.pick,   borderColor:"#a78bfa", backgroundColor:"#a78bfa", tension:.3, pointRadius:3},
          {label:"出库", data:data.out,    borderColor:"#34d399", backgroundColor:"#34d399", tension:.3, pointRadius:3}
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        interaction:{mode:"index", intersect:false},
        plugins:{legend:{labels:{boxWidth:12}}},
        scales:{y:{grid:{color:"rgba(90,140,255,.10)"}}, x:{grid:{display:false}}}
      }
    });

    // 明细表（倒序，最近班次在前）
    var html = "<thead><tr><th>指标</th>";
    data.tableShifts.forEach(function(s){ html += "<th>"+s+"</th>"; });
    html += "</tr></thead><tbody>";
    data.table.forEach(function(row){
      html += "<tr><td><b>"+escapeHtml(row.name)+"</b></td>";
      row.vals.forEach(function(v){ html += "<td>"+escapeHtml(v)+"</td>"; });
      html += "</tr>";
    });
    var boxRows = [["到货箱数",data.arrive],["上架箱数",data.shelf],["拣货箱数",data.pick],["出库箱数",data.out]];
    boxRows.forEach(function(pair){
      html += "<tr><td><b>"+pair[0]+"</b></td>";
      var arr = pair[1].slice(-6).reverse();
      arr.forEach(function(v){ html += "<td>"+v.toLocaleString()+"</td>"; });
      html += "</tr>";
    });
    document.getElementById("dailyTable").innerHTML = html + "</tbody>";
  });
}
