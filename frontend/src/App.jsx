import { useRef, useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";

const API = "http://localhost:8000";
const SIZE = 280;

export default function App() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, SIZE, SIZE);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => { e.preventDefault(); setDrawing(true); setIsEmpty(false); lastPos.current = getPos(e); };

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 20; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
  }, [drawing]);

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, SIZE, SIZE);
    setResult(null); setIsEmpty(true);
  };

  const predict = async () => {
    if (isEmpty) return;
    setLoading(true); setResult(null);
    try {
      const blob = await new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
      const form = new FormData();
      form.append("file", blob, "drawing.png");
      const res = await fetch(`${API}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      setResult(await res.json());
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      <div style={{ ...s.page, marginLeft: sidebarOpen ? 280 : 0, transition: "margin-left 0.3s" }}>
        <h1 style={s.title}>Character Recognition</h1>
        <p style={s.hint}>Draw a digit, Chinese numeral, or Japanese hiragana</p>

        <canvas
          ref={canvasRef} width={SIZE} height={SIZE} style={s.canvas}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />

        <div style={s.buttons}>
          <button onClick={clear} style={s.btnGray}>Clear</button>
          <button onClick={predict} disabled={loading || isEmpty} style={s.btnBlue}>
            {loading ? "Predicting…" : "Predict"}
          </button>
        </div>

        {result && !result.error && (
          <div style={s.result}>
            <div style={s.bigLabel}>{result.prediction}</div>
            <div style={s.bars}>
              {result.top5.map(({ label, prob }) => (
                <div key={label} style={s.row}>
                  <span style={s.rowLabel}>{label}</span>
                  <div style={s.track}><div style={{ ...s.fill, width: `${(prob * 100).toFixed(1)}%` }} /></div>
                  <span style={s.pct}>{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {result?.error && <p style={s.error}>{result.error}</p>}
      </div>
    </>
  );
}

const s = {
  page:     { display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"sans-serif", padding:24, background:"#f5f5f5", minHeight:"100vh" },
  title:    { fontSize:26, marginBottom:4 },
  hint:     { color:"#666", marginBottom:16, fontSize:14 },
  canvas:   { border:"2px solid #333", borderRadius:8, cursor:"crosshair", touchAction:"none" },
  buttons:  { display:"flex", gap:12, marginTop:14 },
  btnBlue:  { padding:"10px 28px", fontSize:16, background:"#2563eb", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" },
  btnGray:  { padding:"10px 28px", fontSize:16, background:"#6b7280", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" },
  result:   { marginTop:24, width:SIZE, textAlign:"center" },
  bigLabel: { fontSize:72, fontWeight:"bold", lineHeight:1, marginBottom:12 },
  bars:     { display:"flex", flexDirection:"column", gap:6 },
  row:      { display:"flex", alignItems:"center", gap:8 },
  rowLabel: { width:36, textAlign:"right", fontWeight:"bold", fontSize:15 },
  track:    { flex:1, height:18, background:"#e5e7eb", borderRadius:4, overflow:"hidden" },
  fill:     { height:"100%", background:"#2563eb", borderRadius:4, transition:"width 0.3s" },
  pct:      { fontSize:13, color:"#555", width:44 },
  error:    { color:"red", marginTop:12 },
};
