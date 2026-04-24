/* Subject Select — 5 subjects with distinct cards */
function SubjectSelect() {
  const subjects = [
    { id:"math", name:"수리 수학", sub:"더하기 · 빼기 · 곱하기", c:"#0EA5E9", glow:"#0EA5E9", glyph:"🔢", levels:42, status:"진행중" },
    { id:"english", name:"영어", sub:"단어 · 문장 · 발음", c:"#10B981", glow:"#10B981", glyph:"🔤", levels:38, status:"진행중" },
    { id:"korean", name:"국어", sub:"자모 · 단어 · 문장", c:"#F43F5E", glow:"#F43F5E", glyph:"📚", levels:28, status:"NEW" },
    { id:"logic", name:"논리", sub:"패턴 · 추리 · 규칙", c:"#6366F1", glow:"#6366F1", glyph:"🧩", levels:32, status:"진행중" },
    { id:"creative", name:"창의", sub:"한붓그리기 · 상상", c:"#F97316", glow:"#F97316", glyph:"🎨", levels:24, status:"NEW" },
  ];
  return (
    <div className="sb-phone sb-noise" style={{
      background:"radial-gradient(ellipse 70% 50% at 0% 0%, rgba(217,249,157,0.10), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,113,133,0.15), transparent 60%), linear-gradient(165deg, #2E1065 0%, #4C1D95 50%, #6D28D9 100%)",
      color:"#fff"
    }}>
      <Chrome dark/>
      <div style={{ position:"relative", padding:"56px 22px 0", height:"100%", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
          <button style={{ width:40, height:40, borderRadius:14, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", display:"grid", placeItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <div className="sb-eyebrow" style={{ color:"#D9F99D" }}>Choose one</div>
            <div className="sb-display" style={{ fontSize:22, marginTop:2 }}>오늘 배울 <em style={{ color:"#FDE68A" }}>과목</em></div>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12, overflow:"hidden" }}>
          {subjects.map(s => (
            <button key={s.id} style={{
              textAlign:"left", display:"flex", alignItems:"center", gap:14,
              padding:"16px 16px",
              borderRadius:22,
              border:"1px solid rgba(255,255,255,0.14)",
              background:"rgba(255,255,255,0.05)",
              backdropFilter:"blur(14px)",
              color:"#fff",
              position:"relative", overflow:"hidden"
            }}>
              <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:s.glow, filter:"blur(30px)", opacity:0.35 }}/>
              <div style={{ width:58, height:58, borderRadius:18, background:"#fff", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:22, color:s.c, flexShrink:0, boxShadow:"0 8px 18px rgba(0,0,0,0.25)", position:"relative", zIndex:1 }}>
                {s.glyph}
              </div>
              <div style={{ flex:1, position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ fontFamily:"var(--f-display)", fontSize:18, fontWeight:800, letterSpacing:"-0.02em" }}>{s.name}</div>
                  {s.status === "NEW" && <span className="sb-chip" style={{ background:"rgba(253,230,138,0.22)", color:"#FDE68A", padding:"3px 8px", fontSize:9 }}>NEW</span>}
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:4 }}>{s.sub}</div>
                <div style={{ display:"flex", gap:10, marginTop:8, fontFamily:"var(--f-sans)", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                  <span>레벨 {s.levels}</span><span>·</span><span>★ 24</span>
                </div>
              </div>
              <span style={{ width:36, height:36, borderRadius:"50%", background:"rgba(217,249,157,0.14)", border:"1px solid rgba(217,249,157,0.30)", display:"grid", placeItems:"center", color:"#D9F99D", position:"relative", zIndex:1 }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
window.SubjectSelect = SubjectSelect;
