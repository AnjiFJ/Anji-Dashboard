/* =========================================================
 * tab-daokou.js — 道口卸货及时率（95% 合格线 + 三色标注）
 * ========================================================= */
function renderDaokou(){
  dataLoader.loadDaokouData().then(function(data){
    if(!data) return;
    document.getElementById("daokouLoading").style.display="none";
    document.getElementById("daokouBody").style.display="block";
    if(document.getElementById("daokouTable").dataset.done) return;
    document.getElementById("daokouTable").dataset.done = "1";

    var datasets = data.months.map(function(m, mi){
      return {
        label: m,
        data: data.teams.map(function(t, ti){ return data.rates[ti][mi]; }),
        backgroundColor: data.teams.map(function(t, ti){ return rateColor(data.rates[ti][mi])+"cc"; }),
        borderColor: data.teams.map(function(t, ti){ return rateColor(data.rates[ti][mi]); }),
        borderWidth:1, borderRadius:6, maxBarThickness:44
      };
    });
    datasets.push({
      label:"95% 合格线", type:"line",
      data: data.teams.map(function(){return 95;}),
      borderColor:"#C03A31", borderDash:[6,5], borderWidth:1.5, pointRadius:0
    });
    destroyChart("daokou");
    allCharts["daokou"] = new Chart(document.getElementById("daokouChart"), {
      type:"bar",
      data:{ labels:data.teams, datasets:datasets },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{labels:{boxWidth:12}},
          tooltip:{callbacks:{label:function(c){
            if(c.dataset.type==="line") return " 合格线：95%";
            return " "+c.dataset.label+"："+c.parsed.y+"%";
          }}}
        },
        scales:{
          y:{min:80, max:100, ticks:{callback:function(v){return v+"%";}},
             grid:{color:"rgba(0,0,0,.06)"}},
          x:{grid:{display:false}}
        }
      }
    });

    var html = "<thead><tr><th>班组</th><th>月份</th><th>卸货总批次</th><th>及时批次</th><th>及时率</th></tr></thead><tbody>";
    data.detail.forEach(function(r){
      var rate = round2(r.ontime/r.total*100);
      var cls = rate>=95?"g":(rate>=90?"y":"r");
      html += "<tr><td><b>"+r.team+"</b></td><td>"+r.month+"</td><td>"+r.total+"</td><td>"+r.ontime+
              "</td><td><span class='tag "+cls+"'>"+rate+"%</span></td></tr>";
    });
    document.getElementById("daokouTable").innerHTML = html + "</tbody>";
  });
}
