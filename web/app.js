/* app.js — plain JS app shell (hosting plan B).
   Opens as {URL}#d={DATA_PATH}. DATA_PATH is kept in localStorage. Data is polled (no SSE) from
   /d/{DATA_PATH}/x  ==  https://gist.githubusercontent.com/meatsling/{DATA_PATH}/raw/x
   with a cache-busting query so the raw CDN's 300 s cache is skipped.
   The hash is left in the URL on purpose: iOS home-screen apps get their own storage, so the
   link added to the home screen must carry #d=. */
const GIST_USER = "meatsling";
const POLL_MS = 15000;

function dataPath() {
  const m = location.hash.match(/(?:^#|&)d=([A-Za-z0-9]{32,})/);
  if (m) localStorage.setItem("desk.d", m[1]);
  return localStorage.getItem("desk.d");
}

function gistName(path) {
  if (path.startsWith("coin/")) return "coin_" + path.slice(5);
  if (path === "screen.jpg") return "screen.jpg.b64";
  return path;
}

/* The one function every data read goes through. */
async function fetchData(path) {
  const d = dataPath();
  if (!d) throw new Error("no data path");
  const url = `https://gist.githubusercontent.com/${GIST_USER}/${d}/raw/${gistName(path)}?cb=${Date.now()}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return path === "screen.jpg" ? r.text() : r.json();
}
window.fetchData = fetchData;

const $ = (id) => document.getElementById(id);

async function tick() {
  if (!dataPath()) { $("status").textContent = "Open the link with #d=… once to connect."; return; }
  try {
    const [state, chart, activity] = await Promise.all([fetchData("state.json"), fetchData("chart.json"), fetchData("activity.json")]);
    const age = Math.max(0, Date.now() / 1000 - state.written_at);
    $("status").textContent = `${state.mode} · update #${state.seq} · ${age.toFixed(0)}s old`;
    drawLine($("chart"), (chart.equity || []).map((p) => p[1]), "#3ddc84");
    $("activity").textContent = (activity.items || []).map((i) => new Date(i.ts * 1000).toLocaleTimeString() + "  " + i.text).join("\n");
    fetchData("screen.jpg").then((b64) => { $("screen").src = "data:image/jpeg;base64," + b64.trim(); }).catch(() => {});
  } catch (e) {
    $("status").textContent = "Data not reachable: " + e.message;
  }
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
tick();
setInterval(tick, POLL_MS);
