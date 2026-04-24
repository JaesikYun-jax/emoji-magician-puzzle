/* CREATIVITY — 한붓그리기 (Hamiltonian path) */
function CreativityGame() {
  // 5x5 grid of nodes, with path drawn through some of them
  const nodes = [];
  for (let r=0;r<5;r++) for (let c=0;c<5;c++) nodes.push({ r, c });
  const visited = new Set(["0,0","0,1","1,1","1,0","2,0","2,1","2,2","1,2","0,2","0,3"]);
  const current = "0,3";
  const path = [[0,0],[0,1],[1,1],[1,0],[2,0],[2,1],[2,2],[1,2],[0,2],[0,3]];

  return (
    <div className="sb-phone sb-noise" style={{
      background:"linear-gradient(165deg, #7C2D12 0%, #C2410C 55%, #F97316 100%)"
    }}>
      <Chrome dark/>
      <GameHud time="1:52" score={720} progress={0.62}/>

      <div style={{ position:"absolute", top:128, left:22, right:22, color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div className="sb-eyebrow" style={{ color:"#FDE68A" }}>Draw without lifting</div>
            <div className="sb-display" style={{ fontSize:26, marginTop:4 }}>모든 점을 <em style={{ color:"#FDE68A" }}>한번에</em></div>
          </div>
          <span className="sb-chip" style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>10 / 25</span>
        </div>

        {/* Board */}
        <div style={{ marginTop:18, position:"relative", aspectRatio:"1/1", background:"rgba(255,255,255,0.08)", border:"1.5px solid rgba(255,255,255,0.24)", borderRadius:28, padding:18, backdropFilter:"blur(14px)" }}>
          <svg viewBox="0 0 100 100" style={{ position:"absolute", inset:18, width:"calc(100% - 36px)", height:"calc(100% - 36px)" }}>
            {/* path line */}
            <polyline
              points={path.map(([r,c])=>`${c*22.5+5},${r*22.5+5}`).join(" ")}
              fill="none" stroke="#FDE68A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter:"drop-shadow(0 0 8px rgba(253,230,138,0.7))" }}
            />
          </svg>
          <div style={{ position:"relative", display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:0, width:"100%", height:"100%" }}>
            {nodes.map(({r,c},i) => {
              const key = `${r},${c}`;
              const isVisited = visited.has(key);
              const isCurrent = key === current;
              return (
                <div key={i} style={{ display:"grid", placeItems:"center" }}>
                  <div style={{
                    width:24, height:24, borderRadius:"50%",
                    background: isCurrent ? "#FDE68A" : isVisited ? "#FB923C" : "rgba(255,255,255,0.18)",
                    border: isCurrent ? "3px solid #fff" : isVisited ? "none" : "1.5px solid rgba(255,255,255,0.35)",
                    boxShadow: isCurrent ? "0 0 0 5px rgba(253,230,138,0.35)" : isVisited ? "0 2px 8px rgba(251,146,60,0.55)" : "none",
                    transition:"all 150ms"
                  }}/>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop:16, display:"flex", gap:10 }}>
          <div style={{ flex:1, background:"rgba(0,0,0,0.25)", borderRadius:16, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>⭐</span>
            <div>
              <div style={{ fontFamily:"var(--f-sans)", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", opacity:0.7 }}>별 3개 조건</div>
              <div style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14 }}>15번의 움직임</div>
            </div>
          </div>
          <button style={{ width:48, height:48, borderRadius:16, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", display:"grid", placeItems:"center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      <div style={{ position:"absolute", bottom:30, left:22, right:22, display:"flex", gap:10 }}>
        <button style={{ flex:1, background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:700 }}>↶ 한 수 무르기</button>
        <button style={{ flex:1, background:"#FDE68A", color:"#7C2D12", border:"none", borderRadius:18, padding:"14px", fontFamily:"var(--f-sans)", fontWeight:800 }}>다시 시작</button>
      </div>
    </div>
  );
}

window.CreativityGame = CreativityGame;
