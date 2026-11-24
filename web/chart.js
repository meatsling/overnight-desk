/* chart.js — hand-drawn charts on <canvas>, no library. Stub (STEP 4). */
function drawLine(canvas, values, color) {
  const c = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
  c.clearRect(0, 0, w, h);
  if (!values || values.length < 2) return;
  const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  c.strokeStyle = color || "#3ddc84"; c.lineWidth = 2; c.beginPath();
  values.forEach((v, i) => {
    const x = (i / (values.length - 1)) * w, y = h - ((v - lo) / span) * (h - 10) - 5;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.stroke();
}
