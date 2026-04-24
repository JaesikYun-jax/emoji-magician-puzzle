/* ============== HOME A — "사교육비 박살" 브랜드 랜딩 ============== */

/* New logo mark — hammer breaking a bill stack, abstracted */
function LogoMark({ size=32 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <defs>
        <linearGradient id="lm-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDE68A"/>
          <stop offset="1" stopColor="#FB7185"/>
        </linearGradient>
      </defs>
      {/* brain + spark hybrid */}
      <path d="M20 6 C 13 6 9 10 9 16 C 9 19 10 21 12 23 C 11 25 11 28 13 30 C 15 32 18 32 20 30 C 22 32 25 32 27 30 C 29 28 29 25 28 23 C 30 21 31 19 31 16 C 31 10 27 6 20 6 Z"
            fill="url(#lm-a)" stroke="#2E1065" strokeWidth="1.5"/>
      {/* spark cross */}
      <path d="M20 12 L22 18 L28 20 L22 22 L20 28 L18 22 L12 20 L18 18 Z" fill="#2E1065"/>
      <circle cx="30" cy="9" r="2" fill="#D9F99D"/>
    </svg>
  );
}

/* Interactive mascot — tap to burst particles, rapid-tap (7+ in 2s) triggers a frenzy */
function HeroMascot() {
  const [smashed, setSmashed] = React.useState(false);
  const [bursts, setBursts] = React.useState([]);
  const [frenzy, setFrenzy] = React.useState(0); // intensity 0-3
  const [shockwaves, setShockwaves] = React.useState([]);
  const [comboLabel, setComboLabel] = React.useState(null);
  const tapTimes = React.useRef([]);
  const frenzyTimer = React.useRef(null);

  const onTap = () => {
    const now = performance.now();
    // track tap timestamps within 2s window
    tapTimes.current = tapTimes.current.filter(t => now - t < 2000);
    tapTimes.current.push(now);
    const taps = tapTimes.current.length;

    // frenzy levels: 1=normal, 2=excited (5+), 3=wild (7+), 4=chaos (12+)
    let level = 1;
    if (taps >= 12) level = 4;
    else if (taps >= 7) level = 3;
    else if (taps >= 5) level = 2;
    setFrenzy(level);
    clearTimeout(frenzyTimer.current);
    frenzyTimer.current = setTimeout(() => setFrenzy(0), 1500);

    // combo flash label
    if (level >= 3) {
      setComboLabel({ id: Math.random(), text: level === 4 ? "대박! 🎉" : "신난다! ✨", taps });
      setTimeout(() => setComboLabel(null), 900);
    }

    // particle count + palette scale with level
    const n = level === 4 ? 36 : level === 3 ? 26 : level === 2 ? 20 : 14;
    const chars = level >= 3
      ? ["✦","★","●","◆","▲","🎉","💥","⭐","💫","🔥"]
      : ["✦","★","●","◆","▲"];
    const colors = level >= 3
      ? ["#FDE68A","#D9F99D","#FB7185","#A78BFA","#FFFFFF","#F97316","#34D399","#60A5FA","#F472B6"]
      : ["#FDE68A","#D9F99D","#FB7185","#A78BFA","#FFFFFF"];

    const arr = Array.from({length:n}, (_,i)=>{
      const a = (i/n)*Math.PI*2 + Math.random()*0.4;
      const d = (level === 4 ? 100 : level === 3 ? 85 : 70) + Math.random()*(level >= 3 ? 80 : 60);
      return {
        id: Math.random(),
        x: Math.cos(a)*d,
        y: Math.sin(a)*d,
        delay: Math.random()*(level >= 3 ? 60 : 120),
        char: chars[Math.floor(Math.random()*chars.length)],
        color: colors[Math.floor(Math.random()*colors.length)],
        size: (level >= 3 ? 10 : 6) + Math.random()*(level >= 3 ? 14 : 10),
        rot: (Math.random()-0.5)*720
      };
    });
    setBursts(prev => [...prev, ...arr]);

    // shockwave ring at level >= 2
    if (level >= 2) {
      const sw = { id: Math.random(), level };
      setShockwaves(prev => [...prev, sw]);
      setTimeout(() => setShockwaves(prev => prev.filter(x => x.id !== sw.id)), 900);
    }

    setSmashed(true);
    setTimeout(()=>setSmashed(false), level >= 3 ? 200 : 400);
    setTimeout(()=>{
      setBursts(prev => prev.filter(b => !arr.includes(b)));
    }, 1700);
  };

  // Wobble intensity based on frenzy
  const wobbleClass = frenzy >= 4 ? "sb-mascot-chaos" : frenzy >= 3 ? "sb-mascot-wild" : frenzy >= 2 ? "sb-mascot-excited" : "";
  const smileD = frenzy >= 3
    ? "M96 146 Q 120 176 144 146"   // huge grin
    : smashed
      ? "M100 150 Q 120 168 140 150"
      : "M104 148 Q 120 158 136 148";

  return (
    <div style={{ position:"relative", width:240, height:240, cursor:"pointer" }} onClick={onTap}>
      <style>{`
        @keyframes sb-shockwave {
          0% { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.3); opacity: 0; }
        }
        @keyframes sb-mascot-shake-2 {
          0%,100% { transform: scale(1) rotate(0); }
          25% { transform: scale(1.04) rotate(-3deg); }
          75% { transform: scale(1.04) rotate(3deg); }
        }
        @keyframes sb-mascot-shake-3 {
          0%,100% { transform: scale(1.06) rotate(0); }
          20% { transform: scale(1.1) rotate(-8deg); }
          50% { transform: scale(1.08) rotate(6deg); }
          80% { transform: scale(1.1) rotate(-4deg); }
        }
        @keyframes sb-mascot-shake-4 {
          0% { transform: scale(1.1) rotate(0); }
          15% { transform: scale(1.15) rotate(-14deg); }
          30% { transform: scale(1.08) rotate(12deg); }
          45% { transform: scale(1.18) rotate(-10deg); }
          60% { transform: scale(1.1) rotate(8deg); }
          80% { transform: scale(1.14) rotate(-6deg); }
          100% { transform: scale(1.1) rotate(0); }
        }
        .sb-mascot-excited { animation: sb-mascot-shake-2 400ms ease; }
        .sb-mascot-wild { animation: sb-mascot-shake-3 450ms ease; }
        .sb-mascot-chaos { animation: sb-mascot-shake-4 600ms ease; }
        @keyframes sb-combo-pop {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1) translateY(-40px); opacity: 0; }
        }
        @keyframes sb-burst-full {
          0%{ transform: translate(-50%,-50%) translate(0,0) scale(0.2) rotate(0); opacity:0 }
          15%{ opacity:1 }
          100%{ transform: translate(-50%,-50%) translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot,0deg)); opacity:0 }
        }
      `}</style>

      {/* soft halo — pulses faster on frenzy */}
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%",
        background: frenzy >= 3
          ? "radial-gradient(circle, rgba(251,113,133,0.45), rgba(253,230,138,0.25) 40%, transparent 65%)"
          : "radial-gradient(circle, rgba(253,230,138,0.35), transparent 60%)",
        animation: `sb-halo ${frenzy >= 3 ? 0.6 : 3}s ease-in-out infinite`,
        transition: "background 300ms"
      }}/>

      {/* shockwave rings */}
      {shockwaves.map(sw => (
        <div key={sw.id} style={{
          position:"absolute", left:"50%", top:"50%",
          width: 180, height: 180, marginLeft:-90, marginTop:-90,
          borderRadius:"50%",
          border: `3px solid ${sw.level >= 3 ? "#FB7185" : "#FDE68A"}`,
          animation: "sb-shockwave 900ms ease-out forwards",
          pointerEvents:"none"
        }}/>
      ))}

      {/* orbit ring */}
      <svg viewBox="0 0 240 240" style={{ position:"absolute", inset:0, animation:`sb-orbit ${frenzy >= 3 ? 6 : 30}s linear infinite`, transition:"opacity 300ms" }}>
        <ellipse cx="120" cy="120" rx="100" ry="40" fill="none" stroke="rgba(255,255,255,0.22)" strokeDasharray="2 5"/>
      </svg>

      {/* Character SVG */}
      <svg
        viewBox="-20 -40 280 300" width="240" height="240"
        className={wobbleClass}
        style={{ position:"absolute", inset:"-20px 0 0 0", transition:"transform 200ms", transform: smashed && frenzy < 2 ? "scale(0.92)" : "scale(1)", transformOrigin:"center", overflow:"visible" }}
      >
        <defs>
          <radialGradient id="body-grad" cx="0.35" cy="0.35">
            <stop offset="0" stopColor="#FDE68A"/>
            <stop offset="0.7" stopColor="#FBBF24"/>
            <stop offset="1" stopColor="#F97316"/>
          </radialGradient>
        </defs>
        <circle cx="120" cy="124" r="78" fill="url(#body-grad)" stroke="#2E1065" strokeWidth="3.5"/>
        {/* eyes — hearts on frenzy 4 */}
        <g style={{ transition:"transform 180ms", transform: smashed && frenzy < 3 ? "scaleY(0.1)" : "scaleY(1)", transformOrigin:"120px 120px" }}>
          {frenzy >= 4 ? (
            <>
              <path d="M96 110 C 88 102 82 110 88 118 C 90 122 96 126 96 126 C 96 126 102 122 104 118 C 110 110 104 102 96 110 Z" fill="#FB7185"/>
              <path d="M144 110 C 136 102 130 110 136 118 C 138 122 144 126 144 126 C 144 126 150 122 152 118 C 158 110 152 102 144 110 Z" fill="#FB7185"/>
            </>
          ) : (
            <>
              <ellipse cx="96" cy="118" rx="10" ry={frenzy >= 3 ? 14 : 12} fill="#2E1065"/>
              <ellipse cx="144" cy="118" rx="10" ry={frenzy >= 3 ? 14 : 12} fill="#2E1065"/>
              <circle cx="99" cy="115" r="3" fill="#fff"/>
              <circle cx="147" cy="115" r="3" fill="#fff"/>
            </>
          )}
        </g>
        <circle cx="82" cy="142" r={frenzy >= 3 ? 10 : 7} fill="#FB7185" opacity={frenzy >= 3 ? 0.9 : 0.7}/>
        <circle cx="158" cy="142" r={frenzy >= 3 ? 10 : 7} fill="#FB7185" opacity={frenzy >= 3 ? 0.9 : 0.7}/>
        <path d={smileD} stroke="#2E1065" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        {/* anglerfish-style hair strand with lightbulb idea — grows on frenzy */}
        <g style={{ transformOrigin:"120px 46px", transform: frenzy >= 3 ? "scale(1.15)" : "scale(1)", transition:"transform 250ms" }}>
          {/* the hair strand — starts at top of head, curves up and forward */}
          <path
            d="M120 46 Q 118 30 126 18 Q 136 6 150 6"
            stroke="#2E1065" strokeWidth="3" fill="none" strokeLinecap="round"
          />
          {/* glow behind bulb */}
          <circle cx="150" cy="6" r="13" fill="#FDE68A" opacity="0.35"/>
          <circle cx="150" cy="6" r="18" fill="#FDE68A" opacity="0.18"/>
          {/* the bulb */}
          <circle cx="150" cy="6" r="8" fill="#FDE68A" stroke="#2E1065" strokeWidth="2.2"/>
          {/* bulb filament / sparkle highlight */}
          <path d="M147 6 L150 3 L153 6 L150 9 Z" fill="#2E1065" opacity="0.35"/>
          <circle cx="147" cy="3" r="1.8" fill="#fff" opacity="0.9"/>
          {/* tiny twinkle rays when frenzy */}
          {frenzy >= 2 && (
            <g stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity={frenzy >= 3 ? 1 : 0.7}>
              <line x1="150" y1="-6" x2="150" y2="-10"/>
              <line x1="162" y1="6" x2="166" y2="6"/>
              <line x1="141" y1="-3" x2="138" y2="-6"/>
              <line x1="159" y1="-3" x2="162" y2="-6"/>
            </g>
          )}
        </g>
      </svg>

      {/* particles */}
      {bursts.map(b=>(
        <span key={b.id} style={{
          position:"absolute", left:"50%", top:"50%",
          color: b.color, fontSize: b.size+6, fontWeight:900,
          textShadow:"0 0 8px currentColor",
          animation: `sb-burst-full 1200ms ${b.delay}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
          ["--tx"]: `${b.x}px`,
          ["--ty"]: `${b.y}px`,
          ["--rot"]: `${b.rot||0}deg`,
          pointerEvents:"none"
        }}>{b.char}</span>
      ))}

      {/* combo label */}
      {comboLabel && (
        <div key={comboLabel.id} style={{
          position:"absolute", left:"50%", top:"30%",
          fontFamily:"var(--f-display)", fontWeight:800, fontSize:28,
          color:"#FDE68A", textShadow:"0 2px 20px rgba(251,113,133,0.8), 0 0 12px rgba(253,230,138,0.9)",
          whiteSpace:"nowrap", pointerEvents:"none",
          animation:"sb-combo-pop 900ms ease-out forwards"
        }}>
          {comboLabel.text}
        </div>
      )}

      <div style={{
        position:"absolute", bottom:-14, left:"50%", transform:"translateX(-50%)",
        fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase",
        color:"rgba(255,255,255,0.55)", fontWeight:700, whiteSpace:"nowrap"
      }}>
        ✦ tap me
      </div>
    </div>
  );
}

/* Subject symbol icons — drawn to echo the mascot's ink-line style (stroke #2E1065) */
function SubjectIcon({ id, color }) {
  const common = { stroke:"#2E1065", strokeWidth:2.6, strokeLinecap:"round", strokeLinejoin:"round", fill:"none" };
  switch(id) {
    case "math": // abacus-like dots
      return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
          <circle cx="20" cy="20" r="17" fill={color}/>
          <line x1="10" y1="14" x2="30" y2="14" {...common}/>
          <line x1="10" y1="26" x2="30" y2="26" {...common}/>
          <circle cx="14" cy="14" r="2.6" fill="#2E1065"/>
          <circle cx="20" cy="14" r="2.6" fill="#FDE68A" stroke="#2E1065" strokeWidth="2"/>
          <circle cx="26" cy="14" r="2.6" fill="#2E1065"/>
          <circle cx="14" cy="26" r="2.6" fill="#FDE68A" stroke="#2E1065" strokeWidth="2"/>
          <circle cx="22" cy="26" r="2.6" fill="#2E1065"/>
        </svg>
      );
    case "english": // speech bubble with dots (talk)
      return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
          <circle cx="20" cy="20" r="17" fill={color}/>
          <path d="M11 15 Q11 11 15 11 H26 Q30 11 30 15 V21 Q30 25 26 25 H20 L15 29 V25 Q11 25 11 21 Z" fill="#FAF7F2" stroke="#2E1065" strokeWidth="2.4" strokeLinejoin="round"/>
          <circle cx="16" cy="18" r="1.5" fill="#2E1065"/>
          <circle cx="20.5" cy="18" r="1.5" fill="#2E1065"/>
          <circle cx="25" cy="18" r="1.5" fill="#2E1065"/>
        </svg>
      );
    case "korean": // 가 letter stylized as blocks
      return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
          <circle cx="20" cy="20" r="17" fill={color}/>
          <rect x="11" y="11" width="8" height="18" rx="1.5" fill="#FAF7F2" stroke="#2E1065" strokeWidth="2.4"/>
          <path d="M22 11 L22 29" {...common} strokeWidth="3"/>
          <path d="M22 20 L29 20" {...common} strokeWidth="3"/>
        </svg>
      );
    case "logic": // interlocking tangram-ish shapes
      return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
          <circle cx="20" cy="20" r="17" fill={color}/>
          <path d="M11 11 L22 11 L22 22 Z" fill="#FDE68A" stroke="#2E1065" strokeWidth="2.4" strokeLinejoin="round"/>
          <rect x="22" y="11" width="8" height="8" rx="1.4" fill="#FAF7F2" stroke="#2E1065" strokeWidth="2.4"/>
          <circle cx="16" cy="26" r="4.5" fill="#FAF7F2" stroke="#2E1065" strokeWidth="2.4"/>
          <path d="M22 22 L30 22 L30 30 L22 30 Z" fill="#FDE68A" stroke="#2E1065" strokeWidth="2.4" strokeLinejoin="round" transform="rotate(45 26 26)"/>
        </svg>
      );
    case "creative": // spark/star drawn with a loop
      return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
          <circle cx="20" cy="20" r="17" fill={color}/>
          <path d="M20 9 Q23 17 31 20 Q23 23 20 31 Q17 23 9 20 Q17 17 20 9 Z" fill="#FDE68A" stroke="#2E1065" strokeWidth="2.4" strokeLinejoin="round"/>
          <circle cx="20" cy="20" r="2" fill="#2E1065"/>
        </svg>
      );
    default: return null;
  }
}

/* Orbiting subject — uniform radius + duration, offset via CSS var so all orbs stay 72° apart */
function SubjectOrb({ id, color, angle=0, duration=44, radius=140 }) {
  const [wiggle, setWiggle] = React.useState(false);
  return (
    <button
      onClick={(e)=>{ e.stopPropagation(); setWiggle(true); setTimeout(()=>setWiggle(false), 600); }}
      aria-label={id}
      style={{
        position:"absolute", left:"50%", top:"50%",
        width:48, height:48, margin:"-24px 0 0 -24px",
        animation: `sb-orbit-${angle} ${duration}s linear infinite`,
        background:"none", border:"none", padding:0, cursor:"pointer",
      }}>
      <div style={{
        width:"100%", height:"100%",
        animation: wiggle ? "sb-wiggle 500ms ease" : "none",
        filter: `drop-shadow(0 4px 14px ${color}88)`,
        display:"grid", placeItems:"center",
      }}>
        <SubjectIcon id={id} color={color}/>
      </div>
    </button>
  );
}

function HomeA() {
  const scrollRef = React.useRef(null);
  return (
    <div className="sb-phone sb-noise sb-home-a" style={{
      background: "linear-gradient(165deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%)",
      color: "#fff",
      overflow:"hidden"
    }}>
      <style>{`
        @keyframes sb-halo { 0%,100%{ transform:scale(1); opacity:0.7 } 50%{ transform:scale(1.1); opacity:1 } }
        @keyframes sb-orbit { from{ transform:rotate(0) } to{ transform:rotate(360deg) } }
        @keyframes sb-burst {
          0%{ transform: translate(-50%,-50%) translate(0,0) scale(0.2); opacity:0 }
          20%{ opacity:1 }
          100%{ transform: translate(-50%,-50%) translate(var(--tx), var(--ty)) scale(1); opacity:0 }
        }
        @keyframes sb-wiggle {
          0%,100%{ transform: rotate(0) scale(1) }
          20%{ transform: rotate(-12deg) scale(1.15) }
          40%{ transform: rotate(10deg) scale(1.1) }
          60%{ transform: rotate(-6deg) scale(1.08) }
          80%{ transform: rotate(3deg) scale(1.04) }
        }
        /* Generated per start-angle so each orb sits 72° apart on the ring.
           All orbs share the same duration so spacing stays perfectly uniform. */
        ${[0,72,144,216,288].map(a=>`
          @keyframes sb-orbit-${a} {
            from { transform: rotate(${a}deg) translate(140px) rotate(-${a}deg); }
            to   { transform: rotate(${360+a}deg) translate(140px) rotate(-${360+a}deg); }
          }
        `).join("")}
        .sb-home-a .sb-hero-scroll {
          position: absolute; inset: 0;
          overflow-y: auto; overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          z-index: 1;
        }
        .sb-home-a .sb-hero-scroll::-webkit-scrollbar { display:none; }
        .sb-home-a .sb-status, .sb-home-a .sb-notch, .sb-home-a .sb-home { z-index: 5; pointer-events: none; }
        @keyframes sb-bob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(6px) } }
      `}</style>

      <Chrome dark/>

      <div className="sb-hero-scroll" ref={scrollRef}>
        {/* ========== HERO ========== */}
        <section style={{ position:"relative", height:844, padding:"64px 30px 0", display:"flex", flexDirection:"column" }}>
          {/* top row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative", zIndex:3 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <LogoMark size={30}/>
              <span style={{ fontFamily:"var(--f-display)", fontSize:18, fontWeight:800, letterSpacing:"-0.02em" }}>사박</span>
            </div>
            <button className="sb-chip" style={{ background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.22)", color:"#fff" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#D9F99D", boxShadow:"0 0 8px #D9F99D" }}/>
              KO
            </button>
          </div>

          {/* eyebrow */}
          <span className="sb-eyebrow" style={{ color:"#D9F99D", marginTop:30, justifyContent:"center" }}>
            사 · 교 · 육 · 비 · 박 · 살
          </span>

          {/* headline */}
          <h1 className="sb-display" style={{ fontSize:48, marginTop:14, textAlign:"center", lineHeight:1.02 }}>
            학원비는 <em style={{ color:"#FB7185" }}>박살</em>,<br/>
            두뇌는 <em style={{ color:"#FDE68A" }}>쑥쑥</em>
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.70)", lineHeight:1.6, marginTop:14, textAlign:"center", maxWidth:300, marginInline:"auto" }}>
            하루 5분 미니게임으로 수학·영어·국어·논리·창의를 모두.
          </p>

          {/* Interactive mascot + orbiting subject orbs */}
          <div style={{ flex:1, position:"relative", display:"grid", placeItems:"center", marginTop:8 }}>
            <HeroMascot/>
            <SubjectOrb id="math"     color="#7DD3FC" angle={0}   duration={44}/>
            <SubjectOrb id="english"  color="#86EFAC" angle={72}  duration={44}/>
            <SubjectOrb id="korean"   color="#FDA4AF" angle={144} duration={44}/>
            <SubjectOrb id="logic"    color="#A5B4FC" angle={216} duration={44}/>
            <SubjectOrb id="creative" color="#FDBA74" angle={288} duration={44}/>
          </div>

          {/* CTA — centered text, flush arrow on right */}
          <div style={{ padding:"0 0 22px", position:"relative", zIndex:3 }}>
            <button style={{
              width:"100%", background:"#FAF7F2", color:"#2E1065",
              border:"none", borderRadius:999, padding:"20px 32px",
              fontFamily:"var(--f-sans)", fontWeight:800, fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative", cursor:"pointer",
              boxShadow:"0 12px 36px rgba(217,249,157,0.35), inset 0 -2px 0 rgba(0,0,0,0.08)"
            }}>
              <span>사박 시작하기</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ position:"absolute", right:26 }}>
                <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* scroll hint */}
            <button
              onClick={()=>scrollRef.current?.scrollTo({ top: 844, behavior:"smooth" })}
              style={{ marginTop:16, width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, color:"rgba(255,255,255,0.6)", animation:"sb-bob 2s ease-in-out infinite" }}>
              <span style={{ fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700 }}>왜 사박일까?</span>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M1 1l8 7 8-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </section>

        {/* ========== SECTION 2 — WHY (사교육비 박살) ========== */}
        <section style={{ padding:"100px 30px", background:"linear-gradient(180deg, #1A0B3E 0%, #0F0529 100%)" }}>
          <span className="sb-eyebrow" style={{ color:"#FB7185" }}>문제</span>
          <h2 className="sb-display" style={{ fontSize:34, marginTop:14 }}>
            <em style={{ color:"#FB7185" }}>월 38만원</em><br/>
            학원비, 정말 필요해요?
          </h2>
          <div style={{ marginTop:30, display:"grid", gap:14 }}>
            {[
              { big:"73%", text:"초등생 학부모가 \"사교육비 부담 크다\"고 답함" },
              { big:"5분", text:"하루 5분 게임 학습이 집중력·기억력 향상에 효과적 (Oxford, 2023)" },
              { big:"1/40", text:"사박 구독료는 학원비의 <span style=\"color:#FDE68A\">40분의 1</span>" }
            ].map((s,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"20px 22px", display:"flex", alignItems:"center", gap:18, backdropFilter:"blur(14px)" }}>
                <div className="sb-display" style={{ fontSize:32, color:"#FDE68A", flexShrink:0, minWidth:72 }}>{s.big}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.55 }} dangerouslySetInnerHTML={{__html: s.text}}/>
              </div>
            ))}
          </div>
        </section>

        {/* ========== SECTION 3 — 5 SUBJECTS × GAME PREVIEWS ========== */}
        <section style={{ padding:"90px 0 100px", background:"#FAF7F2", color:"#1A0B3E", overflow:"hidden" }}>
          <div style={{ padding:"0 30px" }}>
            <span className="sb-eyebrow" style={{ color:"#6D28D9" }}>다섯 과목 · 200+ 미니게임</span>
            <h2 className="sb-display" style={{ fontSize:38, marginTop:14, color:"#1A0B3E", lineHeight:1.05 }}>
              기본기는 <em style={{ color:"#6D28D9" }}>탄탄</em>하게<br/>
              학습은 <em style={{ color:"#F43F5E" }}>게임</em>으로
            </h2>
            <p style={{ fontSize:13, color:"#6B5B7D", marginTop:12, lineHeight:1.6, maxWidth:320 }}>
              연산, 파닉스, 자모, 패턴, 창의 — 학교에서 꼭 필요한 다섯 가지 기본기를 아이가 자기도 모르게 익힙니다.
            </p>
          </div>

          {/* Subject game previews — horizontal snap scroller */}
          <div style={{
            marginTop:32,
            display:"flex", gap:14, padding:"8px 30px 24px",
            overflowX:"auto", scrollSnapType:"x mandatory",
            scrollbarWidth:"none"
          }}>
            <style>{`.sb-home-a section > div::-webkit-scrollbar{display:none}`}</style>
            {[
              {
                id:"math", n:"수리 수학", tagline:"연산이 재미있어지는 순간",
                skills:["한 자리 덧·뺄","두 자리 계산","구구단","수 패턴"],
                bg:"linear-gradient(160deg,#0369A1 0%,#0EA5E9 100%)",
                demo:(
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
                    {[7,14,21,3,18,5].map((n,i)=>(
                      <div key={i} style={{
                        width:44, height:56, borderRadius:10,
                        background: [7,21].includes(n)?"#FDE68A":"rgba(255,255,255,0.92)",
                        color:"#0C4A6E",
                        display:"grid", placeItems:"center",
                        fontFamily:"var(--f-display)", fontWeight:800, fontSize:22,
                        boxShadow:"0 6px 14px rgba(0,0,0,0.2)",
                        border: [7,21].includes(n)?"2px solid #FFF":"none",
                        transform:`rotate(${(i%2?3:-3)}deg)`
                      }}>{n}</div>
                    ))}
                  </div>
                ),
                caption:"합이 28인 카드 두 장을 찾아봐요"
              },
              {
                id:"english", n:"영어", tagline:"그림으로 배우는 단어",
                skills:["사이트워드 120","파닉스","짧은 문장","발음"],
                bg:"linear-gradient(160deg,#047857 0%,#10B981 100%)",
                demo:(
                  <div style={{ display:"flex", alignItems:"center", gap:18, justifyContent:"center" }}>
                    <div style={{ fontSize:68, filter:"drop-shadow(0 4px 10px rgba(0,0,0,0.25))" }}>🍎</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {["apple","bear","milk"].map((w,i)=>(
                        <div key={w} style={{
                          background: i===0 ? "#FDE68A" : "rgba(255,255,255,0.92)",
                          color: i===0 ? "#064E3B" : "#065F46",
                          padding:"6px 14px", borderRadius:999,
                          fontFamily:"var(--f-display)", fontWeight:800, fontSize:14,
                          boxShadow:"0 4px 10px rgba(0,0,0,0.15)",
                          border: i===0 ? "2px solid #fff" : "none"
                        }}>{w}</div>
                      ))}
                    </div>
                  </div>
                ),
                caption:"그림에 맞는 단어를 골라요"
              },
              {
                id:"korean", n:"국어", tagline:"자모에서 읽기까지",
                skills:["자모 14개","받침","어휘","짧은 문장"],
                bg:"linear-gradient(160deg,#9F1239 0%,#F43F5E 100%)",
                demo:(
                  <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center" }}>
                    <div style={{ width:56, height:56, borderRadius:14, background:"#FFE4E6", color:"#9F1239", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:36 }}>ㄱ</div>
                    <div style={{ fontSize:22, color:"#fff", opacity:0.7 }}>+</div>
                    <div style={{ width:56, height:56, borderRadius:14, background:"rgba(255,255,255,0.18)", border:"2px dashed rgba(255,255,255,0.7)", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:36, color:"rgba(255,255,255,0.7)" }}>?</div>
                    <div style={{ fontSize:22, color:"#fff", opacity:0.7 }}>=</div>
                    <div style={{ width:56, height:56, borderRadius:14, background:"#FDE68A", color:"#9F1239", display:"grid", placeItems:"center", fontFamily:"var(--f-display)", fontWeight:800, fontSize:36, border:"2px solid #fff" }}>가</div>
                  </div>
                ),
                caption:"자모를 조합해 글자를 만들어요"
              },
              {
                id:"logic", n:"논리", tagline:"규칙을 찾는 즐거움",
                skills:["패턴 잇기","순서 추리","분류","관계"],
                bg:"linear-gradient(160deg,#3730A3 0%,#6366F1 100%)",
                demo:(
                  <div style={{ display:"flex", gap:10, alignItems:"center", justifyContent:"center" }}>
                    {[
                      { s:"circle", c:"#FDE68A" },
                      { s:"tri",    c:"#FB7185" },
                      { s:"circle", c:"#FDE68A" },
                      { s:"tri",    c:"#FB7185" },
                      { s:"q",      c:"transparent" }
                    ].map((x,i)=>(
                      <div key={i} style={{
                        width:40, height:40,
                        display:"grid", placeItems:"center",
                      }}>
                        {x.s==="circle" && <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:x.c, boxShadow:"0 4px 10px rgba(0,0,0,0.2)" }}/>}
                        {x.s==="tri" && <svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,4 38,36 2,36" fill={x.c}/></svg>}
                        {x.s==="q" && <div style={{ width:"100%", height:"100%", borderRadius:10, border:"2px dashed rgba(255,255,255,0.7)", display:"grid", placeItems:"center", color:"rgba(255,255,255,0.8)", fontFamily:"var(--f-display)", fontWeight:800, fontSize:22 }}>?</div>}
                      </div>
                    ))}
                  </div>
                ),
                caption:"다음에 올 모양을 찾아봐요"
              },
              {
                id:"creative", n:"창의", tagline:"한 번에 그리는 집중",
                skills:["한붓그리기","대칭","색 감각","공간"],
                bg:"linear-gradient(160deg,#C2410C 0%,#F97316 100%)",
                demo:(
                  <svg viewBox="0 0 180 100" width="200" height="110">
                    <g stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="3 3" fill="none">
                      <path d="M30 50 L60 20 L90 50 L120 20 L150 50 L120 80 L90 50 L60 80 Z"/>
                    </g>
                    <path d="M30 50 L60 20 L90 50 L120 20" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    {[{x:30,y:50},{x:60,y:20},{x:90,y:50},{x:120,y:20},{x:150,y:50},{x:120,y:80},{x:60,y:80}].map((p,i)=>(
                      <circle key={i} cx={p.x} cy={p.y} r="4" fill={i<4?"#FDE68A":"#fff"} stroke="#C2410C" strokeWidth="2"/>
                    ))}
                    <circle cx="120" cy="20" r="7" fill="none" stroke="#FDE68A" strokeWidth="2"/>
                  </svg>
                ),
                caption:"선을 떼지 않고 모든 점을 지나요"
              }
            ].map(s=>(
              <div key={s.id} style={{
                flex:"0 0 280px", scrollSnapAlign:"start",
                background:s.bg, color:"#fff",
                borderRadius:24, padding:"20px 22px 24px",
                display:"flex", flexDirection:"column",
                boxShadow:"0 16px 34px -18px rgba(46,16,101,0.45)",
                position:"relative", overflow:"hidden", minHeight:380
              }}>
                {/* backdrop glow */}
                <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.12)", filter:"blur(30px)" }}/>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
                  <SubjectIcon id={s.id} color="rgba(255,255,255,0.95)"/>
                  <span style={{ fontFamily:"var(--f-sans)", fontSize:10, fontWeight:800, letterSpacing:"0.14em", color:"rgba(255,255,255,0.75)" }}>40+ LEVELS</span>
                </div>
                <div style={{ marginTop:12, position:"relative" }}>
                  <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:22 }}>{s.n}</div>
                  <div style={{ fontFamily:"var(--f-sans)", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:4 }}>{s.tagline}</div>
                </div>

                {/* game demo area */}
                <div style={{
                  marginTop:18, padding:"26px 14px",
                  background:"rgba(0,0,0,0.22)", borderRadius:16,
                  border:"1px solid rgba(255,255,255,0.14)",
                  display:"grid", placeItems:"center",
                  position:"relative"
                }}>
                  {s.demo}
                </div>
                <div style={{ marginTop:10, fontFamily:"var(--f-sans)", fontSize:11, color:"rgba(255,255,255,0.85)", textAlign:"center", fontWeight:600 }}>
                  {s.caption}
                </div>

                {/* skill tags */}
                <div style={{ marginTop:"auto", paddingTop:16, display:"flex", flexWrap:"wrap", gap:6 }}>
                  {s.skills.map(k=>(
                    <span key={k} style={{
                      fontSize:10, fontWeight:700,
                      padding:"4px 10px", borderRadius:999,
                      background:"rgba(255,255,255,0.18)", color:"#fff",
                      border:"1px solid rgba(255,255,255,0.25)"
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* peek hint */}
            <div style={{ flex:"0 0 20px" }}/>
          </div>

          {/* swipe hint */}
          <div style={{ padding:"0 30px", display:"flex", alignItems:"center", gap:10, color:"#6B5B7D" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:800 }}>옆으로 넘겨보세요</span>
          </div>

          {/* Foundation strip */}
          <div style={{ margin:"40px 30px 0", padding:"22px 24px", background:"#1A0B3E", color:"#fff", borderRadius:24, display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"#D9F99D", color:"#1A0B3E", display:"grid", placeItems:"center", flexShrink:0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="sb-display" style={{ fontSize:16, lineHeight:1.3 }}>
                <em style={{ color:"#FDE68A" }}>교과서의 기본기</em>를<br/>
                아이 스스로 쌓아요
              </div>
              <div style={{ fontFamily:"var(--f-sans)", fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:4 }}>
                초1-6 교과 과정 기반 · 교육 전문가 감수
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 4 — 부모 안심 ========== */}
        <section style={{ padding:"100px 30px 40px", background:"linear-gradient(180deg, #FAF7F2 0%, #EDE9FE 100%)", color:"#1A0B3E" }}>
          <span className="sb-eyebrow" style={{ color:"#6D28D9" }}>부모 안심</span>
          <h2 className="sb-display" style={{ fontSize:32, marginTop:14 }}>
            학부모용 <em style={{ color:"#F43F5E" }}>리포트</em>까지
          </h2>
          <div style={{ marginTop:26, display:"grid", gap:14 }}>
            {[
              { i:"📊", t:"주간 성장 리포트", d:"과목별 숙련도·연속일수·집중시간" },
              { i:"🔒", t:"광고 없음, 결제 없음", d:"아이가 임의로 결제할 일 없어요" },
              { i:"⏰", t:"시간 제한 설정", d:"하루 10분~40분 부모가 조절" },
              { i:"🌱", t:"연령 맞춤 난이도", d:"4-6세 / 7-9세 / 10-12세 자동 조정" }
            ].map(x=>(
              <div key={x.t} style={{ display:"flex", alignItems:"center", gap:14, background:"#fff", padding:"14px 16px", borderRadius:16, border:"1px solid rgba(46,16,101,0.06)" }}>
                <span style={{ fontSize:24 }}>{x.i}</span>
                <div>
                  <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14 }}>{x.t}</div>
                  <div style={{ fontSize:11, color:"#6B5B7D", marginTop:2 }}>{x.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div style={{ marginTop:40, textAlign:"center" }}>
            <div className="sb-display" style={{ fontSize:24, color:"#2E1065" }}>
              오늘부터 <em style={{ color:"#6D28D9" }}>박살</em>
            </div>
            <button style={{
              marginTop:18, width:"100%", background:"#2E1065", color:"#fff",
              border:"none", borderRadius:999, padding:"20px 32px",
              fontFamily:"var(--f-sans)", fontWeight:800, fontSize:16,
              display:"flex", alignItems:"center", justifyContent:"center", position:"relative",
              boxShadow:"0 12px 30px rgba(46,16,101,0.35)"
            }}>
              <span>14일 무료로 시작</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ position:"absolute", right:26 }}>
                <path d="M4 10h12M11 5l5 5-5 5" stroke="#D9F99D" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ marginTop:14, fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#6B5B7D", fontWeight:700 }}>
              월 9,900원 · 언제든 해지 · 5가족까지
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============== HOME B — softer, kid-first (unchanged) ============== */
function HomeB() {
  return (
    <div className="sb-phone" style={{
      background: "linear-gradient(180deg, #FFF1DC 0%, #FFE3E3 50%, #E9D5FF 100%)"
    }}>
      <Chrome/>
      <div style={{ position:"relative", padding:"56px 26px 0", height:"100%", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <LogoMark size={36}/>
            <span style={{ fontFamily:"var(--f-display)", fontSize:20, fontWeight:800 }}>사박</span>
          </div>
          <button style={{ width:40, height:40, borderRadius:14, background:"#fff", border:"1px solid rgba(46,16,101,0.10)", color:"var(--ink)", display:"grid", placeItems:"center" }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 8h10M5 12h10M5 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ marginTop: 18, position:"relative", background:"#fff", borderRadius:32, padding:"26px 22px 20px", boxShadow:"0 20px 50px -20px rgba(46,16,101,0.25)" }}>
          <span className="sb-eyebrow" style={{ color:"#6D28D9" }}>오늘의 도전 · Day 12</span>
          <h2 className="sb-display" style={{ fontSize:30, marginTop:12 }}>
            안녕, <em style={{ color:"#F43F5E" }}>지우야!</em>
          </h2>
          <p style={{ fontSize:13, color:"var(--ink-3)", marginTop:6 }}>오늘도 같이 두뇌 퍼즐 풀어볼까?</p>

          <div style={{ marginTop:16, height:12, background:"#F3ECFF", borderRadius:999, overflow:"hidden", position:"relative" }}>
            <div style={{ width:"64%", height:"100%", background:"linear-gradient(90deg,#A78BFA,#F43F5E)", borderRadius:999 }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontFamily:"var(--f-sans)", fontSize:11, fontWeight:700, color:"var(--ink-3)", letterSpacing:"0.1em" }}>
            <span>XP 128 / 200</span><span>다음 배지까지</span>
          </div>

          <div style={{ position:"absolute", top:-42, right:8 }}>
            <svg width="110" height="110" viewBox="0 0 120 120">
              <circle cx="60" cy="62" r="44" fill="#FDE68A"/>
              <circle cx="60" cy="62" r="44" fill="none" stroke="#2E1065" strokeWidth="3"/>
              <circle cx="48" cy="58" r="4" fill="#2E1065"/>
              <circle cx="72" cy="58" r="4" fill="#2E1065"/>
              <path d="M50 74 Q60 82 70 74" stroke="#2E1065" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <circle cx="40" cy="70" r="3" fill="#FB7185" opacity="0.6"/>
              <circle cx="80" cy="70" r="3" fill="#FB7185" opacity="0.6"/>
              <path d="M30 26 L36 38 M 90 26 L 84 38" stroke="#2E1065" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div style={{ marginTop:18, background:"#2E1065", borderRadius:28, padding:"22px 22px", color:"#fff", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"#6D28D9", filter:"blur(30px)", opacity:0.6 }}/>
          <div style={{ position:"relative" }}>
            <span className="sb-chip" style={{ background:"rgba(217,249,157,0.18)", color:"#D9F99D" }}>이어하기</span>
            <h3 className="sb-display" style={{ fontSize:22, marginTop:10 }}>수리 · 두 자리 <em style={{ color:"#FDE68A" }}>덧셈</em></h3>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:6 }}>레벨 7 / 12 · 별 ★★☆</p>
            <button className="sb-btn" style={{ marginTop:16, background:"#D9F99D", color:"#2E1065" }}>
              계속하기
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <div style={{ marginTop:"auto", marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
            {[
              { label:"수학", c:"#0EA5E9", e:"🔢" },
              { label:"영어", c:"#10B981", e:"🔤" },
              { label:"국어", c:"#F43F5E", e:"📚" },
              { label:"논리", c:"#6366F1", e:"🧩" },
              { label:"창의", c:"#F97316", e:"🎨" }
            ].map(s => (
              <button key={s.label} style={{ flex:1, background:"#fff", border:"none", borderRadius:20, padding:"14px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:6, boxShadow:"0 8px 20px -10px rgba(46,16,101,0.25)" }}>
                <span style={{ width:36, height:36, borderRadius:12, background:`${s.c}18`, display:"grid", placeItems:"center", fontSize:18 }}>{s.e}</span>
                <span style={{ fontSize:11, fontWeight:700 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.LogoMark = LogoMark;
window.HomeA = HomeA;
window.HomeB = HomeB;
