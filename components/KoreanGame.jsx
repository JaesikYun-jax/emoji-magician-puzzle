/* KOREAN — 자모 조합 ("ㄱ + ㅏ = 가") */
function KoreanGame() {
  const choices = ["ㅏ", "ㅓ", "ㅗ", "ㅜ"];
  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #9F1239 0%, #F43F5E 55%, #FB7185 100%)"
    }}>
      <Chrome dark/>
      <GameHud time="0:48" score={180} progress={0.25}/>

      <div style={{ position:"absolute", top:128, left:22, right:22 }}>
        <div style={{
          background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.30)",
          borderRadius:26, backdropFilter:"blur(16px)", color:"#fff", textAlign:"center",
          padding:"18px 18px 22px"
        }}>
          <span className="sb-chip" style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>소리를 만들어 봐</span>
          <div style={{ fontSize:12, opacity:0.75, marginTop:8, fontFamily:"var(--f-sans)" }}>"<b>가</b>방"의 첫 글자</div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginTop:18 }}>
            <div style={{ width:82, height:82, borderRadius:22, background:"#FFE4E6", color:"#9F1239", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:52, boxShadow:"0 8px 18px rgba(0,0,0,0.18)" }}>ㄱ</div>
            <div style={{ fontFamily:"var(--f-display)", fontSize:36, fontWeight:700, opacity:0.75 }}>+</div>
            <div style={{ width:82, height:82, borderRadius:22, background:"rgba(255,255,255,0.12)", border:"2px dashed rgba(255,255,255,0.50)", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:44, color:"rgba(255,255,255,0.55)" }}>?</div>
            <div style={{ fontFamily:"var(--f-display)", fontSize:36, fontWeight:700, opacity:0.75 }}>=</div>
            <div style={{ width:82, height:82, borderRadius:22, background:"#FDE68A", color:"#9F1239", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:52, boxShadow:"0 8px 18px rgba(251,191,36,0.45)" }}>가</div>
          </div>
        </div>
      </div>

      {/* Jamo choices */}
      <div style={{ position:"absolute", top:352, left:22, right:22 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
          {choices.map((c, i) => (
            <button key={c} style={{
              aspectRatio:"1/1",
              background: i===0 ? "#FDE68A" : "#fff",
              color: i===0 ? "#9F1239" : "#9F1239",
              border: i===0 ? "none" : "none",
              borderRadius:22,
              fontFamily:"var(--f-display)", fontWeight:800, fontSize:38,
              boxShadow: i===0 ? "0 0 0 3px #fff, 0 8px 18px rgba(253,230,138,0.55)" : "0 6px 16px rgba(159,18,57,0.25)",
              transform: i===0 ? "scale(1.05)" : "none"
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Example words */}
      <div style={{ position:"absolute", bottom:112, left:22, right:22, color:"#fff" }}>
        <div className="sb-eyebrow" style={{ color:"rgba(255,255,255,0.85)" }}>이 글자로 만든 단어</div>
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          {["가방","가족","가을","가수"].map(w => (
            <span key={w} style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.30)", borderRadius:999, padding:"8px 14px", fontFamily:"var(--f-display)", fontWeight:700, fontSize:14 }}>{w}</span>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", bottom:30, left:22, right:22, display:"flex", gap:10 }}>
        <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700 }}>🔊 듣기</button>
        <button style={{ flex:1.5, background:"#FDE68A", color:"#9F1239", border:"none", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:800 }}>정답 확인</button>
      </div>
    </div>
  );
}

window.KoreanGame = KoreanGame;
