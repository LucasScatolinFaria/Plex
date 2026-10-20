// Estádio desenhado em SVG (só no navegador; no celular o arquivo é o Scene.native.js).
// Céu com estrelas e lua, torres de refletor com fachos de luz, arquibancada lotada fazendo a ola,
// placa de LED com letreiro andando e o gramado listrado. A cena é montada na proporção exata da tela
// (o viewBox acompanha a largura/altura), então nada fica esticado nem cortado.
// As animações são de CSS (quem desenha é a placa de vídeo); com os efeitos desligados tudo fica parado.
import { useMemo } from "react";

const H = 1000;
const STAND_BOTTOM = 440;
const BOARD = 36;
const FIELD_TOP = STAND_BOTTOM + BOARD;

const SKIN = ["#F8D5B8", "#E8B48F", "#C68B59", "#8D5524", "#FFDBAC", "#D9A066"];
const SHIRTS = [
  "#FFD23F",
  "#FF5FA2",
  "#22D3EE",
  "#A3E635",
  "#FF7A1A",
  "#C4B5FD",
  "#FFFFFF",
  "#3B82F6",
  "#EF4444",
  "#22C55E",
];
const FLAGS = ["#EF4444", "#FFD23F", "#22C55E", "#3B82F6", "#EC4899", "#F97316", "#8B5CF6"];
const MARQUEE =
  "⚽ JES KIDS 2026   🏆 JOGOS ESTUDANTIS SESI   📣 TORÇA PELA SUA SALA   ⭐ JOGO LIMPO É JOGO BONITO   ";

const CSS = `
.jesFan { animation: jesOla 7s ease-in-out infinite; transform-box: fill-box; }
@keyframes jesOla { 0%, 15%, 100% { transform: translateY(0); } 6% { transform: translateY(-18px); } }
.jesStar { animation: jesTwinkle 2.6s ease-in-out infinite alternate; }
@keyframes jesTwinkle { from { opacity: 0.2; } to { opacity: 1; } }
.jesGlow { animation: jesGlow 3.8s ease-in-out infinite alternate; }
@keyframes jesGlow { from { opacity: 0.5; } to { opacity: 0.9; } }
.jesBeamL { animation: jesSwayL 8s ease-in-out infinite alternate; transform-box: view-box; }
.jesBeamR { animation: jesSwayR 9s ease-in-out infinite alternate; transform-box: view-box; }
@keyframes jesSwayL { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
@keyframes jesSwayR { from { transform: rotate(4deg); } to { transform: rotate(-5deg); } }
.jesMarquee { animation: jesMarquee 30s linear infinite; transform-box: fill-box; }
@keyframes jesMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.jesFlag { animation: jesWave 1.2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: left center; }
@keyframes jesWave { from { transform: skewY(-12deg); } to { transform: skewY(10deg); } }
.jesStill * { animation: none !important; }
`;

// sorteio com semente: a torcida e as estrelas ficam sempre iguais
function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildScene(W) {
  const random = seeded(17);
  const pick = (list) => list[Math.floor(random() * list.length)];
  // a borda de cima da arquibancada é curva: mais alta no meio, como um estádio visto do gramado
  const rim = (x) => 210 + 80 * Math.pow((2 * x) / W - 1, 2);

  const stars = Array.from({ length: Math.round(W / 40) }, () => {
    const x = random() * W;
    return { x, y: 12 + random() * (rim(x) - 60), r: 1 + random() * 1.8, delay: -random() * 3 };
  });

  // torcida em colunas (cada coluna pula junto na ola)
  const spacing = 30;
  const columns = Math.floor(W / spacing);
  const fans = Array.from({ length: columns }, (_, column) => {
    const people = [];
    for (let row = 0; row < 4; row++) {
      const x = column * spacing + 15 + (row % 2) * (spacing / 2);
      if (x > W - 8) continue;
      const top = rim(x) + 22;
      const y = top + (row + 0.5) * ((STAND_BOTTOM - top - 14) / 4);
      people.push({ x, y, skin: pick(SKIN), shirt: pick(SHIRTS), flag: random() < 0.12 ? pick(FLAGS) : null });
    }
    return { delay: (column / columns) * 3.4, people };
  });

  // linhas dos degraus da arquibancada
  const steps = [0.25, 0.5, 0.75].map((fraction) => {
    const points = [];
    for (let x = 0; x <= W; x += W / 24) {
      const top = rim(x) + 22;
      points.push(`${x.toFixed(0)},${(top + fraction * (STAND_BOTTOM - top)).toFixed(0)}`);
    }
    return points.join(" ");
  });

  let rimPath = `M0 ${rim(0)}`;
  for (let x = W / 24; x <= W + 1; x += W / 24) rimPath += ` L${x.toFixed(0)} ${rim(x).toFixed(0)}`;

  // bandeirinhas penduradas na borda
  const flags = [];
  for (let x = 20, index = 0; x < W - 20; x += 42, index++) {
    flags.push({ x, y: rim(x) + 4, color: FLAGS[index % FLAGS.length] });
  }

  // listras do gramado: cada faixa um pouco mais alta que a de cima (perspectiva)
  const bands = [];
  for (let y = FIELD_TOP, height = 22, index = 0; y < H; y += height, height *= 1.2, index++) {
    if (index % 2 === 0) bands.push({ y, height });
  }

  return {
    stars,
    fans,
    steps,
    rimPath,
    flags,
    bands,
    towers: [W * 0.07, W * 0.93],
    standPath: `${rimPath} L${W} ${STAND_BOTTOM} L0 ${STAND_BOTTOM} Z`,
  };
}

function Tower({ x, side }) {
  return (
    <g>
      <polygon
        className={side === "left" ? "jesBeamL" : "jesBeamR"}
        style={{ transformOrigin: `${x}px 96px` }}
        points={
          side === "left"
            ? `${x - 30},96 ${x + 30},96 ${x + 520},${H} ${x + 40},${H}`
            : `${x - 30},96 ${x + 30},96 ${x - 40},${H} ${x - 520},${H}`
        }
        fill="url(#jesBeam)"
        opacity="0.55"
      />
      <circle className="jesGlow" cx={x} cy={62} r={150} fill="url(#jesLamp)" />
      <rect x={x - 6} y={70} width={12} height={STAND_BOTTOM - 70} fill="#334155" />
      <rect x={x - 58} y={30} width={116} height={64} rx={10} fill="#1E293B" stroke="#94A3B8" strokeWidth={3} />
      {[0, 1].map((row) =>
        [0, 1, 2, 3].map((column) => (
          <circle key={`${row}-${column}`} cx={x - 39 + column * 26} cy={50 + row * 25} r={9.5} fill="#FFF8D6" />
        ))
      )}
    </g>
  );
}

export default function Scene({ animated, width, height }) {
  const W = Math.max(460, Math.min(2400, Math.round((1000 * width) / Math.max(1, height) / 20) * 20));
  const scene = useMemo(() => buildScene(W), [W]);
  const marquee = MARQUEE.repeat(Math.ceil(W / 900) + 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMin slice"
      className={animated ? undefined : "jesStill"}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <defs>
        <linearGradient id="jesSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060D2E" />
          <stop offset="1" stopColor="#1A2C74" />
        </linearGradient>
        <linearGradient id="jesStand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A3A7C" />
          <stop offset="1" stopColor="#17204F" />
        </linearGradient>
        <linearGradient id="jesGrass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C9A48" />
          <stop offset="1" stopColor="#0B5A28" />
        </linearGradient>
        <linearGradient id="jesBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBE6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFBE6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="jesLamp">
          <stop offset="0" stopColor="#FFF8D6" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFF8D6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="jesMoon">
          <stop offset="0" stopColor="#FFF6C9" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFF6C9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={FIELD_TOP} fill="url(#jesSky)" />
      {scene.stars.map((star, index) => (
        <circle
          key={index}
          className="jesStar"
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#FFFFFF"
          style={{ animationDelay: `${star.delay}s` }}
        />
      ))}
      <circle cx={W * 0.74} cy={86} r={70} fill="url(#jesMoon)" />
      <circle cx={W * 0.74} cy={86} r={26} fill="#FFF6C9" />
      <circle cx={W * 0.74 + 9} cy={80} r={23} fill="#1A2C74" opacity="0.35" />

      {scene.towers.map((x, index) => (
        <Tower key={x} x={x} side={index === 0 ? "left" : "right"} />
      ))}

      <path d={scene.standPath} fill="url(#jesStand)" />
      {scene.steps.map((points) => (
        <polyline key={points} points={points} fill="none" stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth={2} />
      ))}
      {scene.fans.map((column, index) => (
        <g key={index} className="jesFan" style={{ animationDelay: `${column.delay}s` }}>
          {column.people.map((person) => (
            <g key={`${person.x}-${person.y}`}>
              {person.flag ? (
                <g>
                  <rect x={person.x + 7} y={person.y - 34} width={2.5} height={30} fill="#E2E8F0" />
                  <rect
                    className="jesFlag"
                    x={person.x + 9.5}
                    y={person.y - 34}
                    width={22}
                    height={14}
                    fill={person.flag}
                  />
                </g>
              ) : null}
              <rect x={person.x - 10} y={person.y + 5} width={20} height={17} rx={7} fill={person.shirt} />
              <circle cx={person.x} cy={person.y} r={8} fill={person.skin} />
            </g>
          ))}
        </g>
      ))}
      <path d={scene.rimPath} fill="none" stroke="#CBD5E1" strokeWidth={7} strokeLinejoin="round" />
      {scene.flags.map((flag) => (
        <polygon
          key={flag.x}
          points={`${flag.x},${flag.y} ${flag.x + 18},${flag.y} ${flag.x + 9},${flag.y + 22}`}
          fill={flag.color}
        />
      ))}

      <rect y={STAND_BOTTOM} width={W} height={BOARD} fill="#0A0F1E" />
      <rect y={STAND_BOTTOM} width={W} height={3} fill="#FFD23F" opacity="0.7" />
      <g className="jesMarquee">
        <text
          x={0}
          y={STAND_BOTTOM + 25}
          fontFamily="Fredoka_700Bold, sans-serif"
          fontSize={21}
          letterSpacing={2}
          fill="#FFD23F"
        >
          {marquee}
          {marquee}
        </text>
      </g>

      <rect y={FIELD_TOP} width={W} height={H - FIELD_TOP} fill="url(#jesGrass)" />
      {scene.bands.map((band) => (
        <rect key={band.y} y={band.y} width={W} height={band.height} fill="#FFFFFF" opacity="0.05" />
      ))}
      <g fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth={3}>
        <line x1={0} y1={FIELD_TOP + 18} x2={W} y2={FIELD_TOP + 18} />
        <line x1={W / 2} y1={FIELD_TOP + 18} x2={W / 2} y2={H} />
        <ellipse cx={W / 2} cy={650} rx={Math.min(W * 0.17, 230)} ry={62} />
      </g>
      <circle cx={W / 2} cy={650} r={6} fill="#FFFFFF" opacity="0.6" />

      {/* véu escuro por cima, para os textos da página continuarem fáceis de ler */}
      <rect width={W} height={H} fill="#020B06" opacity="0.28" />
    </svg>
  );
}
