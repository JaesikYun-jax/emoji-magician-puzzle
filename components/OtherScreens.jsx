/* RESULT — stars, score, cta */
function ResultScreen() {
  return (
    <div className="sb-phone sb-noise" style={{
      background:"radial-gradient(ellipse 60% 40% at 50% 0%, rgba(253,230,138,0.18), transparent 60%), linear-gradient(165deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%)",
      color:"#fff"
    }}>
      <Chrome dark/>
      {/* confetti */}
      <svg style={{ position:"absolute", inset:0, pointerEvents:"none" }} viewBox="0 0 390 844">
        {[
          [60,120,"#FDE68A",8],[320,180,"#FB7185",6],[90,260,"#D9F99D",10],[290,320,"#A78BFA",7],
          [40,380,"#FDE68A",5],[340,420,"#D9F99D",9],[150,90,"#FB7185",7],[220,150,"#FDE68A",6],
          [180,260,"#D9F99D",6],[300,500,"#FB7185",8],[50,530,"#FDE68A",7],[340,120,"#A78BFA",5]
        ].map(([x,y,c,s],i)=>(
          <circle key={i} cx={x} cy={y} r={s} fill={c} opacity="0.85"/>
        ))}
      </svg>

      <div style={{ position:"relative", padding:"70px 26px 0", height:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <span className="sb-eyebrow" style={{ color:"#D9F99D" }}>Level Cleared · 수리 · Lv.7</span>
        <h1 className="sb-display" style={{ fontSize:44, marginTop:14, textAlign:"center" }}>
          <em style={{ color:"#FDE68A" }}>완벽해!</em>
        </h1>

        {/* Stars */}
        <div style={{ display:"flex", gap:14, marginTop:28, alignItems:"flex-end" }}>
          {[0,1,2].map(i => {
            const size = i===1 ? 80 : 64;
            return (
              <svg key={i} width={size} height={size} viewBox="0 0 80 80" style={{ filter:"drop-shadow(0 8px 16px rgba(251,191,36,0.55))" }}>
                <defs>
                  <linearGradient id={`star${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FDE68A"/>
                    <stop offset="1" stopColor="#F59E0B"/>
                  </linearGradient>
                </defs>
                <path d="M40 6 L50 32 L78 36 L58 54 L64 80 L40 66 L16 80 L22 54 L2 36 L30 32 Z" fill={`url(#star${i})`} stroke="#fff" strokeWidth="2"/>
              </svg>
            );
          })}
        </div>

        {/* Stat card */}
        <div style={{ marginTop:36, background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:26, backdropFilter:"blur(16px)", padding:"22px 26px", width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            {[
              { label:"점수", val:"1,240", sub:"+120 콤보" },
              { label:"정답률", val:"92%", sub:"11/12" },
              { label:"시간", val:"1:48", sub:"기록!" }
            ].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", opacity:0.65, fontWeight:700 }}>{s.label}</div>
                <div className="sb-display" style={{ fontSize:26, marginTop:4, color:"#FDE68A" }}>{s.val}</div>
                <div style={{ fontFamily:"var(--f-sans)", fontSize:10, opacity:0.6, marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:18, paddingTop:16, borderTop:"1px dashed rgba(255,255,255,0.2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"var(--f-sans)", fontSize:11, opacity:0.65, letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>새 배지 획득</div>
              <div className="sb-display" style={{ fontSize:16, marginTop:2 }}>덧셈 <em style={{ color:"#D9F99D" }}>달인</em></div>
            </div>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#D9F99D,#84CC16)", display:"grid", placeItems:"center", boxShadow:"0 8px 18px rgba(132,204,22,0.4)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#2E1065"><path d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9Z"/></svg>
            </div>
          </div>
        </div>

        <div style={{ marginTop:"auto", marginBottom:36, display:"flex", flexDirection:"column", gap:10, width:"100%" }}>
          <button className="sb-btn" style={{ width:"100%", justifyContent:"center", background:"#D9F99D", color:"#2E1065", boxShadow:"0 10px 30px rgba(217,249,157,0.35)" }}>
            다음 레벨 →
          </button>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", borderRadius:999, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700, fontSize:14 }}>다시 하기</button>
            <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", borderRadius:999, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700, fontSize:14 }}>홈으로</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* LEVEL INTRO — countdown */
function LevelIntro() {
  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #0369A1 0%, #0EA5E9 100%)",
      color:"#fff"
    }}>
      <Chrome dark/>
      {/* Concentric rings */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}>
        {[260,360,460,560].map((s,i)=>(
          <div key={i} style={{ position:"absolute", top:-s/2, left:-s/2, width:s, height:s, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)" }}/>
        ))}
      </div>

      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 30px" }}>
        <span className="sb-eyebrow" style={{ color:"#FDE68A" }}>수리 · Lv.7 · 두 자리 덧셈</span>
        <div style={{ marginTop:18, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.14)", border:"2px solid rgba(255,255,255,0.35)", backdropFilter:"blur(14px)", display:"grid", placeItems:"center", boxShadow:"0 20px 50px rgba(0,0,0,0.35)" }}>
          <span className="sb-display" style={{ fontSize:140, color:"#FDE68A", lineHeight:1, display:"block", textAlign:"center", width:"100%", fontFeatureSettings:"'tnum' 1", letterSpacing:0 }}>3</span>
        </div>
        <h2 className="sb-display" style={{ fontSize:30, marginTop:32, textAlign:"center" }}>
          합이 <em style={{ color:"#FDE68A" }}>28</em>인 카드를<br/>찾아봐요
        </h2>
        <div style={{ display:"flex", gap:16, marginTop:24, fontFamily:"var(--f-sans)", fontSize:12, letterSpacing:"0.12em", textTransform:"uppercase", opacity:0.8, fontWeight:700 }}>
          <span>⏱ 2분</span><span>·</span><span>✦ 6쌍</span><span>·</span><span>★★★ 90점</span>
        </div>
      </div>
    </div>
  );
}

/* PARENT DASHBOARD — weekly report */
function ParentDashboard() {
  const weekData = [0.4, 0.7, 0.2, 0.9, 0.55, 0.8, 0.65];
  const subjects = [
    { name:"수리", c:"#0EA5E9", pct:78, trend:"+12" },
    { name:"영어", c:"#10B981", pct:62, trend:"+8" },
    { name:"국어", c:"#F43F5E", pct:41, trend:"+4" },
    { name:"논리", c:"#6366F1", pct:55, trend:"+6" },
    { name:"창의", c:"#F97316", pct:33, trend:"—" },
  ];
  return (
    <div className="sb-phone" style={{ background:"#FAF7F2", color:"var(--ink)" }}>
      <Chrome/>
      <div style={{ position:"relative", padding:"56px 24px 0", height:"100%", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span className="sb-eyebrow" style={{ color:"#6D28D9" }}>Parent · Weekly</span>
            <h1 className="sb-display" style={{ fontSize:26, marginTop:6 }}>지우의 <em style={{ color:"#F43F5E" }}>성장</em></h1>
          </div>
          <div style={{ width:42, height:42, borderRadius:14, background:"#2E1065", color:"#D9F99D", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:16 }}>지</div>
        </div>

        {/* Summary cards */}
        <div style={{ marginTop:18, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:"#2E1065", color:"#fff", padding:"16px 16px", borderRadius:22, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, background:"#7C3AED", filter:"blur(30px)", opacity:0.7, borderRadius:"50%" }}/>
            <div className="sb-eyebrow" style={{ color:"#D9F99D", position:"relative" }}>Streak</div>
            <div className="sb-display" style={{ fontSize:36, color:"#FDE68A", marginTop:6, position:"relative" }}>12일</div>
            <div style={{ fontSize:11, opacity:0.7, marginTop:2, position:"relative" }}>🔥 연속 플레이</div>
          </div>
          <div style={{ background:"#fff", padding:"16px 16px", borderRadius:22, border:"1px solid rgba(46,16,101,0.08)" }}>
            <div className="sb-eyebrow" style={{ color:"#10B981" }}>이번주</div>
            <div className="sb-display" style={{ fontSize:36, color:"#065F46", marginTop:6 }}>84<span style={{ fontSize:14, marginLeft:2 }}>분</span></div>
            <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:2 }}>주간 목표 70분 ✓</div>
          </div>
        </div>

        {/* Weekly bars */}
        <div style={{ marginTop:18, background:"#fff", padding:"18px 18px", borderRadius:22, border:"1px solid rgba(46,16,101,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14 }}>일별 학습 시간</div>
            <span className="sb-chip" style={{ background:"#EDE9FE", color:"#6D28D9" }}>지난 7일</span>
          </div>
          <div style={{ marginTop:14, height:90, display:"flex", alignItems:"flex-end", gap:8 }}>
            {weekData.map((v,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:"100%", height:`${v*100}%`, background: i===3?"linear-gradient(180deg,#F43F5E,#FB7185)":"linear-gradient(180deg,#A78BFA,#7C3AED)", borderRadius:6, boxShadow: i===3?"0 4px 10px rgba(244,63,94,0.35)":"none" }}/>
                <div style={{ fontSize:9, color:"var(--ink-3)", fontFamily:"var(--f-sans)", fontWeight:700 }}>{["월","화","수","목","금","토","일"][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject progress */}
        <div style={{ marginTop:16, flex:1 }}>
          <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14, marginBottom:10 }}>과목별 숙련도</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {subjects.map(s=>(
              <div key={s.name} style={{ background:"#fff", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, border:"1px solid rgba(46,16,101,0.06)" }}>
                <div style={{ width:34, height:34, borderRadius:10, background:s.c, color:"#fff", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:13 }}>{s.name[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontFamily:"var(--f-sans)", fontWeight:700 }}>
                    <span>{s.name}</span>
                    <span style={{ color:"var(--ink-3)" }}>{s.pct}% <span style={{ color:"#10B981", marginLeft:4 }}>{s.trend}</span></span>
                  </div>
                  <div style={{ marginTop:6, height:6, background:"#F3ECFF", borderRadius:999, overflow:"hidden" }}>
                    <div style={{ width:`${s.pct}%`, height:"100%", background:s.c, borderRadius:999 }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.ResultScreen = ResultScreen;
window.LevelIntro = LevelIntro;
window.ParentDashboard = ParentDashboard;
