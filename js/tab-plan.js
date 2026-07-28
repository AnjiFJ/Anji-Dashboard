/* =========================================================
 * tab-plan.js — 零件计划查询（受保护）
 * ========================================================= */
function renderPlan(){
  dataLoader.loadPlanData().then(function(PLAN){
    if(!PLAN) return;
    var body = document.getElementById("planBody");
    body.style.display = "block";
    if(body.dataset.done) return;
    body.dataset.done = "1";

    function draw(filter){
      var kw = (filter||"").trim().toLowerCase();
      var rows = PLAN.filter(function(r){
        if(!kw) return true;
        return (r.no+r.name+r.date+r.shift).toLowerCase().indexOf(kw)>=0;
      });
      var html = "<thead><tr><th>零件号</th><th>零件名称</th><th>计划日期</th><th>班次</th><th>计划数量</th><th>需求时间</th></tr></thead><tbody>";
      rows.forEach(function(r){
        html += "<tr><td><b>"+r.no+"</b></td><td>"+escapeHtml(r.name)+"</td><td>"+r.date+
                "</td><td>"+r.shift+"</td><td>"+r.qty.toLocaleString()+"</td><td>"+r.time+"</td></tr>";
      });
      document.getElementById("planTable").innerHTML = html + "</tbody>";
      document.getElementById("planCount").textContent = "共 "+rows.length+" 条";
    }
    draw("");
    document.getElementById("planSearch").addEventListener("input", function(){ draw(this.value); });
  });
}
