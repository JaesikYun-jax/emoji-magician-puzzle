/* LOGIC — pattern finder: next shape in sequence */
function LogicGame() {
  // sequence: ▲▲●▲▲●▲▲?
  const seq = [
    { k:"tri" },{ k:"tri" },{ k:"cir" },
    { k:"tri" },{ k:"tri" },{ k:"cir" },
    { k:"tri" },{ k:"tri" },{ k:"q" },
  ];
  const Shape = ({ k, s=40, color="#fff", dashed=false }) => {
    if (k === "tri") return (
      <svg viewBox="0 0 40 40" width={s} height={s}><path d="M20 6 L35 32 L5 32 Z" fill={color}/></svg>
    );
    if (k === "cir") return (
      <svg viewBox="0 0 40 40" width={s} height={s}><circle cx="20" cy="20" r="14" fill={color}/></svg>
    );
    if (k === "sqr") return (
      <svg viewBox="0 0 40 40" width={s} height={s}><rect x="6" y="6" width="28" height="28" rx="4" fill={color}/></svg>
    );
    if (k === "dia") return (
      <svg viewBox="0 0 40 40" width={s} height={s}><path d="M20 4 L36 20 L20 36 L4 20 Z" fill={color}/></svg>
    );
    if (k === "q") return (
      <div style={{ width:s, height:s, borderRadius:12, border:`2px dashed ${color}`, display:"grid", placeItems:"center", color, fontFamily:"var(--f-display)", fontWeight:800, fontSize:s*0.5 }}>?</div>
    );
    return null;
  };
  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #312E81 0%, #4338CA 55%, #6366F1 100%)"
    }}>
      <Chrome dark/>
      <GameHud time="3:10" score={540} progress={0.7}/>

      <div style={{ position:"absolute", top:128, left:22, right:22, color:"#fff" }}>
        <div style={{ background:"rgba(255,255,255,0.14)", border:"1.5px solid rgba(255,255,255,0.28)", borderRadius:26, backdropFilter:"blur(16px)", padding:"20px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span className="sb-chip" style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>다음에 올 모양은?</span>
            <span style={{ fontSize:11, fontWeight:700, opacity:0.75 }}>쉬움 · 규칙찾기</span>
          </div>

          {/* Sequence grid */}
          <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(9, 1fr)", gap:6 }}>
            {seq.map((item, i) => (
              <div key={i} style={{
                aspectRatio:"1/1",
                background: item.k==="q" ? "rgba(253,230,138,0.14)" : "rgba(255,255,255,0.10)",
                border: item.k==="q" ? "1.5px dashed #FDE68A" : "1px solid rgba(255,255,255,0.18)",
                borderRadius:10, display:"grid", placeItems:"center"
              }}>
                <Shape k={item.k} s={22} color={item.k==="q" ? "#FDE68A" : "#fff"}/>
              </div>
            ))}
          </div>

          <div style={{ marginTop:14, fontSize:12, color:"rgba(255,255,255,0.7)", fontFamily:"var(--f-sans)", textAlign:"center" }}>
            반복되는 <b style={{ color:"#FDE68A" }}>규칙</b>을 찾아봐요
          </div>
        </div>
      </div>

      {/* Choices */}
      <div style={{ position:"absolute", top:400, left:22, right:22, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {[
          { k:"tri", label:"A" },
          { k:"cir", label:"B", selected:true },
          { k:"sqr", label:"C" }
        ].map((c,i)=>(
          <button key={i} style={{
            aspectRatio:"1/1",
            background: c.selected ? "linear-gradient(135deg,#FDE68A,#F59E0B)" : "rgba(255,255,255,0.12)",
            border: c.selected ? "none" : "1.5px solid rgba(255,255,255,0.30)",
            backdropFilter:"blur(10px)",
            borderRadius:22,
            display:"grid", placeItems:"center",
            boxShadow: c.selected ? "0 0 0 3px #fff, 0 8px 18px rgba(251,191,36,0.55)" : "0 4px 10px rgba(0,0,0,0.2)",
            transform: c.selected ? "scale(1.04)" : "none",
            position:"relative"
          }}>
            <span style={{ position:"absolute", top:8, left:10, fontFamily:"var(--f-sans)", fontWeight:800, fontSize:11, color:c.selected?"#4338CA":"rgba(255,255,255,0.7)", letterSpacing:"0.1em" }}>{c.label}</span>
            <Shape k={c.k} s={56} color={c.selected?"#4338CA":"#fff"}/>
          </button>
        ))}
      </div>

      <div style={{ position:"absolute", bottom:30, left:22, right:22, display:"flex", gap:10 }}>
        <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.30)", color:"#fff", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700 }}>💡 힌트</button>
        <button style={{ flex:1.6, background:"#FDE68A", color:"#312E81", border:"none", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:800 }}>답 선택 · B</button>
      </div>
    </div>
  );
}

window.LogicGame = LogicGame;
