/* =========================================================
 * common.js — 通用工具 / 图表配置 / 数据加载器 / Tab 切换
 * ========================================================= */

/* ---------- 通用工具 ---------- */
var allCharts = {};
function round2(n){ return Math.round(n*100)/100; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function destroyChart(key){ if(allCharts[key]){ allCharts[key].destroy(); delete allCharts[key]; } }

/* ---------- Chart.js 全局配置与配色（BMW 式沉稳色板） ---------- */
if(window.Chart){
  Chart.defaults.color = "#A6A6AB";
  Chart.defaults.borderColor = "rgba(255,255,255,.08)";
  Chart.defaults.font.family = '"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif';
}
function satColor(s){           // 饱和度配色
  if(s>=0.9) return "#C03A31";
  if(s>=0.7) return "#D9A626";
  return "#3D9A50";
}
function rateColor(r){          // 及时率配色（95 合格线）
  if(r>=95) return "#3D9A50";
  if(r>=90) return "#D9A626";
  return "#C03A31";
}

/* ---------- 数据加载器 ----------
 * 每个 Tab 首次激活时才加载自己的数据：
 *   线上：fetch data/xxx_data.json（加时间戳防缓存）
 *   离线：fetch 失败时回退到 data/xxx_data.js 内联的 window.XXX_INLINE
 * 加载后缓存到 window.XXX_INLINE 并置 loaded 标记，切 Tab 不重复请求。
 */
var dataLoader = {
  _loaded: {},
  _fetch: function(name, varName){
    var self = this;
    if(this._loaded[name] && window[varName]) return Promise.resolve(window[varName]);
    return fetch("data/" + name + ".json?t=" + Date.now())
      .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){ window[varName] = d; self._loaded[name] = true; return d; })
      .catch(function(){
        // 离线兜底：内联数据（data/xxx_data.js 已随页面加载）
        if(window[varName]){ self._loaded[name] = true; return window[varName]; }
        return null;
      });
  },
  loadMetaData:   function(){ return this._fetch("meta_data",   "META_INLINE"); },
  loadFlowData:   function(){ return this._fetch("flow_data",   "FLOW_INLINE"); },
  loadDailyData:  function(){ return this._fetch("daily_data",  "DAILY_INLINE"); },
  loadDaokouData: function(){ return this._fetch("daokou_data", "DAOKOU_INLINE"); },
  loadGkbData:    function(){ return this._fetch("gkb_data",    "GKB_INLINE"); },
  loadPlanData:   function(){ return this._fetch("plan_data",   "PLAN_INLINE"); },
  loadPeiliaoData:function(){ return this._fetch("peiliao_data","PEILIAO_INLINE"); }
};

/* ---------- Tab 切换（受保护 Tab 先过密码门） ---------- */
var PROTECTED_TABS = { gkb:"排序零件数据", plan:"零件计划数据" };

function switchMainTab(tab){
  if(PROTECTED_TABS[tab] && !PasswordGate.isAuthed(tab)){
    PasswordGate.requireAuth(tab, function(){ doSwitch(tab); });
    return;
  }
  doSwitch(tab);
}
function doSwitch(tab){
  var btns = document.querySelectorAll(".tab-btn");
  for(var i=0;i<btns.length;i++) btns[i].classList.toggle("active", btns[i].dataset.tab===tab);
  var pages = document.querySelectorAll(".main-tab-content");
  for(var j=0;j<pages.length;j++) pages[j].classList.toggle("active", pages[j].id==="tab-"+tab);
  if(tab==="overview") renderOverview();
  if(tab==="flow")     renderFlow();
  if(tab==="daokou")   renderDaokou();
  if(tab==="daily")    renderDaily();
  if(tab==="peiliao")  renderPeiliao();
  if(tab==="gkb")      renderGkb();
  if(tab==="plan")     renderPlan();
}
document.getElementById("tabNav").addEventListener("click", function(e){
  var btn = e.target.closest(".tab-btn");
  if(btn) switchMainTab(btn.dataset.tab);
});
