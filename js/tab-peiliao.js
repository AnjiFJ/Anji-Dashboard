/* =========================================================
 * tab-peiliao.js — 配料需求：分组表格 + 小计/总计 + 搜索
 * ========================================================= */
function renderPeiliao(){
  dataLoader.loadPeiliaoData().then(function(data){
    if(!data) return;
    document.getElementById("peiliaoLoading").style.display="none";
    document.getElementById("peiliaoBody").style.display="block";
    var tbl = document.getElementById("peiliaoTable");
    if(tbl.dataset.done) return;
    tbl.dataset.done = "1";

    function draw(filter){
      var kw = (filter||"").trim().toLowerCase();
      var html = "<thead><tr><th>配料区</th><th>工位</th><th>工位作业</th><th>SPS</th><th>排序(+SPS)</th><th>合计</th></tr></thead><tbody>";
      var totalG=0,totalS=0,totalR=0,shown=0;
      data.areas.forEach(function(a){
        var rows = a.rows.filter(function(r){
          if(!kw) return true;
          return (a.name+r.station).toLowerCase().indexOf(kw)>=0;
        });
        if(!rows.length) return;
        var sg=0, ss=0, sr=0;
        rows.forEach(function(r, i){
          var sum = r.gongwei + r.sps + r.sort;
          sg+=r.gongwei; ss+=r.sps; sr+=r.sort; shown++;
          html += "<tr>"+(i===0?"<td rowspan='"+rows.length+"'><b>"+a.name+"</b><br><span class='note'>"+a.people+" 人</span></td>":"")+
                  "<td>"+r.station+"</td><td>"+r.gongwei+"</td><td>"+r.sps+"</td><td>"+r.sort+"</td><td><b>"+sum+"</b></td></tr>";
        });
        totalG+=sg; totalS+=ss; totalR+=sr;
        html += "<tr class='subtotal'><td colspan='2'>"+a.name+" 小计</td><td>"+sg+"</td><td>"+ss+"</td><td>"+sr+"</td><td>"+(sg+ss+sr)+"</td></tr>";
      });
      html += "<tr class='subtotal' style='background:rgba(34,211,238,.10)'><td colspan='2' style='color:#22d3ee'>总计</td>"+
              "<td style='color:#22d3ee'>"+totalG+"</td><td style='color:#22d3ee'>"+totalS+"</td>"+
              "<td style='color:#22d3ee'>"+totalR+"</td><td style='color:#22d3ee'>"+(totalG+totalS+totalR)+"</td></tr>";
      tbl.innerHTML = html + "</tbody>";
      document.getElementById("peiliaoCount").textContent = "共 "+shown+" 个工位";
    }
    draw("");
    document.getElementById("peiliaoSearch").addEventListener("input", function(){ draw(this.value); });
  });
}
