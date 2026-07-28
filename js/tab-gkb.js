/* =========================================================
 * tab-gkb.js — 排序零件查询（受保护）
 * ========================================================= */
function renderGkb(){
  dataLoader.loadGkbData().then(function(GKB){
    if(!GKB) return;
    var body = document.getElementById("gkbBody");
    body.style.display = "block";
    if(body.dataset.done) return;
    body.dataset.done = "1";

    function draw(filter){
      var kw = (filter||"").trim().toLowerCase();
      var rows = GKB.filter(function(r){
        if(!kw) return true;
        return (r.no+r.name+r.station+r.vendor+r.model+r.sort).toLowerCase().indexOf(kw)>=0;
      });
      var html = "<thead><tr><th>零件号</th><th>零件名称</th><th>车型</th><th>包装数</th><th>排序方式</th><th>工位</th><th>供应商</th></tr></thead><tbody>";
      rows.forEach(function(r){
        html += "<tr><td><b>"+r.no+"</b></td><td>"+escapeHtml(r.name)+"</td><td>"+r.model+
                "</td><td>"+r.pack+"</td><td>"+r.sort+"</td><td>"+r.station+"</td><td>"+escapeHtml(r.vendor)+"</td></tr>";
      });
      document.getElementById("gkbTable").innerHTML = html + "</tbody>";
      document.getElementById("gkbCount").textContent = "共 "+rows.length+" 条";
    }
    draw("");
    document.getElementById("gkbSearch").addEventListener("input", function(){ draw(this.value); });
  });
}
