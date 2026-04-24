// Status bar + notch + home indicator
function Chrome({ dark = false, time = "9:41" }) {
  const col = dark ? "#fff" : "#1A0B3E";
  return (
    <>
      <div className="sb-status" style={{ color: col }}>
        <span>{time}</span>
        <span className="sb-dots">
          {/* signal */}
          <svg width="18" height="12" viewBox="0 0 18 12" fill={col}>
            <rect x="0" y="8" width="3" height="4" rx="0.5"/>
            <rect x="5" y="5" width="3" height="7" rx="0.5"/>
            <rect x="10" y="2" width="3" height="10" rx="0.5"/>
            <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.35"/>
          </svg>
          {/* wifi */}
          <svg width="15" height="12" viewBox="0 0 15 12" fill={col}>
            <path d="M7.5 1C5 1 2.5 2 0.5 3.5L7.5 11L14.5 3.5C12.5 2 10 1 7.5 1Z" opacity="0.95"/>
          </svg>
          {/* battery */}
          <svg width="26" height="12" viewBox="0 0 26 12">
            <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke={col} strokeOpacity="0.5"/>
            <rect x="2" y="2" width="18" height="8" rx="1.5" fill={col}/>
            <rect x="23" y="4" width="2" height="4" rx="1" fill={col} opacity="0.5"/>
          </svg>
        </span>
      </div>
      <div className="sb-notch"/>
      <div className="sb-home" style={{ color: col }}/>
    </>
  );
}
window.Chrome = Chrome;
