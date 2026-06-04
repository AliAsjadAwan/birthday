import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday" },
      { name: "description", content: "A soulful one-page birthday letter, crafted with care." },
      { property: "og:title", content: "Happy Birthday ✦" },
      { property: "og:description", content: "A soulful one-page birthday letter, crafted with care." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Poppins:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: Birthday,
});

const WISHES = [
  "I hope this year brings you happiness that stays not just visits.",
  "I hope things start going your way more often. You deserve easy wins.",
  "I hope you never doubt your importance again. Not even for a second.",
  "I hope you always find reasons to smile, and people who give them to you.",
];

const LITTLE_THINGS = [
  { icon: "🌿", title: "Your kindness", text: "Given the way a tree gives shade i.e. without measuring, without asking back." },
  { icon: "✨", title: "How you handle hard days", text: "You carry things quietly and still show up. That kind of quiet strength is rare and it doesn't go unnoticed." },
  { icon: "🌸", title: "Your courage", text: "Soft, steady, ordinary  the kind no one applauds but the world depends on." },
  { icon: "💛", title: "The care you give", text: "You remember small things about people. What they're going through, what they love. That's not common. That's a gift." },
];

function Birthday() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cakeWrapRef = useRef<HTMLDivElement | null>(null);
  const wishesRef = useRef<HTMLDivElement | null>(null);
  const [blown, setBlown] = useState(false);
  const [revealed, setRevealed] = useState<number>(-1);
  const [ambient, setAmbient] = useState(false);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Ambient orbs trigger
  useEffect(() => {
    if (!cakeWrapRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.3) {
            setAmbient(true);
            io.disconnect();
          }
        });
      },
      { threshold: [0, 0.3, 0.6] },
    );
    io.observe(cakeWrapRef.current);
    return () => io.disconnect();
  }, []);

  // Cake canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();

    const getCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      return {
        w: Math.max(280, Math.round(rect.width || canvas.parentElement?.clientWidth || 420)),
        h: Math.max(280, Math.round(rect.height || (window.innerWidth < 768 ? 300 : 420))),
      };
    };

    const resize = () => {
      const { w, h } = getCanvasSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      const elapsed = (t - start) / 1000;
      const { w, h } = getCanvasSize();
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const baseY = h - 40;

      // glow if blown
      if (blown) {
        const g = ctx.createRadialGradient(cx, baseY - 80, 20, cx, baseY - 80, 240);
        g.addColorStop(0, "rgba(232,180,184,0.55)");
        g.addColorStop(1, "rgba(232,180,184,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // plate
      ctx.fillStyle = "rgba(44,44,44,0.08)";
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 14, 150, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // tier 1 (bottom)
      const t1w = 220, t1h = 70;
      roundRect(ctx, cx - t1w / 2, baseY - t1h, t1w, t1h, 8);
      ctx.fillStyle = "#F3D9DB";
      ctx.fill();
      // drip
      ctx.fillStyle = "#E8B4B8";
      ctx.beginPath();
      ctx.moveTo(cx - t1w / 2, baseY - t1h + 10);
      for (let i = 0; i <= 10; i++) {
        const x = cx - t1w / 2 + (t1w * i) / 10;
        const y = baseY - t1h + 10 + Math.sin(i) * 6 + (i % 2 === 0 ? 4 : 0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(cx + t1w / 2, baseY - t1h);
      ctx.lineTo(cx - t1w / 2, baseY - t1h);
      ctx.fill();

      // tier 2 (top)
      const t2w = 150, t2h = 60;
      roundRect(ctx, cx - t2w / 2, baseY - t1h - t2h, t2w, t2h, 8);
      ctx.fillStyle = "#FAEAEC";
      ctx.fill();
      ctx.fillStyle = "#C8C6E5";
      ctx.beginPath();
      ctx.moveTo(cx - t2w / 2, baseY - t1h - t2h + 8);
      for (let i = 0; i <= 8; i++) {
        const x = cx - t2w / 2 + (t2w * i) / 8;
        const y = baseY - t1h - t2h + 8 + Math.sin(i * 1.2) * 5 + (i % 2 === 0 ? 3 : 0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(cx + t2w / 2, baseY - t1h - t2h);
      ctx.lineTo(cx - t2w / 2, baseY - t1h - t2h);
      ctx.fill();

      // tiny dots decoration
      ctx.fillStyle = "#D4878C";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(cx - t1w / 2 + 20 + i * 36, baseY - 20, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // candles
      const candleY = baseY - t1h - t2h;
      const candles = [-30, 0, 30];
      candles.forEach((dx) => {
        const x = cx + dx;
        ctx.fillStyle = "#FBF6EE";
        roundRect(ctx, x - 4, candleY - 28, 8, 28, 2);
        ctx.fill();
        ctx.fillStyle = "#E8B4B8";
        ctx.fillRect(x - 4, candleY - 18, 8, 2);

        // wick
        ctx.strokeStyle = "#2C2C2C";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, candleY - 28);
        ctx.lineTo(x, candleY - 34);
        ctx.stroke();

        if (!blown) {
          // flame
          const flick = Math.sin(elapsed * 8 + dx) * 1.2;
          const fx = x + flick * 0.4;
          const fy = candleY - 34;
          const grd = ctx.createRadialGradient(fx, fy - 4, 1, fx, fy - 4, 12);
          grd.addColorStop(0, "rgba(255,236,180,1)");
          grd.addColorStop(0.5, "rgba(255,180,120,0.9)");
          grd.addColorStop(1, "rgba(232,140,140,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.ellipse(fx, fy - 4, 5, 9 + flick * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.beginPath();
          ctx.ellipse(fx, fy - 2, 1.6, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // smoke
          for (let i = 0; i < 3; i++) {
            const sy = candleY - 34 - ((elapsed * 30 + i * 18) % 60);
            const a = Math.max(0, 0.25 - i * 0.07);
            ctx.fillStyle = `rgba(120,120,130,${a})`;
            ctx.beginPath();
            ctx.arc(x + Math.sin(elapsed * 2 + i) * 4, sy, 3 + i, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [blown]);

  const launchConfetti = useCallback(() => {
    const root = cakeWrapRef.current;
    if (!root) return;
    const colors = ["#E8B4B8", "#D4878C", "#C8C6E5", "#FBE4B8", "#FFFFFF"];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.background = colors[i % colors.length];
      piece.style.left = 50 + (Math.random() - 0.5) * 30 + "%";
      piece.style.top = "55%";
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 220;
      piece.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      piece.style.setProperty("--ty", Math.sin(angle) * dist - 100 + "px");
      piece.style.setProperty("--r", Math.random() * 720 + "deg");
      piece.style.animationDelay = Math.random() * 80 + "ms";
      root.appendChild(piece);
      setTimeout(() => piece.remove(), 1800);
    }
  }, []);

  const handleCake = useCallback(() => {
    if (blown) return;
    setBlown(true);
    launchConfetti();
    setTimeout(() => {
      wishesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 900);
  }, [blown, launchConfetti]);

  return (
    <main className="bd-root">
      <style>{CSS}</style>
      <div className="noise" aria-hidden="true" />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container">
          <p className="eyebrow" data-reveal>✦ A Little Something For You</p>
          <h1 className="hero-title" data-reveal>
            Happy Birthday,<br />
            <span className="italic">dear friend.</span>
          </h1>
          <p className="hero-sub" data-reveal>
            Somewhere between ordinary days, you became someone extraordinary to me.
          </p>
          <div className="scroll-hint" data-reveal>— scroll down, this is for you —</div>
        </div>
      </section>

      {/* IF SOMEONE ASKED */}
      <section className="section">
        <div className="container narrow">
          <p className="kicker" data-reveal>If someone asked me about you</p>
          <div className="lines">
            {[ 
              "I'd say you're the kind of person who makes a room feel warmer just by being in it.",
              "That you carry people's feelings with care, even when no one asks you to.",
              "That you have a way of noticing things others miss  the small moments, the quiet ones.",
              "And then, quietly they'd say the world is softer because you're in it",
              "And that knowing you  even a little  is genuinely one of the good things.",
            ].map((l, i) => (
              <p
                className="line"
                key={i}
                data-reveal
                style={{ transitionDelay: `${i * 180}ms` }}
              >
                {l}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* LITTLE THINGS */}
      <section className="section">
        <div className="container">
          <h2 className="section-title center" data-reveal>The little things I notice</h2>
          <div className="grid-2">
            {LITTLE_THINGS.map((it, i) => (
              <article
                key={i}
                className="card glass"
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="card-icon">{it.icon}</div>
                <h3 className="card-title">{it.title}</h3>
                <p className="card-text">{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CHILDHOOD PHOTO */}
      <section className="section">
        <div className="container narrow">
          <figure className="portrait" data-reveal>
            <div className="portrait-frame" aria-label="A soft framed portrait placeholder">
              <div className="portrait-inner">
                <img src="/picture.jpeg" alt="childhood memory" className="portrait-img" />
                <img src="/picture1.jpg" alt="childhood memory 2" className="portrait-img" style={{ marginTop: 12, maxWidth: '100%', display: 'block' }} />
              </div>
            </div>
            <figcaption>Always curious. Always kind. Always, somehow, magic.</figcaption>
          </figure>
        </div>
      </section>

      {/* LETTER */}
      <section className="section">
        <div className="container narrow">
          <div className="letter glass" data-reveal>
            <p className="letter-open">Dear EESHA,</p>
            <p> 
              I'm not sure how to begin, so I'll begin badly. The honest truth is that you've quietly rearranged my world in a way I didn't ask for and could never give back.
            </p>
            <p>
              I don't know if you fully realize the kind of person you are. The way you move through the world with gentleness, with humor, with a kind of grace that doesn't demand to be seen is something I've noticed quietly for a long time.
            </p>
            <p>
              You deserve a year that finally matches who you are. A year where things go your way, where you feel seen and chosen and enough. Because you are enough. You've always been enough.
            </p>
            <p>
              On this birthday, I hope you pause just for a moment and let yourself feel proud. Of everything you've survived, everything you've built, everything you've become.
            </p>
            <p>
              This day belongs to you, and silence feels like a poor gift. So here it is, said plainly: I'm so glad you were born. I'm so glad the world arranged itself in such a way that I get to know you.
            </p>
            <p>
              There's a cake waiting for you below. And a few small wishes after that. But first, I just wanted you to know: <strong>the world is genuinely better because you're in it.</strong>
            </p>
            <p className="letter-sign"><span className="italic">— with so much warmth</span></p>
          </div>
        </div>
      </section>

      {/* CAKE */}
      <section className="section cake-section">
        <div className="container">
          <h2 className="section-title center" data-reveal>Now make a wish before blowing the candles.</h2>
          <p className="muted center" data-reveal>Tap the cake. Just once. Rest The candles know.</p>

          <div
            ref={cakeWrapRef}
            className={"cake-wrap" + (ambient ? " ambient" : "") + (blown ? " blown" : "")}
          >
            <div className="garland" aria-hidden="true">
              {Array.from({ length: 11 }).map((_, i) => (
                <span key={i} className="bulb" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </div>

            <div className="orbs" aria-hidden="true">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className="orb"
                  style={{
                    left: `${(i * 53) % 100}%`,
                    top: `${20 + ((i * 37) % 60)}%`,
                    animationDelay: `${(i * 230) % 3000}ms`,
                    animationDuration: `${7 + (i % 5)}s`,
                  }}
                />
              ))}
            </div>

            <div className="petals" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="petal"
                  style={{
                    left: `${(i * 17) % 100}%`,
                    animationDelay: `${(i * 310) % 6000}ms`,
                    animationDuration: `${9 + (i % 6)}s`,
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="cake-btn"
              onClick={handleCake}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCake();
                }
              }}
              aria-label={blown ? "Wish made" : "Blow out the candles"}
              disabled={blown}
            >
              <svg className="cake-illustration" viewBox="0 0 420 360" aria-hidden="true" role="img">
                <defs>
                  <radialGradient id="flameGlow" cx="50%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fff4c9" />
                    <stop offset="48%" stopColor="#f7b58f" />
                    <stop offset="100%" stopColor="#e8b4b8" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="cakeBottom" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f8e5e7" />
                    <stop offset="100%" stopColor="#edc6ca" />
                  </linearGradient>
                  <linearGradient id="cakeTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fff3f5" />
                    <stop offset="100%" stopColor="#f5d9de" />
                  </linearGradient>
                </defs>
                <ellipse className="cake-plate" cx="210" cy="294" rx="150" ry="16" />
                <g className="cake-smoke">
                  <path d="M180 112c-18-22 18-28 0-54" />
                  <path d="M210 104c-20-24 20-30 0-58" />
                  <path d="M240 112c-18-22 18-28 0-54" />
                </g>
                {[180, 210, 240].map((x) => (
                  <g key={x}>
                    <rect className="candle" x={x - 5} y="124" width="10" height="42" rx="3" />
                    <rect className="candle-stripe" x={x - 5} y="140" width="10" height="3" />
                    <line className="wick" x1={x} y1="124" x2={x} y2="116" />
                    <ellipse className="cake-flame" cx={x} cy="108" rx="14" ry="21" />
                    <ellipse className="cake-flame-core" cx={x} cy="112" rx="4" ry="8" />
                  </g>
                ))}
                <rect className="cake-tier cake-tier-top" x="135" y="166" width="150" height="62" rx="12" />
                <path className="top-icing" d="M135 176c18 12 26-8 42 3s30 10 45-1 25-5 38 3 17-2 25-5v-10H135z" />
                <rect className="cake-tier cake-tier-bottom" x="100" y="228" width="220" height="72" rx="13" />
                <path className="bottom-icing" d="M100 240c19 14 28-8 45 5s33 12 49-1 29-6 45 4 24 10 41-1 25-2 40-7v-12H100z" />
                {[126, 162, 198, 234, 270, 306].map((x) => (
                  <circle key={x} className="cake-dot" cx={x} cy="276" r="3" />
                ))}
              </svg>
            </button>

            <p className={"wish-hint" + (blown ? " visible" : "")} aria-live="polite">
              I hope you made a wish.
            </p>
          </div>
        </div>
      </section>

      {/* WISHES */}
      <section className="section wishes-section" ref={wishesRef}>
        <div className="container narrow">
          <h2 className="section-title center" data-reveal>And here are mine   <em>for you</em></h2>
          <p className="muted center" data-reveal>Each one, meant sincerely.</p>

          <div className="wishes" aria-live="polite">
            {WISHES.map((w, i) => {
              const unlocked = i <= revealed + 1;
              const open = i <= revealed;
              return (
                <div key={i} className={"wish" + (open ? " open" : "")}>
                  {!open ? (
                    <button
                      className="wish-btn"
                      disabled={!unlocked}
                      onClick={() => setRevealed((r) => Math.max(r, i))}
                    >
                      {unlocked ? `Open wish ${i + 1}` : `Wish ${i + 1} — soon`}
                    </button>
                  ) : (
                    <p className="wish-text italic">"{w}"</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="section closing">
        <div className="closing-bg" aria-hidden="true" />
        <div className="container narrow center">
          <div className="divider" data-reveal />
          <h2 className="closing-title" data-reveal>
            Happy <span className="italic">Birthday.</span>
          </h2>
          <p className="muted" data-reveal>May this year hold everything you've been quietly hoping for.</p>
          <p className="muted" data-reveal>With love, always</p>
        </div>
      </section>
    </main>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const CSS = `
:root {
  --bg: #FAF9F7;
  --rose: #E8B4B8;
  --rose-deep: #D4878C;
  --lavender: #C8C6E5;
  --text: #2C2C2C;
  --muted: #6F6F6F;
  --ease: cubic-bezier(0.32,0.72,0,1);
  --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
}
.bd-root {
  background: var(--bg);
  color: var(--text);
  font-family: 'Poppins', system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.7;
  overflow-x: hidden;
  position: relative;
}
.noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  opacity: 0.05; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>");
}
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; }
.container.narrow { max-width: 720px; }
.center { text-align: center; }
.section { padding: 96px 0; position: relative; }
.italic { font-family: 'Playfair Display', serif; font-style: italic; font-weight: 400; }
.muted { color: var(--muted); }

[data-reveal] {
  opacity: 0; transform: translateY(18px);
  transition: opacity 900ms var(--ease), transform 900ms var(--ease);
}
[data-reveal].is-revealed { opacity: 1; transform: none; }

/* HERO */
.hero { padding: 140px 0 120px; position: relative; overflow: hidden; }
.hero-bg {
  position: absolute; inset: -20%;
  background:
    radial-gradient(60% 50% at 30% 30%, rgba(232,180,184,0.35), transparent 70%),
    radial-gradient(50% 45% at 75% 60%, rgba(200,198,229,0.35), transparent 70%);
  filter: blur(20px);
}
.eyebrow {
  font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--rose-deep); margin-bottom: 28px;
}
.hero-title {
  font-family: 'Playfair Display', serif; font-weight: 600;
  font-size: clamp(44px, 7vw, 72px); line-height: 1.05;
  margin: 0 0 28px; letter-spacing: -0.01em;
}
.hero-sub { font-size: 18px; color: var(--muted); max-width: 480px; }
.scroll-hint {
  margin-top: 64px; font-size: 12px; letter-spacing: 0.2em;
  color: var(--muted); text-transform: uppercase;
  animation: bob 2.6s var(--ease) infinite;
}
@keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }

.kicker {
  font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--rose-deep); margin-bottom: 36px; text-align: center;
}
.lines { display: flex; flex-direction: column; gap: 28px; }
.line {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: clamp(20px, 2.4vw, 28px); line-height: 1.5; text-align: center;
  color: var(--text);
}

.section-title {
  font-family: 'Playfair Display', serif; font-weight: 600;
  font-size: clamp(26px, 4vw, 38px); margin: 0 0 16px; letter-spacing: -0.01em;
}

/* CARDS */
.grid-2 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 48px;
}
.glass {
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(255,255,255,0.7);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 10px 40px -20px rgba(212,135,140,0.25);
}
.card { border-radius: 18px; padding: 28px; }
.card-icon { font-size: 22px; color: var(--rose-deep); margin-bottom: 12px; }
.card-title { font-family: 'Playfair Display', serif; font-size: 22px; margin: 0 0 8px; }
.card-text { color: var(--muted); margin: 0; font-size: 15px; }

/* PORTRAIT */
.portrait { margin: 0; text-align: center; }
.portrait-frame {
  display: inline-block; padding: 14px; background: #fff;
  box-shadow: 0 30px 60px -30px rgba(44,44,44,0.25);
  transform: rotate(-1.2deg); border-radius: 4px;
}
.portrait-inner {
  width: min(360px, 70vw); aspect-ratio: 3/4;
  background:
    radial-gradient(80% 60% at 50% 40%, rgba(232,180,184,0.5), rgba(200,198,229,0.4) 60%, rgba(250,249,247,1));
  display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center;
  padding: 18px; color: var(--muted); font-size: 12px; letter-spacing: 0.16em;
  text-transform: uppercase;
}

.portrait-img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}
.portrait figcaption {
  margin-top: 20px; font-family: 'Playfair Display', serif; font-style: italic;
  color: var(--muted); font-size: 15px;
}

/* LETTER */
.letter { border-radius: 22px; padding: 48px; }
.letter p { margin: 0 0 18px; }
.letter-open { font-family: 'Playfair Display', serif; font-style: italic; font-size: 22px; margin-bottom: 24px !important; }
.letter-sign { margin-top: 24px; font-size: 20px; }

/* CAKE */
.cake-section { padding-bottom: 120px; }
.cake-wrap {
  position: relative; margin-top: 48px;
  border-radius: 28px; padding: 40px 20px 30px;
  background: linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
  border: 1px solid rgba(255,255,255,0.6);
  overflow: hidden;
}
.cake-btn {
  position: relative; z-index: 3; background: none; border: 0; padding: 0;
  display: block; width: 100%; height: 420px; cursor: pointer;
  transition: transform 600ms var(--ease-spring);
}
@media (max-width: 768px) { .cake-btn { height: 300px; } }
.cake-btn:focus-visible { outline: 2px solid var(--rose-deep); outline-offset: 8px; border-radius: 12px; }
.cake-canvas { display: block; width: 100%; height: 100%; }
.cake-illustration {
  display: block;
  width: min(100%, 520px);
  height: 100%;
  min-height: 300px;
  margin: 0 auto;
  overflow: visible;
  filter: drop-shadow(0 24px 26px rgba(212,135,140,0.18));
}
.cake-plate { fill: rgba(44,44,44,0.1); }
.cake-tier-bottom { fill: url(#cakeBottom); stroke: rgba(212,135,140,0.28); stroke-width: 1; }
.cake-tier-top { fill: url(#cakeTop); stroke: rgba(212,135,140,0.24); stroke-width: 1; }
.bottom-icing { fill: var(--rose); opacity: 0.88; }
.top-icing { fill: var(--lavender); opacity: 0.86; }
.cake-dot { fill: var(--rose-deep); opacity: 0.82; }
.candle { fill: #fffaf2; stroke: rgba(44,44,44,0.08); }
.candle-stripe { fill: var(--rose); }
.wick { stroke: var(--text); stroke-width: 1.4; stroke-linecap: round; }
.cake-flame { fill: url(#flameGlow); transform-origin: center; animation: flameDance 1.2s ease-in-out infinite; }
.cake-flame-core { fill: rgba(255,255,255,0.88); transform-origin: center; animation: flameDance 1s ease-in-out infinite reverse; }
.cake-smoke { opacity: 0; fill: none; stroke: rgba(111,111,111,0.45); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 46; stroke-dashoffset: 46; }
.cake-wrap.blown .cake-flame, .cake-wrap.blown .cake-flame-core { opacity: 0; animation: none; }
.cake-wrap.blown .cake-smoke { opacity: 1; animation: smokeRise 2.6s var(--ease) infinite; }
.cake-wrap.blown .cake-illustration { filter: drop-shadow(0 28px 34px rgba(232,180,184,0.28)); }
.cake-wrap.ambient .cake-btn { animation: pulse 3s var(--ease) infinite; }
.cake-wrap.blown .cake-btn { animation: none; cursor: default; }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
@keyframes flameDance { 0%,100%{transform:scale(1)} 50%{transform:scale(0.9,1.1) translateY(-1px)} }
@keyframes smokeRise { 0%{stroke-dashoffset:46; transform:translateY(10px); opacity:.15} 35%{opacity:.55} 100%{stroke-dashoffset:0; transform:translateY(-20px); opacity:0} }

.garland {
  position: absolute; top: 14px; left: 5%; right: 5%; height: 24px;
  display: flex; justify-content: space-between; align-items: center;
  z-index: 2;
}
.garland::before {
  content: ""; position: absolute; left: 0; right: 0; top: 50%;
  height: 1px; background: rgba(212,135,140,0.3);
}
.bulb {
  width: 8px; height: 8px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff, var(--rose));
  opacity: 0.35; transition: opacity 600ms var(--ease), box-shadow 600ms var(--ease);
}
.cake-wrap.ambient .bulb {
  opacity: 0.85;
  box-shadow: 0 0 12px rgba(232,180,184,0.7);
  animation: flicker 4s ease-in-out infinite;
}
@keyframes flicker { 0%,100%{opacity:.85} 50%{opacity:.55} }

.orbs, .petals { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.orb {
  position: absolute; width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(232,180,184,0.7) 50%, transparent 75%);
  filter: blur(0.5px);
  opacity: 0; animation: float 8s ease-in-out infinite;
}
.cake-wrap.ambient .orb { opacity: 0.85; }
@keyframes float {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(20px,-30px) scale(1.15); }
}
.petal {
  position: absolute; top: -20px; width: 10px; height: 6px; border-radius: 50%;
  background: var(--rose); opacity: 0;
  animation: fall 10s linear infinite;
}
.cake-wrap.ambient .petal { opacity: 0.5; }
@keyframes fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.5; }
  100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
}

.confetti {
  position: absolute; width: 8px; height: 14px; border-radius: 2px;
  pointer-events: none; z-index: 5;
  animation: pop 1.6s var(--ease-spring) forwards;
}
@keyframes pop {
  0% { transform: translate(0,0) rotate(0); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) rotate(var(--r)); opacity: 0; }
}
.wish-hint {
  margin-top: 24px; text-align: center;
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 22px; color: var(--rose-deep);
  opacity: 0; transform: translateY(10px);
  transition: opacity 800ms var(--ease), transform 800ms var(--ease);
}
.wish-hint.visible { opacity: 1; transform: none; }

/* WISHES */
.wishes { display: flex; flex-direction: column; gap: 18px; margin-top: 48px; }
.wish {
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px; padding: 24px 28px;
  transition: all 600ms var(--ease-spring);
}
.wish.open { background: rgba(232,180,184,0.12); }
.wish-btn {
  width: 100%; background: none; border: 0; padding: 8px 0;
  font-family: 'Poppins', sans-serif; font-size: 14px;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--rose-deep); cursor: pointer;
  transition: opacity 300ms var(--ease), transform 300ms var(--ease);
}
.wish-btn:disabled { color: var(--muted); opacity: 0.4; cursor: not-allowed; }
.wish-btn:hover:not(:disabled) { transform: translateY(-1px); }
.wish-text {
  margin: 0; font-size: clamp(18px, 2.2vw, 24px);
  line-height: 1.5; color: var(--text); text-align: center;
  animation: fadeIn 700ms var(--ease) both;
}
@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

/* CLOSING */
.closing { padding: 140px 0; overflow: hidden; }
.closing-bg {
  position: absolute; inset: -20%;
  background:
    radial-gradient(50% 50% at 50% 50%, rgba(232,180,184,0.25), transparent 70%),
    radial-gradient(40% 40% at 70% 30%, rgba(200,198,229,0.25), transparent 70%);
  filter: blur(20px);
}
.divider {
  width: 60px; height: 1px; background: var(--rose-deep);
  margin: 0 auto 32px;
}
.closing-title {
  font-family: 'Playfair Display', serif; font-weight: 600;
  font-size: clamp(36px, 6vw, 60px); margin: 0 0 16px; letter-spacing: -0.01em;
}

/* MOBILE */
@media (max-width: 768px) {
  .section { padding: 72px 0; }
  .hero { padding: 100px 0 80px; }
  .grid-2 { grid-template-columns: 1fr; }
  .letter { padding: 32px 24px; }
  .wish-btn { width: 90%; margin: 0 auto; display: block; }
}
`;
