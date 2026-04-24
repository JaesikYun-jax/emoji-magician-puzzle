/* ENGLISH — word quiz (ko→en) with 4 choice cards */
function EnglishGame() {
  const choices = [
    { en:"Apple", ko:"사과", emoji:"🍎" },
    { en:"Banana", ko:"바나나", emoji:"🍌" },
    { en:"Grape", ko:"포도", emoji:"🍇" },
    { en:"Orange", ko:"오렌지", emoji:"🍊" }
  ];
  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #065F46 0%, #10B981 55%, #34D399 100%)"
    }}>
      <Chrome dark/>
      <GameHud time="2:03" score={280} progress={0.35}/>

      <div style={{ position:"absolute", top:128, left:22, right:22 }}>
        <div style={{
          background:"rgba(255,255,255,0.14)", border:"1.5px solid rgba(255,255,255,0.28)",
          borderRadius:26, backdropFilter:"blur(16px)",
          padding:"22px 18px", color:"#fff", textAlign:"center",
          boxShadow:"0 10px 30px rgba(6,95,70,0.40)"
        }}>
          <span className="sb-chip" style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>뜻을 맞춰봐</span>
          <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"center", gap:14 }}>
            <div style={{ fontSize:64, filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>🍎</div>
            <div>
              <div className="sb-display" style={{ fontSize:36 }}>사과</div>
              <div style={{ fontFamily:"var(--f-sans)", fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", opacity:0.7, marginTop:2 }}>This is...</div>
            </div>
          </div>
          <button style={{ marginTop:14, background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.35)", color:"#fff", padding:"8px 18px", borderRadius:999, fontFamily:"var(--f-sans)", fontWeight:700, fontSize:12, display:"inline-flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5 7v6l4 3V4L5 7zm8 0a5 5 0 010 6"/></svg>
            다시 듣기
          </button>
        </div>
      </div>

      <div style={{ position:"absolute", top:330, left:22, right:22, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {choices.map((c, i) => {
          const isCorrect = i === 0;
          const isSelected = i === 0;
          return (
            <button key={c.en} style={{
              background: isSelected ? "#10B981" : "rgba(255,255,255,0.14)",
              border: isSelected ? "2px solid #D1FAE5" : "1.5px solid rgba(255,255,255,0.28)",
              backdropFilter:"blur(14px)",
              borderRadius:20, padding:"18px 12px", color:"#fff",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              boxShadow: isSelected ? "0 0 0 4px rgba(209,250,229,0.35), 0 8px 20px rgba(16,185,129,0.45)" : "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              <span style={{ fontSize:36 }}>{c.emoji}</span>
              <span className="sb-display" style={{ fontSize:18, fontWeight:700 }}>{c.en}</span>
              {isSelected && (
                <span style={{ width:22, height:22, borderRadius:"50%", background:"#fff", display:"grid", placeItems:"center", color:"#10B981", marginTop:2 }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stars row */}
      <div style={{ position:"absolute", bottom:30, left:22, right:22, background:"rgba(0,0,0,0.22)", backdropFilter:"blur(12px)", borderRadius:18, padding:"12px 16px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"var(--f-sans)", fontSize:12, fontWeight:700 }}>
          정답 7 / 10 <span style={{ opacity:0.5, marginLeft:6 }}>· 연속 3 🔥</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <div key={n} style={{ width:10, height:10, borderRadius:"50%", background: n<=7 ? "#FDE68A" : "rgba(255,255,255,0.2)" }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

window.EnglishGame = EnglishGame;
