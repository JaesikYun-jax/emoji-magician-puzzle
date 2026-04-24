/* HUD shared by game screens */
function GameHud({ color="#0EA5E9", time="1:24", score=420, progress=0.55, combo=null }) {
  return (
    <div style={{ position:"absolute", top:0, left:0, right:0, padding:"52px 18px 12px", zIndex:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(0,0,0,0.28)", backdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:999, padding:"8px 12px", color:"#fff" }}>
        <button style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", display:"grid", placeItems:"center" }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"var(--f-sans)", fontWeight:800, fontSize:12 }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#FDE68A" strokeWidth="1.8"/><path d="M10 6v4l3 2" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round"/></svg>
          {time}
        </div>
        <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.15)", borderRadius:999, overflow:"hidden" }}>
          <div style={{ width:`${progress*100}%`, height:"100%", background:"#FDE68A" }}/>
        </div>
        <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14, color:"#FDE68A", letterSpacing:"-0.02em" }}>{score}</div>
      </div>
      {combo && (
        <div style={{ display:"flex", justifyContent:"center", marginTop:10 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", borderRadius:999,
            background:"rgba(253,230,138,0.18)", border:"1px solid rgba(253,230,138,0.55)",
            color:"#FDE68A", fontFamily:"var(--f-sans)", fontWeight:800, fontSize:12, letterSpacing:"0.04em"
          }}>
            <span>🔥</span>
            <span>{combo}연속 정답</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* MATH — tile matching + answer bar */
function MathGame() {
  const tiles = [
    12, 7, 20, 15, 8, 11,
    13, 5, 17, 9, 14, 6,
    16, 3, 18, 10, 4, 19,
    1, 21, 2, 22, 23, 25
  ];
  const selected = [5, 7];
  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%)"
    }}>
      <Chrome dark/>
      <GameHud color="#0EA5E9" time="1:24" score={420} progress={0.55} combo={3}/>

      {/* Target question card */}
      <div style={{ position:"absolute", top:120, left:22, right:22 }}>
        <div style={{
          background:"rgba(255,255,255,0.16)", border:"1.5px solid rgba(255,255,255,0.30)",
          borderRadius:24, backdropFilter:"blur(18px)", padding:"18px 18px", color:"#fff",
          boxShadow:"0 10px 30px rgba(3,105,161,0.40)"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span className="sb-chip" style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>두 자리 덧셈</span>
            <span style={{ fontSize:11, fontWeight:700, opacity:0.75, letterSpacing:"0.1em" }}>레벨 7 · 쌍 4/6</span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:12, marginTop:10 }}>
            <span style={{ fontSize:13, opacity:0.7 }}>합이</span>
            <span className="sb-display" style={{ fontSize:54, color:"#FDE68A" }}>28</span>
            <span style={{ fontSize:13, opacity:0.7 }}>인 카드 2장</span>
          </div>
        </div>
      </div>

      {/* Tile grid */}
      <div style={{ position:"absolute", top:280, left:22, right:22, bottom:120, display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8 }}>
        {tiles.map((n, i) => {
          const isSelected = selected.includes(i);
          const isHint = i === 18;
          return (
            <div key={i} style={{
              aspectRatio:"1/1",
              borderRadius:14,
              background: isSelected
                ? "linear-gradient(135deg,#FBBF24,#F59E0B)"
                : "linear-gradient(135deg,#38BDF8,#0EA5E9)",
              boxShadow: isSelected
                ? "0 0 0 3px #fff, 0 6px 16px rgba(251,191,36,0.6)"
                : "0 4px 12px rgba(3,105,161,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              display:"grid", placeItems:"center", color:"#fff",
              fontFamily:"var(--f-display)", fontWeight:800, fontSize:20,
              transform: isSelected ? "scale(1.06)" : "none",
              transition:"all 150ms",
              position:"relative",
              outline: isHint ? "2px dashed rgba(253,230,138,0.8)" : "none"
            }}>
              {n}
            </div>
          );
        })}
      </div>

      {/* Bottom action bar */}
      <div style={{ position:"absolute", bottom:30, left:22, right:22, display:"flex", gap:10 }}>
        <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, backdropFilter:"blur(10px)" }}>
          <span style={{ fontSize:16 }}>💡</span> 힌트 2
        </button>
        <button style={{ flex:1.3, background:"#FDE68A", color:"#0369A1", border:"none", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:800, fontSize:14, boxShadow:"0 6px 16px rgba(253,230,138,0.45)" }}>
          확인하기 ✦
        </button>
      </div>
    </div>
  );
}

window.MathGame = MathGame;
