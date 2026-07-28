/* =========================================================
 * password-gate.js — 受保护 Tab 密码门（SHA-256 + salt 校验）
 * 说明：正式版敏感数据"存储即加密"，本门仅做授权展示，非安全边界。
 * ========================================================= */
var PasswordGate = {
  SALT: "dashboard2026",
  // sha256(SALT + 密码)，当前对应演示密码 123456
  HASH: "29dcf5f9c69e64c148dfd2ad27a5101391f1c09a6e2f636a00af70c0c6ccc734",
  _authed: {},
  _cb: null, _tab: null,

  isAuthed: function(tab){ return !!this._authed[tab]; },

  requireAuth: function(tab, cb){
    this._tab = tab; this._cb = cb;
    document.getElementById("pwTip").textContent = "「"+PROTECTED_TABS[tab]+"」涉及敏感信息，请输入访问密码";
    document.getElementById("pwInput").value = "";
    document.getElementById("pwErr").textContent = "";
    document.getElementById("pwMask").classList.add("show");
    setTimeout(function(){ document.getElementById("pwInput").focus(); }, 80);
  },
  close: function(){ document.getElementById("pwMask").classList.remove("show"); },
  submit: function(){
    var pwd = document.getElementById("pwInput").value;
    var self = this;
    sha256(this.SALT + pwd).then(function(h){
      if(h === self.HASH){
        self._authed[self._tab] = true;
        self.close();
        if(self._cb) self._cb();
      }else{
        document.getElementById("pwErr").textContent = "密码错误，请重试";
      }
    });
  }
};

function sha256(text){
  if(window.crypto && crypto.subtle){
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){
        return ("0"+b.toString(16)).slice(-2); }).join("");
    });
  }
  // file:// 老环境降级：简单比对（预览阶段兜底）
  return Promise.resolve(text === "dashboard2026123456" ? PasswordGate.HASH : "bad");
}

document.getElementById("pwOk").addEventListener("click", function(){ PasswordGate.submit(); });
document.getElementById("pwCancel").addEventListener("click", function(){ PasswordGate.close(); });
document.getElementById("pwInput").addEventListener("keydown", function(e){
  if(e.key==="Enter") PasswordGate.submit();
});
document.getElementById("pwMask").addEventListener("click", function(e){
  if(e.target===this) PasswordGate.close();
});
