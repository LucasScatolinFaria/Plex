import { useEffect, useRef, useState } from "react";
import { Animated, Pressable } from "react-native";

import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { glow, nativeDriver } from "../../../theme";
import { randomInt } from "../../../utils/helpers";
import { instantPress } from "../../../utils/press";
import { Body, Hub, HubLabel, HubNumber, PadLight, Status, Wheel } from "./style";

const GAME = getGame("genius");
const MAX_ROUNDS = 20;
const GAP = 12;
const MULTIPLIER = { facil: 1, medio: 1.5, dificil: 2 };
// quanto tempo cada cor fica acesa e a pausa entre uma cor e outra (em ms)
const SPEED = {
  facil: { on: 520, gap: 240 },
  medio: { on: 380, gap: 170 },
  dificil: { on: 260, gap: 120 },
};
const PADS = [
  { name: "verde", color: "#22C55E", corner: "borderTopLeftRadius" },
  { name: "vermelho", color: "#EF4444", corner: "borderTopRightRadius" },
  { name: "amarelo", color: "#FACC15", corner: "borderBottomLeftRadius" },
  { name: "azul", color: "#3B82F6", corner: "borderBottomRightRadius" },
];
const STATUS = {
  watch: "👀 Observe a sequência...",
  repeat: "👉 Sua vez! Repita.",
  cheer: "✨ Boa! Lá vem mais uma...",
  fail: "💥 Ops! Não era essa.",
  win: "🏆 Você zerou o Genius!",
};

function Pad({ pad, size, lit, onPress }) {
  const light = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(light, {
      toValue: lit ? 1 : 0,
      duration: lit ? 60 : 180,
      useNativeDriver: nativeDriver,
    }).start();
  }, [light, lit]);

  const scale = light.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cor ${pad.name}`}
      {...instantPress}
      onPressIn={onPress}
    >
      <Animated.View
        style={[
          { width: size, height: size, borderRadius: 18, overflow: "hidden", backgroundColor: pad.color },
          { [pad.corner]: size },
          lit ? glow(pad.color, 30) : null,
          { transform: [{ scale }] },
        ]}
      >
        <PadLight style={{ opacity: light }} />
      </Animated.View>
    </Pressable>
  );
}

function Board({ mode, finish, area }) {
  const speed = SPEED[mode.id];
  const [sequence, setSequence] = useState(() => [randomInt(0, 3)]);
  const [phase, setPhase] = useState("watch"); // watch → repeat → cheer → watch ... até fail ou win
  const [step, setStep] = useState(0); // quantas cores o jogador já acertou nesta rodada
  const [lit, setLit] = useState(null); // { pad, id } da cor acesa agora
  const flashes = useRef(0);
  const later = useTimers();
  const [shakeStyle, shake] = useShake();

  const completed = phase === "win" ? sequence.length : sequence.length - 1;

  function flash(pad, duration) {
    flashes.current += 1;
    const id = flashes.current;
    setLit({ pad, id });
    later(() => setLit((current) => (current?.id === id ? null : current)), duration);
  }

  // mostra a sequência inteira, uma cor de cada vez
  useEffect(() => {
    if (phase !== "watch") return undefined;
    const stride = speed.on + speed.gap;
    const timers = sequence.map((pad, index) =>
      setTimeout(() => {
        fx(`pad${pad}`);
        flash(pad, speed.on);
      }, 700 + index * stride)
    );
    timers.push(
      setTimeout(() => {
        setStep(0);
        setPhase("repeat");
      }, 700 + sequence.length * stride)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, sequence, speed]);

  useEffect(() => {
    if (phase !== "fail" && phase !== "win") return undefined;
    const timer = setTimeout(() => {
      finish({
        score: Math.round(completed * 10 * MULTIPLIER[mode.id]),
        stars: completed >= 8 ? 3 : completed >= 5 ? 2 : completed >= 3 ? 1 : 0,
        message:
          completed > 0
            ? `Você repetiu uma sequência de ${completed} ${completed === 1 ? "cor" : "cores"}!`
            : "Observe com calma a sequência e tente de novo.",
        stats: [{ label: "Rodadas", value: completed }],
        detail: { rounds: completed },
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, finish, completed, mode.id]);

  // Os botões ficam sempre ativos: desativar um botão no meio do toque faz o navegador
  // perder o fim do clique, e o próximo toque não seria contado.
  function press(pad) {
    if (phase !== "repeat") return;
    flash(pad, 220);

    if (pad !== sequence[step]) {
      fx("wrong");
      shake();
      setPhase("fail");
      return;
    }

    fx(`pad${pad}`);
    if (step + 1 < sequence.length) {
      setStep(step + 1);
      return;
    }
    if (sequence.length === MAX_ROUNDS) {
      setPhase("win");
      return;
    }
    setPhase("cheer");
    later(() => {
      setSequence([...sequence, randomInt(0, 3)]);
      setPhase("watch");
    }, 900);
  }

  const wheel = Math.max(220, Math.min(area.width, area.height - HUD_HEIGHT - 90, 440));
  const padSize = Math.floor((wheel - GAP * 3) / 2);
  const hub = wheel * 0.3;

  return (
    <>
      <HudRow>
        <HudPill icon="🎵" value={sequence.length} label="Rodada" />
        <HudPill icon="⭐" value={Math.round(completed * 10 * MULTIPLIER[mode.id])} label="Pontos" />
      </HudRow>

      <Body>
        <Status accessibilityLiveRegion="polite">{STATUS[phase]}</Status>

        <Animated.View style={shakeStyle}>
          <Wheel style={{ width: wheel, height: wheel, padding: GAP, gap: GAP }}>
            {PADS.map((pad, index) => (
              <Pad
                key={pad.name}
                pad={pad}
                size={padSize}
                lit={lit?.pad === index}
                onPress={() => press(index)}
              />
            ))}
            <Hub
              style={{
                width: hub,
                height: hub,
                top: (wheel - hub) / 2,
                left: (wheel - hub) / 2,
                pointerEvents: "none",
              }}
            >
              <HubNumber style={{ fontSize: hub * 0.42, lineHeight: hub * 0.5 }}>
                {phase === "repeat" ? `${step}/${sequence.length}` : sequence.length}
              </HubNumber>
              <HubLabel>{phase === "repeat" ? "acertos" : "rodada"}</HubLabel>
            </Hub>
          </Wheel>
        </Animated.View>
      </Body>
    </>
  );
}

export default function Genius() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
