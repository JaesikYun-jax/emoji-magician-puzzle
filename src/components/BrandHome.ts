import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';

/* =========================================================================
   BrandHome — Sabak "사교육비 박살" HomeA
   Ported from Sabak Design /components/Home.jsx (HomeA)
   ========================================================================= */

const BRAND_HOME_STYLE = `
#brand-home {
  position: fixed; inset: 0;
  overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  z-index: 20;
  font-family: var(--f-kr);
  color: #fff;
  background: #2E1065;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
#brand-home::-webkit-scrollbar { display: none; }
#brand-home .bh-root { width: 100%; max-width: 520px; margin: 0 auto; position: relative; }

/* ───── Hero ───── */
.bh-hero {
  position: relative;
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top, 0px) + 56px) 30px 22px;
  display: flex; flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217,249,157,0.10), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,113,133,0.18), transparent 60%),
    linear-gradient(165deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%);
  color: #fff;
  overflow: hidden;
}
.bh-top {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; z-index: 3;
}
.bh-brand-mark { display: flex; align-items: center; gap: 10px; }
.bh-brand-mark__name {
  font-family: var(--f-display); font-size: 18px; font-weight: 800; letter-spacing: -0.02em;
}
.bh-lang {
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.22);
  color: #fff;
}
.bh-lang__dot { width: 6px; height: 6px; border-radius: 50%; background: #D9F99D; box-shadow: 0 0 8px #D9F99D; }

.bh-hero__eyebrow {
  color: #D9F99D; margin-top: 30px; justify-content: center; align-self: center;
}
.bh-hero__headline {
  font-size: 48px; margin-top: 14px; text-align: center; line-height: 1.18;
}
.bh-hero__sub {
  font-size: 13px; color: rgba(255,255,255,0.70); line-height: 1.6;
  margin-top: 14px; text-align: center; max-width: 300px; margin-inline: auto;
}

.bh-stage {
  flex: 1; position: relative; display: grid; place-items: center; margin-top: 8px;
}

/* mascot interactive wrapper */
.bh-mascot {
  position: relative; width: 240px; height: 240px; cursor: pointer;
}
.bh-mascot__halo {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(253,230,138,0.35), transparent 60%);
  animation: sb-halo 3s ease-in-out infinite;
  transition: background 300ms;
}
.bh-mascot[data-frenzy="3"] .bh-mascot__halo,
.bh-mascot[data-frenzy="4"] .bh-mascot__halo {
  background: radial-gradient(circle, rgba(251,113,133,0.45), rgba(253,230,138,0.25) 40%, transparent 65%);
  animation-duration: 0.6s;
}
.bh-mascot__orbitring {
  position: absolute; inset: 0; animation: sb-orbit 30s linear infinite;
  transition: opacity 300ms;
}
.bh-mascot[data-frenzy="3"] .bh-mascot__orbitring,
.bh-mascot[data-frenzy="4"] .bh-mascot__orbitring {
  animation-duration: 6s;
}
.bh-mascot__svg {
  position: absolute; inset: -20px 0 0 0;
  transition: transform 200ms; transform-origin: center; overflow: visible;
}
.bh-mascot[data-smashed="1"][data-frenzy="1"] .bh-mascot__svg { transform: scale(0.92); }
.bh-mascot__hint {
  position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%);
  font-family: var(--f-sans); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); font-weight: 700; white-space: nowrap;
}

.bh-mascot__burst {
  position: absolute; left: 50%; top: 50%;
  font-weight: 900; text-shadow: 0 0 8px currentColor;
  animation: sb-burst-full 1200ms cubic-bezier(0.22,0.61,0.36,1) forwards;
  pointer-events: none;
}
.bh-mascot__shockwave {
  position: absolute; left: 50%; top: 50%;
  width: 180px; height: 180px; margin-left: -90px; margin-top: -90px;
  border-radius: 50%;
  border: 3px solid #FDE68A;
  animation: sb-shockwave 900ms ease-out forwards;
  pointer-events: none;
}
.bh-mascot__shockwave[data-level="3"],
.bh-mascot__shockwave[data-level="4"] { border-color: #FB7185; }
.bh-mascot__combo {
  position: absolute; left: 50%; top: 30%;
  font-family: var(--f-display); font-weight: 800; font-size: 28px;
  color: #FDE68A; white-space: nowrap; pointer-events: none;
  text-shadow: 0 2px 20px rgba(251,113,133,0.8), 0 0 12px rgba(253,230,138,0.9);
  animation: sb-combo-pop 900ms ease-out forwards;
}

/* orbs */
.bh-orb {
  position: absolute; left: 50%; top: 50%;
  width: 48px; height: 48px; margin: -24px 0 0 -24px;
  background: none; border: none; padding: 0; cursor: pointer;
}
.bh-orb__inner {
  width: 100%; height: 100%;
  display: grid; place-items: center;
}
.bh-orb--wiggle .bh-orb__inner { animation: sb-wiggle 500ms ease; }
.bh-orb[data-id="math"]     { animation: sb-orbit-0   44s linear infinite; }
.bh-orb[data-id="english"]  { animation: sb-orbit-72  44s linear infinite; }
.bh-orb[data-id="korean"]   { animation: sb-orbit-144 44s linear infinite; }
.bh-orb[data-id="logic"]    { animation: sb-orbit-216 44s linear infinite; }
.bh-orb[data-id="creative"] { animation: sb-orbit-288 44s linear infinite; }

/* Hero CTA */
.bh-hero__cta-wrap { padding: 0 0 22px; position: relative; z-index: 3; }
.bh-hero__cta {
  width: 100%; background: #FAF7F2; color: #2E1065;
  border: none; border-radius: 999px; padding: 20px 32px;
  font-family: var(--f-sans); font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;
  box-shadow: 0 12px 36px rgba(217,249,157,0.35), inset 0 -2px 0 rgba(0,0,0,0.08);
  transition: transform 150ms;
}
.bh-hero__cta:active { transform: scale(0.97); }
.bh-hero__cta svg { position: absolute; right: 26px; }

.bh-scroll-hint {
  margin-top: 16px; width: 100%;
  background: none; border: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.6); animation: sb-bob 2s ease-in-out infinite;
}
.bh-scroll-hint span {
  font-family: var(--f-sans); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;
}

/* ───── Why ───── */
.bh-why {
  padding: 100px 30px;
  background: linear-gradient(180deg, #1A0B3E 0%, #0F0529 100%);
  color: #fff;
}
.bh-why__title { font-size: 34px; margin-top: 14px; }
.bh-why__cards { margin-top: 30px; display: grid; gap: 14px; }
.bh-stat-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 22px; padding: 20px 22px;
  display: flex; align-items: center; gap: 18px;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
.bh-stat-card__big { font-family: var(--f-display); font-weight: 700; font-size: 32px; color: #FDE68A; flex-shrink: 0; min-width: 72px; letter-spacing: -0.035em; }
.bh-stat-card__text { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.55; }

.bh-why__iq-tagline {
  font-family: var(--f-display); font-size: 20px; font-weight: 800;
  color: #FDE68A; margin-top: 6px; letter-spacing: -0.02em;
}
.bh-why__insight {
  margin-top: 22px; font-size: 13px; color: rgba(255,255,255,0.72);
  line-height: 1.7; border-left: 3px solid rgba(251,113,133,0.55);
  padding-left: 14px;
}

/* ───── Subjects ───── */
.bh-subjects {
  padding: 90px 0 100px;
  background: #FAF7F2; color: #1A0B3E; overflow: hidden;
}
.bh-subjects__hdr { padding: 0 30px; }
.bh-subjects__title { font-size: 38px; margin-top: 14px; color: #1A0B3E; line-height: 1.05; }
.bh-subjects__sub { font-size: 13px; color: #6B5B7D; margin-top: 12px; line-height: 1.6; max-width: 320px; }

.bh-subjects__scroller {
  margin-top: 32px;
  display: flex; gap: 14px; padding: 8px 30px 24px;
  overflow-x: auto; scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.bh-subjects__scroller::-webkit-scrollbar { display: none; }

.bh-subject-card {
  flex: 0 0 280px; scroll-snap-align: start;
  color: #fff; border-radius: 24px; padding: 20px 22px 24px;
  display: flex; flex-direction: column;
  box-shadow: 0 16px 34px -18px rgba(46,16,101,0.45);
  position: relative; overflow: hidden; min-height: 380px;
}
.bh-subject-card[data-id="math"]     { background: linear-gradient(160deg,#0369A1 0%,#0EA5E9 100%); }
.bh-subject-card[data-id="english"]  { background: linear-gradient(160deg,#047857 0%,#10B981 100%); }
.bh-subject-card[data-id="korean"]   { background: linear-gradient(160deg,#9F1239 0%,#F43F5E 100%); }
.bh-subject-card[data-id="logic"]    { background: linear-gradient(160deg,#3730A3 0%,#6366F1 100%); }
.bh-subject-card[data-id="creative"] { background: linear-gradient(160deg,#C2410C 0%,#F97316 100%); }
.bh-subject-card__glow {
  position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255,255,255,0.12); filter: blur(30px);
}
.bh-subject-card__head { display: flex; align-items: center; justify-content: space-between; position: relative; }
.bh-subject-card__levels {
  font-family: var(--f-sans); font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: rgba(255,255,255,0.75);
}
.bh-subject-card__name { font-family: var(--f-display); font-weight: 800; font-size: 22px; margin-top: 12px; }
.bh-subject-card__tagline { font-family: var(--f-sans); font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px; }

.bh-demo {
  margin-top: 18px; padding: 26px 14px;
  background: rgba(0,0,0,0.22); border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.14);
  display: grid; place-items: center; position: relative;
}
.bh-subject-card__caption {
  margin-top: 10px; font-family: var(--f-sans); font-size: 11px; color: rgba(255,255,255,0.85); text-align: center; font-weight: 600;
}
.bh-skills { margin-top: auto; padding-top: 16px; display: flex; flex-wrap: wrap; gap: 6px; }
.bh-skills span {
  font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
  background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.25);
}

.bh-swipe-hint {
  padding: 0 30px; display: flex; align-items: center; gap: 10px; color: #6B5B7D;
}
.bh-swipe-hint span { font-family: var(--f-sans); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 800; }

.bh-foundation {
  margin: 40px 30px 0; padding: 22px 24px;
  background: #1A0B3E; color: #fff; border-radius: 24px;
  display: flex; align-items: center; gap: 18px;
}
.bh-foundation__icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: #D9F99D; color: #1A0B3E;
  display: grid; place-items: center; flex-shrink: 0;
}
.bh-foundation__title { font-size: 16px; line-height: 1.3; }
.bh-foundation__sub { font-family: var(--f-sans); font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 4px; }

/* ───── Parent ───── */
.bh-parent {
  padding: 100px 30px 40px;
  background: linear-gradient(180deg, #FAF7F2 0%, #EDE9FE 100%);
  color: #1A0B3E;
}
.bh-parent__title { font-size: 32px; margin-top: 14px; }
.bh-parent__list { margin-top: 26px; display: grid; gap: 14px; }
.bh-parent-row {
  display: flex; align-items: center; gap: 14px;
  background: #fff; padding: 14px 16px; border-radius: 16px;
  border: 1px solid rgba(46,16,101,0.06);
}
.bh-parent-row__emoji { font-size: 24px; }
.bh-parent-row__title { font-family: var(--f-display); font-weight: 800; font-size: 14px; }
.bh-parent-row__desc { font-size: 11px; color: #6B5B7D; margin-top: 2px; }

.bh-final {
  margin-top: 40px; text-align: center;
}
.bh-final__display { font-size: 24px; color: #2E1065; }
.bh-final__cta {
  margin-top: 18px; width: 100%;
  background: #2E1065; color: #fff;
  border: none; border-radius: 999px; padding: 20px 32px;
  font-family: var(--f-sans); font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center; position: relative;
  box-shadow: 0 12px 30px rgba(46,16,101,0.35);
  cursor: pointer; transition: transform 150ms;
}
.bh-final__cta:active { transform: scale(0.97); }
.bh-final__cta svg { position: absolute; right: 26px; }
.bh-final__meta {
  margin-top: 14px; font-family: var(--f-sans); font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: #6B5B7D; font-weight: 700;
}

/* ───── Keyframes ───── */
@keyframes sb-halo { 0%,100% { transform: scale(1); opacity: 0.7 } 50% { transform: scale(1.1); opacity: 1 } }
@keyframes sb-orbit { from { transform: rotate(0) } to { transform: rotate(360deg) } }
@keyframes sb-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
@keyframes sb-wiggle {
  0%,100% { transform: rotate(0) scale(1) }
  20% { transform: rotate(-12deg) scale(1.15) }
  40% { transform: rotate(10deg) scale(1.1) }
  60% { transform: rotate(-6deg) scale(1.08) }
  80% { transform: rotate(3deg) scale(1.04) }
}
@keyframes sb-shockwave {
  0% { transform: scale(0.5); opacity: 0.9 }
  100% { transform: scale(2.3); opacity: 0 }
}
@keyframes sb-combo-pop {
  0% { transform: translate(-50%,-50%) scale(0.4); opacity: 0 }
  30% { transform: translate(-50%,-50%) scale(1.15); opacity: 1 }
  100% { transform: translate(-50%,-50%) scale(1) translateY(-40px); opacity: 0 }
}
@keyframes sb-burst-full {
  0% { transform: translate(-50%,-50%) translate(0,0) scale(0.2) rotate(0); opacity: 0 }
  15% { opacity: 1 }
  100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty)) scale(1) rotate(var(--rot, 0deg)); opacity: 0 }
}
/* Orbs evenly spaced 72° apart, all sharing duration so spacing stays fixed */
@keyframes sb-orbit-0   { from { transform: rotate(0deg)   translate(140px) rotate(-0deg)   } to { transform: rotate(360deg) translate(140px) rotate(-360deg) } }
@keyframes sb-orbit-72  { from { transform: rotate(72deg)  translate(140px) rotate(-72deg)  } to { transform: rotate(432deg) translate(140px) rotate(-432deg) } }
@keyframes sb-orbit-144 { from { transform: rotate(144deg) translate(140px) rotate(-144deg) } to { transform: rotate(504deg) translate(140px) rotate(-504deg) } }
@keyframes sb-orbit-216 { from { transform: rotate(216deg) translate(140px) rotate(-216deg) } to { transform: rotate(576deg) translate(140px) rotate(-576deg) } }
@keyframes sb-orbit-288 { from { transform: rotate(288deg) translate(140px) rotate(-288deg) } to { transform: rotate(648deg) translate(140px) rotate(-648deg) } }

@keyframes sb-mascot-shake-2 {
  0%,100% { transform: scale(1) rotate(0) }
  25% { transform: scale(1.04) rotate(-3deg) }
  75% { transform: scale(1.04) rotate(3deg) }
}
@keyframes sb-mascot-shake-3 {
  0%,100% { transform: scale(1.06) rotate(0) }
  20% { transform: scale(1.1) rotate(-8deg) }
  50% { transform: scale(1.08) rotate(6deg) }
  80% { transform: scale(1.1) rotate(-4deg) }
}
@keyframes sb-mascot-shake-4 {
  0% { transform: scale(1.1) rotate(0) }
  15% { transform: scale(1.15) rotate(-14deg) }
  30% { transform: scale(1.08) rotate(12deg) }
  45% { transform: scale(1.18) rotate(-10deg) }
  60% { transform: scale(1.1) rotate(8deg) }
  80% { transform: scale(1.14) rotate(-6deg) }
  100% { transform: scale(1.1) rotate(0) }
}
.bh-mascot[data-frenzy="2"] .bh-mascot__svg { animation: sb-mascot-shake-2 400ms ease; }
.bh-mascot[data-frenzy="3"] .bh-mascot__svg { animation: sb-mascot-shake-3 450ms ease; }
.bh-mascot[data-frenzy="4"] .bh-mascot__svg { animation: sb-mascot-shake-4 600ms ease; }
`;

/* ───── SVG builders ───── */

function svgLogoMark(size = 32): string {
  return `
    <svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">
      <defs>
        <linearGradient id="bh-lm-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FDE68A"/>
          <stop offset="1" stop-color="#FB7185"/>
        </linearGradient>
      </defs>
      <path d="M20 6 C 13 6 9 10 9 16 C 9 19 10 21 12 23 C 11 25 11 28 13 30 C 15 32 18 32 20 30 C 22 32 25 32 27 30 C 29 28 29 25 28 23 C 30 21 31 19 31 16 C 31 10 27 6 20 6 Z"
        fill="url(#bh-lm-a)" stroke="#2E1065" stroke-width="1.5"/>
      <path d="M20 12 L22 18 L28 20 L22 22 L20 28 L18 22 L12 20 L18 18 Z" fill="#2E1065"/>
      <circle cx="30" cy="9" r="2" fill="#D9F99D"/>
    </svg>`;
}

function svgSubjectIcon(id: string, color: string): string {
  const stroke = '#2E1065';
  const sw = 2.6;
  switch (id) {
    case 'math':
      return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="${color}"/>
        <line x1="10" y1="14" x2="30" y2="14" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
        <line x1="10" y1="26" x2="30" y2="26" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>
        <circle cx="14" cy="14" r="2.6" fill="${stroke}"/>
        <circle cx="20" cy="14" r="2.6" fill="#FDE68A" stroke="${stroke}" stroke-width="2"/>
        <circle cx="26" cy="14" r="2.6" fill="${stroke}"/>
        <circle cx="14" cy="26" r="2.6" fill="#FDE68A" stroke="${stroke}" stroke-width="2"/>
        <circle cx="22" cy="26" r="2.6" fill="${stroke}"/>
      </svg>`;
    case 'english':
      return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="${color}"/>
        <path d="M11 15 Q11 11 15 11 H26 Q30 11 30 15 V21 Q30 25 26 25 H20 L15 29 V25 Q11 25 11 21 Z" fill="#FAF7F2" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="16" cy="18" r="1.5" fill="${stroke}"/>
        <circle cx="20.5" cy="18" r="1.5" fill="${stroke}"/>
        <circle cx="25" cy="18" r="1.5" fill="${stroke}"/>
      </svg>`;
    case 'korean':
      return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="${color}"/>
        <rect x="11" y="11" width="8" height="18" rx="1.5" fill="#FAF7F2" stroke="${stroke}" stroke-width="2.4"/>
        <path d="M22 11 L22 29" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
        <path d="M22 20 L29 20" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
    case 'logic':
      return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="${color}"/>
        <path d="M11 11 L22 11 L22 22 Z" fill="#FDE68A" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="22" y="11" width="8" height="8" rx="1.4" fill="#FAF7F2" stroke="${stroke}" stroke-width="2.4"/>
        <circle cx="16" cy="26" r="4.5" fill="#FAF7F2" stroke="${stroke}" stroke-width="2.4"/>
        <path d="M22 22 L30 22 L30 30 L22 30 Z" fill="#FDE68A" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round" transform="rotate(45 26 26)"/>
      </svg>`;
    case 'creative':
      return `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="${color}"/>
        <path d="M20 9 Q23 17 31 20 Q23 23 20 31 Q17 23 9 20 Q17 17 20 9 Z" fill="#FDE68A" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="20" cy="20" r="2" fill="${stroke}"/>
      </svg>`;
  }
  return '';
}

function svgMascot(frenzy: number, smashed: boolean): string {
  const smileD = frenzy >= 3
    ? 'M96 146 Q 120 176 144 146'
    : smashed
      ? 'M100 150 Q 120 168 140 150'
      : 'M104 148 Q 120 158 136 148';
  const eyeRy = frenzy >= 3 ? 14 : 12;
  const eyes = frenzy >= 4
    ? `<path d="M96 110 C 88 102 82 110 88 118 C 90 122 96 126 96 126 C 96 126 102 122 104 118 C 110 110 104 102 96 110 Z" fill="#FB7185"/>
       <path d="M144 110 C 136 102 130 110 136 118 C 138 122 144 126 144 126 C 144 126 150 122 152 118 C 158 110 152 102 144 110 Z" fill="#FB7185"/>`
    : `<ellipse cx="96" cy="118" rx="10" ry="${eyeRy}" fill="#2E1065"/>
       <ellipse cx="144" cy="118" rx="10" ry="${eyeRy}" fill="#2E1065"/>
       <circle cx="99" cy="115" r="3" fill="#fff"/>
       <circle cx="147" cy="115" r="3" fill="#fff"/>`;
  const eyeClosed = smashed && frenzy < 3 ? 'transform: scaleY(0.1);' : '';
  const cheekR = frenzy >= 3 ? 10 : 7;
  const cheekOp = frenzy >= 3 ? 0.9 : 0.7;
  const hairScale = frenzy >= 3 ? 1.15 : 1;
  const twinkle = frenzy >= 2 ? `
    <g stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="${frenzy >= 3 ? 1 : 0.7}">
      <line x1="150" y1="-6" x2="150" y2="-10"/>
      <line x1="162" y1="6" x2="166" y2="6"/>
      <line x1="141" y1="-3" x2="138" y2="-6"/>
      <line x1="159" y1="-3" x2="162" y2="-6"/>
    </g>` : '';
  return `
    <svg class="bh-mascot__svg" viewBox="-20 -40 280 300" width="240" height="240">
      <defs>
        <radialGradient id="bh-body-grad" cx="0.35" cy="0.35">
          <stop offset="0" stop-color="#FDE68A"/>
          <stop offset="0.7" stop-color="#FBBF24"/>
          <stop offset="1" stop-color="#F97316"/>
        </radialGradient>
      </defs>
      <circle cx="120" cy="124" r="78" fill="url(#bh-body-grad)" stroke="#2E1065" stroke-width="3.5"/>
      <g style="transition: transform 180ms; ${eyeClosed} transform-origin: 120px 120px;">
        ${eyes}
      </g>
      <circle cx="82" cy="142" r="${cheekR}" fill="#FB7185" opacity="${cheekOp}"/>
      <circle cx="158" cy="142" r="${cheekR}" fill="#FB7185" opacity="${cheekOp}"/>
      <path d="${smileD}" stroke="#2E1065" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <g style="transform-origin: 120px 46px; transform: scale(${hairScale}); transition: transform 250ms;">
        <path d="M120 46 Q 118 30 126 18 Q 136 6 150 6" stroke="#2E1065" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="150" cy="6" r="13" fill="#FDE68A" opacity="0.35"/>
        <circle cx="150" cy="6" r="18" fill="#FDE68A" opacity="0.18"/>
        <circle cx="150" cy="6" r="8" fill="#FDE68A" stroke="#2E1065" stroke-width="2.2"/>
        <path d="M147 6 L150 3 L153 6 L150 9 Z" fill="#2E1065" opacity="0.35"/>
        <circle cx="147" cy="3" r="1.8" fill="#fff" opacity="0.9"/>
        ${twinkle}
      </g>
    </svg>`;
}

/* ───── Subject card demos ───── */

const SUBJECT_CARDS = [
  {
    id: 'math', name: '수리 수학', tagline: '빠른 연산, 강한 수 감각',
    skills: ['한 자리 덧·뺄', '두 자리 계산', '구구단', '수 패턴'],
    caption: '합이 28인 카드 두 장을 찾아봐요',
    demo: () => {
      const nums = [7, 14, 21, 3, 18, 5];
      const highlight = new Set([7, 21]);
      return `<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        ${nums.map((n, i) => `<div style="
          width:44px;height:56px;border-radius:10px;
          background:${highlight.has(n) ? '#FDE68A' : 'rgba(255,255,255,0.92)'};
          color:#0C4A6E; display:grid; place-items:center;
          font-family:var(--f-display); font-weight:800; font-size:22px;
          box-shadow:0 6px 14px rgba(0,0,0,0.2);
          ${highlight.has(n) ? 'border:2px solid #FFF;' : ''}
          transform: rotate(${i % 2 ? 3 : -3}deg);">${n}</div>`).join('')}
      </div>`;
    },
  },
  {
    id: 'english', name: '영어', tagline: '언어 기억력 훈련',
    skills: ['사이트워드 120', '파닉스', '짧은 문장', '발음'],
    caption: '그림에 맞는 단어를 골라요',
    demo: () => {
      const words = ['apple', 'bear', 'milk'];
      return `<div style="display:flex;align-items:center;gap:18px;justify-content:center;">
        <div style="font-size:68px;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.25));">🍎</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${words.map((w, i) => `<div style="
            background:${i === 0 ? '#FDE68A' : 'rgba(255,255,255,0.92)'};
            color:${i === 0 ? '#064E3B' : '#065F46'};
            padding:6px 14px; border-radius:999px;
            font-family:var(--f-display); font-weight:800; font-size:14px;
            box-shadow:0 4px 10px rgba(0,0,0,0.15);
            ${i === 0 ? 'border:2px solid #fff;' : ''}">${w}</div>`).join('')}
        </div>
      </div>`;
    },
  },
  {
    id: 'korean', name: '국어', tagline: '언어 인식 & 기억 훈련',
    skills: ['자모 14개', '받침', '어휘', '짧은 문장'],
    caption: '자모를 조합해 글자를 만들어요',
    demo: () => `<div style="display:flex;align-items:center;gap:10px;justify-content:center;">
      <div style="width:56px;height:56px;border-radius:14px;background:#FFE4E6;color:#9F1239;display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:36px;">ㄱ</div>
      <div style="font-size:22px;color:#fff;opacity:0.7;">+</div>
      <div style="width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,0.18);border:2px dashed rgba(255,255,255,0.7);display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:36px;color:rgba(255,255,255,0.7);">?</div>
      <div style="font-size:22px;color:#fff;opacity:0.7;">=</div>
      <div style="width:56px;height:56px;border-radius:14px;background:#FDE68A;color:#9F1239;display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:36px;border:2px solid #fff;">가</div>
    </div>`,
  },
  {
    id: 'logic', name: '논리', tagline: '논리 사고력 & 패턴 인식',
    skills: ['패턴 잇기', '순서 추리', '분류', '관계'],
    caption: '다음에 올 모양을 찾아봐요',
    demo: () => `<div style="display:flex;gap:10px;align-items:center;justify-content:center;">
      <div style="width:40px;height:40px;border-radius:50%;background:#FDE68A;box-shadow:0 4px 10px rgba(0,0,0,0.2);"></div>
      <svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,4 38,36 2,36" fill="#FB7185"/></svg>
      <div style="width:40px;height:40px;border-radius:50%;background:#FDE68A;box-shadow:0 4px 10px rgba(0,0,0,0.2);"></div>
      <svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,4 38,36 2,36" fill="#FB7185"/></svg>
      <div style="width:40px;height:40px;border-radius:10px;border:2px dashed rgba(255,255,255,0.7);display:grid;place-items:center;color:rgba(255,255,255,0.8);font-family:var(--f-display);font-weight:800;font-size:22px;">?</div>
    </div>`,
  },
  {
    id: 'creative', name: '창의', tagline: '공간 지각 & 집중력 훈련',
    skills: ['한붓그리기', '대칭', '색 감각', '공간'],
    caption: '선을 떼지 않고 모든 점을 지나요',
    demo: () => `<svg viewBox="0 0 180 100" width="200" height="110">
      <g stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="3 3" fill="none">
        <path d="M30 50 L60 20 L90 50 L120 20 L150 50 L120 80 L90 50 L60 80 Z"/>
      </g>
      <path d="M30 50 L60 20 L90 50 L120 20" stroke="#FDE68A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="30" cy="50" r="4" fill="#FDE68A" stroke="#C2410C" stroke-width="2"/>
      <circle cx="60" cy="20" r="4" fill="#FDE68A" stroke="#C2410C" stroke-width="2"/>
      <circle cx="90" cy="50" r="4" fill="#FDE68A" stroke="#C2410C" stroke-width="2"/>
      <circle cx="120" cy="20" r="4" fill="#FDE68A" stroke="#C2410C" stroke-width="2"/>
      <circle cx="150" cy="50" r="4" fill="#fff" stroke="#C2410C" stroke-width="2"/>
      <circle cx="120" cy="80" r="4" fill="#fff" stroke="#C2410C" stroke-width="2"/>
      <circle cx="60" cy="80" r="4" fill="#fff" stroke="#C2410C" stroke-width="2"/>
      <circle cx="120" cy="20" r="7" fill="none" stroke="#FDE68A" stroke-width="2"/>
    </svg>`,
  },
];

const ORB_COLORS: Record<string, string> = {
  math: '#7DD3FC', english: '#86EFAC', korean: '#FDA4AF', logic: '#A5B4FC', creative: '#FDBA74',
};

const ARROW_RIGHT = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
  <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export class BrandHome {
  private el: HTMLElement | null = null;
  private mascotEl: HTMLElement | null = null;
  private tapTimes: number[] = [];
  private frenzyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    if (!document.getElementById('brand-home-style')) {
      const style = document.createElement('style');
      style.id = 'brand-home-style';
      style.textContent = BRAND_HOME_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'brand-home';
    el.innerHTML = this.renderMarkup();

    this.container.appendChild(el);
    this.el = el;

    this.mascotEl = el.querySelector('.bh-mascot') as HTMLElement;
    this.bindEvents();
  }

  hide(): void {
    if (this.frenzyTimer) { clearTimeout(this.frenzyTimer); this.frenzyTimer = null; }
    if (this.el) { this.el.remove(); this.el = null; }
    this.mascotEl = null;
    this.tapTimes = [];
  }

  private renderMarkup(): string {
    return `
      <div class="bh-root">

        <!-- HERO -->
        <section class="bh-hero">
          <div class="bh-top">
            <div class="bh-brand-mark">
              ${svgLogoMark(30)}
              <span class="bh-brand-mark__name">사박</span>
            </div>
            <button class="sb-chip bh-lang" type="button">
              <span class="bh-lang__dot"></span>
              KO
            </button>
          </div>

          <span class="sb-eyebrow bh-hero__eyebrow">두 · 뇌 · 의 · 힘 · 을 · 키 · 우 · 자</span>

          <h1 class="sb-display bh-hero__headline">
            생각하고, <em style="color:#FDE68A">계산하고</em>,<br/>
            <em style="color:#FB7185">외우는 힘</em>을 키워라
          </h1>
          <p class="bh-hero__sub">멘사 테스트 기반 두뇌 훈련. 더 잘 생각하고, 더 빠르게 계산하고, 더 오래 기억하도록.</p>

          <div class="bh-stage">
            <div class="bh-mascot" data-frenzy="1" data-smashed="0">
              <div class="bh-mascot__halo"></div>
              <svg class="bh-mascot__orbitring" viewBox="0 0 240 240">
                <ellipse cx="120" cy="120" rx="100" ry="40" fill="none" stroke="rgba(255,255,255,0.22)" stroke-dasharray="2 5"/>
              </svg>
              ${svgMascot(1, false)}
              <div class="bh-mascot__hint">✦ tap me</div>
            </div>
            ${['math','english','korean','logic','creative'].map(id => `
              <button class="bh-orb" data-id="${id}" aria-label="${id}" type="button">
                <div class="bh-orb__inner" style="filter:drop-shadow(0 4px 14px ${ORB_COLORS[id]}88);">
                  ${svgSubjectIcon(id, ORB_COLORS[id]!)}
                </div>
              </button>`).join('')}
          </div>

          <div class="bh-hero__cta-wrap">
            <button class="bh-hero__cta bh-cta-start" type="button">
              <span>두뇌 훈련 시작하기</span>${ARROW_RIGHT}
            </button>
            <button class="bh-scroll-hint" type="button" data-scroll-target="why">
              <span>왜 두뇌 훈련인가?</span>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M1 1l8 7 8-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </section>

        <!-- WHY -->
        <section class="bh-why" data-section="why">
          <span class="sb-eyebrow" style="color:#FB7185">핵심</span>
          <p class="bh-why__iq-tagline">돌고 돌아 IQ입니다.</p>
          <h2 class="sb-display bh-why__title">
            <em style="color:#FDE68A">두뇌 체력</em>이 없으면<br/>
            공부해도 힘들다
          </h2>
          <div class="bh-why__cards">
            <div class="bh-stat-card">
              <div class="bh-stat-card__big">IQ</div>
              <div class="bh-stat-card__text">멘사 테스트 기반 — 더 잘 생각하는 훈련만 골랐습니다</div>
            </div>
            <div class="bh-stat-card">
              <div class="bh-stat-card__big">5분</div>
              <div class="bh-stat-card__text">하루 5분, 사고·연산·기억 훈련이 쌓이면 모든 공부가 쉬워집니다</div>
            </div>
            <div class="bh-stat-card">
              <div class="bh-stat-card__big">×10</div>
              <div class="bh-stat-card__text">두뇌 체력이 갖춰진 아이는 사교육비 쏟아붓는 것보다 <span style="color:#FDE68A">훨씬 빠르게</span> 성장합니다</div>
            </div>
          </div>
          <p class="bh-why__insight">자극과 훈련을 통해 후천적으로 개발할 수 있는 연습은 모두 담았습니다.</p>
        </section>

        <!-- SUBJECTS -->
        <section class="bh-subjects">
          <div class="bh-subjects__hdr">
            <span class="sb-eyebrow" style="color:#6D28D9">5가지 훈련 영역 · 200+ 미니게임</span>
            <h2 class="sb-display bh-subjects__title">
              생각하고, <em style="color:#6D28D9">계산하고</em>,<br/>
              <em style="color:#F43F5E">기억하는 힘</em>
            </h2>
            <p class="bh-subjects__sub">시험 잘 보는 법이 아니라, 연산·논리·기억·언어·창의 — 더 잘 생각할 수 있는 두뇌 훈련만 모았습니다.</p>
          </div>

          <div class="bh-subjects__scroller">
            ${SUBJECT_CARDS.map(s => `
              <article class="bh-subject-card" data-id="${s.id}">
                <div class="bh-subject-card__glow"></div>
                <div class="bh-subject-card__head">
                  ${svgSubjectIcon(s.id, 'rgba(255,255,255,0.95)')}
                  <span class="bh-subject-card__levels">40+ LEVELS</span>
                </div>
                <div style="margin-top:12px;position:relative;">
                  <div class="bh-subject-card__name">${s.name}</div>
                  <div class="bh-subject-card__tagline">${s.tagline}</div>
                </div>
                <div class="bh-demo">${s.demo()}</div>
                <div class="bh-subject-card__caption">${s.caption}</div>
                <div class="bh-skills">${s.skills.map(k => `<span>${k}</span>`).join('')}</div>
              </article>
            `).join('')}
            <div style="flex:0 0 20px;"></div>
          </div>

          <div class="bh-swipe-hint">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>옆으로 넘겨보세요</span>
          </div>

          <div class="bh-foundation">
            <div class="bh-foundation__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
            </div>
            <div>
              <div class="sb-display bh-foundation__title">
                <em style="color:#FDE68A">멘사 테스트 기반</em><br/>
                두뇌 훈련 프로그램
              </div>
              <div class="bh-foundation__sub">재미를 강조한 뇌풀기 게임을 넘어선 두뇌 성장을 지향합니다</div>
            </div>
          </div>
        </section>

        <!-- PARENT -->
        <section class="bh-parent">
          <span class="sb-eyebrow" style="color:#6D28D9">부모 안심</span>
          <h2 class="sb-display bh-parent__title">
            두뇌 성장 <em style="color:#F43F5E">리포트</em>까지
          </h2>
          <div class="bh-parent__list">
            ${[
              { i: '🧠', t: '두뇌 훈련 성장 리포트', d: '사고·연산·기억력 영역별 발전 추적' },
              { i: '🔒', t: '광고 없음, 결제 없음', d: '아이가 임의로 결제할 일 없어요' },
              { i: '⏰', t: '시간 제한 설정', d: '하루 10분~40분 부모가 조절' },
              { i: '🌱', t: '연령 맞춤 난이도', d: '멘사 기반 · 단계별 두뇌 훈련 자동 조정' },
            ].map(x => `
              <div class="bh-parent-row">
                <span class="bh-parent-row__emoji">${x.i}</span>
                <div>
                  <div class="bh-parent-row__title">${x.t}</div>
                  <div class="bh-parent-row__desc">${x.d}</div>
                </div>
              </div>`).join('')}
          </div>

          <div class="bh-final">
            <div class="sb-display bh-final__display">
              오늘부터 <em style="color:#6D28D9">두뇌 훈련</em>
            </div>
            <button class="bh-final__cta bh-cta-start" type="button">
              <span>두뇌 훈련 시작하기</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="right:26px;position:absolute;"><path d="M4 10h12M11 5l5 5-5 5" stroke="#D9F99D" stroke-width="2.4" stroke-linecap="round"/></svg>
            </button>
            <div class="bh-final__meta">사교육비보다 중요한 것 · 두뇌 체력을 먼저 키우세요</div>
          </div>
        </section>

      </div>
    `;
  }

  private bindEvents(): void {
    if (!this.el) return;

    this.el.querySelectorAll<HTMLButtonElement>('.bh-cta-start').forEach(btn => {
      btn.addEventListener('click', () => {
        const dest = this.saveService.hasProfile() ? 'home-b' : 'profile-setup';
        this.router.navigate({ to: dest });
      });
    });

    const scrollHint = this.el.querySelector<HTMLButtonElement>('.bh-scroll-hint');
    scrollHint?.addEventListener('click', () => {
      const target = this.el?.querySelector<HTMLElement>('[data-section="why"]');
      if (target) {
        this.el!.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      }
    });

    if (this.mascotEl) {
      this.mascotEl.addEventListener('click', () => this.onMascotTap());
    }

    this.el.querySelectorAll<HTMLButtonElement>('.bh-orb').forEach(orb => {
      orb.addEventListener('click', (e) => {
        e.stopPropagation();
        orb.classList.add('bh-orb--wiggle');
        setTimeout(() => orb.classList.remove('bh-orb--wiggle'), 600);
      });
    });
  }

  private onMascotTap(): void {
    if (!this.mascotEl) return;
    const now = performance.now();
    this.tapTimes = this.tapTimes.filter(t => now - t < 2000);
    this.tapTimes.push(now);
    const taps = this.tapTimes.length;

    let level = 1;
    if (taps >= 12) level = 4;
    else if (taps >= 7) level = 3;
    else if (taps >= 5) level = 2;

    this.mascotEl.dataset['frenzy'] = String(level);
    this.mascotEl.dataset['smashed'] = '1';

    // swap mascot SVG to reflect new frenzy/smashed state
    const oldSvg = this.mascotEl.querySelector('.bh-mascot__svg');
    if (oldSvg) {
      const tmp = document.createElement('div');
      tmp.innerHTML = svgMascot(level, true);
      const fresh = tmp.firstElementChild as SVGElement;
      oldSvg.replaceWith(fresh);
    }

    if (this.frenzyTimer) clearTimeout(this.frenzyTimer);
    this.frenzyTimer = setTimeout(() => {
      if (!this.mascotEl) return;
      this.mascotEl.dataset['frenzy'] = '1';
      this.mascotEl.dataset['smashed'] = '0';
      const staleSvg = this.mascotEl.querySelector('.bh-mascot__svg');
      if (staleSvg) {
        const tmp = document.createElement('div');
        tmp.innerHTML = svgMascot(1, false);
        staleSvg.replaceWith(tmp.firstElementChild as SVGElement);
      }
    }, 1500);

    setTimeout(() => {
      if (!this.mascotEl) return;
      if (this.mascotEl.dataset['smashed'] === '1') {
        this.mascotEl.dataset['smashed'] = '0';
        const staleSvg = this.mascotEl.querySelector('.bh-mascot__svg');
        if (staleSvg) {
          const tmp = document.createElement('div');
          tmp.innerHTML = svgMascot(level, false);
          staleSvg.replaceWith(tmp.firstElementChild as SVGElement);
        }
      }
    }, level >= 3 ? 200 : 400);

    if (level >= 3) {
      const combo = document.createElement('div');
      combo.className = 'bh-mascot__combo';
      combo.textContent = level === 4 ? '대박! 🎉' : '신난다! ✨';
      this.mascotEl.appendChild(combo);
      setTimeout(() => combo.remove(), 900);
    }

    if (level >= 2) {
      const sw = document.createElement('div');
      sw.className = 'bh-mascot__shockwave';
      sw.dataset['level'] = String(level);
      this.mascotEl.appendChild(sw);
      setTimeout(() => sw.remove(), 900);
    }

    const n = level === 4 ? 36 : level === 3 ? 26 : level === 2 ? 20 : 14;
    const chars = level >= 3
      ? ['✦', '★', '●', '◆', '▲', '🎉', '💥', '⭐', '💫', '🔥']
      : ['✦', '★', '●', '◆', '▲'];
    const colors = level >= 3
      ? ['#FDE68A', '#D9F99D', '#FB7185', '#A78BFA', '#FFFFFF', '#F97316', '#34D399', '#60A5FA', '#F472B6']
      : ['#FDE68A', '#D9F99D', '#FB7185', '#A78BFA', '#FFFFFF'];

    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const dBase = level === 4 ? 100 : level === 3 ? 85 : 70;
      const dVar = level >= 3 ? 80 : 60;
      const d = dBase + Math.random() * dVar;
      const delay = Math.random() * (level >= 3 ? 60 : 120);
      const size = (level >= 3 ? 10 : 6) + Math.random() * (level >= 3 ? 14 : 10);
      const rot = (Math.random() - 0.5) * 720;

      const span = document.createElement('span');
      span.className = 'bh-mascot__burst';
      span.textContent = chars[Math.floor(Math.random() * chars.length)]!;
      span.style.color = colors[Math.floor(Math.random() * colors.length)]!;
      span.style.fontSize = `${size + 6}px`;
      span.style.setProperty('--tx', `${Math.cos(a) * d}px`);
      span.style.setProperty('--ty', `${Math.sin(a) * d}px`);
      span.style.setProperty('--rot', `${rot}deg`);
      span.style.animationDelay = `${delay}ms`;
      this.mascotEl.appendChild(span);
      setTimeout(() => span.remove(), 1700);
    }
  }
}
