import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text } from "react-native";

import GameShell from "../../../components/GameShell";
import { HUD_HEIGHT, HudPill, HudRow, useFloaters } from "../../../components/Hud";
import { TimerBar } from "../../../components/ProgressBar";
import { getGame } from "../../../data/games";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { colors, nativeDriver } from "../../../theme";
import { pick } from "../../../utils/helpers";
import { instantPress } from "../../../utils/press";
import { Body, Garden, HoleBox, Status } from "./style";

const GAME = getGame("bugs");
const DURATION = 30; // segundos
const GAP = 12;
const EMPTY = Array(9).fill(null);
const BUGS = ["🐛", "🐜", "🐞"];
// every = intervalo entre um bicho e outro, stay = quanto tempo ele fica para fora (em ms)
const CONFIG = {
  facil: { every: 950, stay: 1500 },
  medio: { every: 720, stay: 1150 },
  dificil: { every: 520, stay: 850 },
};

function newTarget(id) {
  const roll = Math.random();
  if (roll < 0.16) return { id, kind: "bip", emoji: "🤖" };
  if (roll < 0.24) return { id, kind: "gold", emoji: "🦋" };
  return { id, kind: "bug", emoji: pick(BUGS) };
}

function Hole({ size, target, onPress }) {
  const rise = useRef(new Animated.Value(0)).current;
  const last = useRef(null); // guarda o último bicho para ele continuar visível enquanto desce
  if (target) last.current = target;
  const up = !!target;

  useEffect(() => {
    Animated.spring(rise, {
      toValue: up ? 1 : 0,
      friction: 6,
      tension: 150,
      useNativeDriver: nativeDriver,
    }).start();
  }, [rise, up]);

  const shown = last.current;
  const face = !shown ? "" : !shown.hit ? shown.emoji : shown.kind === "bip" ? "😵" : "💥";
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [size * 0.85, 0] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={target ? `Toca: ${target.emoji}` : "Toca vazia"}
      {...instantPress}
      onPressIn={onPress}
      style={{ width: size, height: size }}
    >
      <HoleBox style={{ borderRadius: size / 2 }}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Text allowFontScaling={false} style={{ fontSize: size * 0.5, lineHeight: size * 0.68 }}>
            {face}
          </Text>
        </Animated.View>
      </HoleBox>
    </Pressable>
  );
}

function Board({ mode, finish, area }) {
  const config = CONFIG[mode.id];
  const [holes, setHoles] = useState(EMPTY);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ouch, setOuch] = useState(false);
  const live = useRef(EMPTY); // cópia de "holes" que os timers conseguem ler sempre atualizada
  const counts = useRef({ ids: 0, spawned: 0, hits: 0, bipHits: 0 });
  const clock = useRef(new Animated.Value(1)).current;
  const later = useTimers();
  const [floaters, float] = useFloaters();
  const [shakeStyle, shake] = useShake();

  const over = timeLeft <= 0;
  const size = Math.max(
    64,
    Math.floor(Math.min((area.width - GAP * 2) / 3, (area.height - HUD_HEIGHT - 110 - GAP * 2) / 3, 150))
  );

  function setHole(index, target) {
    live.current = live.current.map((hole, position) => (position === index ? target : hole));
    setHoles(live.current);
  }

  useEffect(() => {
    const countdown = Animated.timing(clock, {
      toValue: 0,
      duration: DURATION * 1000,
      easing: Easing.linear,
      useNativeDriver: nativeDriver,
    });
    countdown.start();
    const ticker = setInterval(() => setTimeLeft((current) => Math.max(0, current - 1)), 1000);
    return () => {
      countdown.stop();
      clearInterval(ticker);
    };
  }, [clock]);

  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 3) fx("tick");
  }, [timeLeft]);

  // de tempos em tempos um bicho sai de uma toca vazia
  useEffect(() => {
    if (over) return undefined;
    const spawner = setInterval(() => {
      const free = live.current.map((hole, index) => (hole ? null : index)).filter((index) => index !== null);
      if (free.length === 0) return;

      const index = pick(free);
      counts.current.ids += 1;
      const target = newTarget(counts.current.ids);
      if (target.kind !== "bip") counts.current.spawned += 1;
      setHole(index, target);

      later(() => {
        const hole = live.current[index];
        if (!hole || hole.id !== target.id || hole.hit) return;
        setHole(index, null); // fugiu!
        if (target.kind !== "bip") setCombo(0);
      }, target.kind === "gold" ? config.stay * 0.75 : config.stay);
    }, config.every);
    return () => clearInterval(spawner);
  }, [over, config]);

  useEffect(() => {
    if (!over) return undefined;
    live.current = EMPTY;
    setHoles(EMPTY);
    const timer = setTimeout(() => {
      const { spawned, hits, bipHits } = counts.current;
      const accuracy = spawned > 0 ? hits / spawned : 0;
      finish({
        score,
        stars: accuracy >= 0.8 && bipHits <= 1 ? 3 : accuracy >= 0.6 ? 2 : accuracy >= 0.35 ? 1 : 0,
        message:
          bipHits === 0
            ? `Você pegou ${hits} de ${spawned} bugs sem acertar o Bip!`
            : `Você pegou ${hits} de ${spawned} bugs, mas acertou o Bip ${bipHits}x.`,
        stats: [
          { label: "Bugs", value: `${hits}/${spawned}` },
          { label: "Bip atingido", value: `${bipHits}x` },
        ],
        detail: { hits, bipHits },
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [over, finish, score]);

  function hit(index) {
    const target = live.current[index];
    if (over || !target || target.hit) return;

    setHole(index, { ...target, hit: true });
    later(() => {
      if (live.current[index]?.id === target.id) setHole(index, null);
    }, 350);

    const spot = {
      x: (index % 3) * (size + GAP) + size / 2 - 24,
      y: Math.floor(index / 3) * (size + GAP) - 8,
    };

    if (target.kind === "bip") {
      counts.current.bipHits += 1;
      fx("wrong");
      shake();
      setCombo(0);
      setScore((current) => Math.max(0, current - 20));
      setOuch(true);
      later(() => setOuch(false), 1300);
      float("−20", { color: colors.coral, ...spot });
      return;
    }

    const gained = (target.kind === "gold" ? 30 : 10) + (combo >= 2 ? 5 : 0);
    counts.current.hits += 1;
    fx(target.kind === "gold" ? "star" : "pop");
    setCombo(combo + 1);
    setScore((current) => current + gained);
    float(`+${gained}`, { color: target.kind === "gold" ? colors.yellow : colors.lime, ...spot });
  }

  return (
    <>
      <HudRow>
        <HudPill icon="⏱️" value={timeLeft} label="Segundos" />
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="🔥" value={combo} label="Combo" />
      </HudRow>
      <TimerBar progress={clock} />

      <Body>
        <Status $alert={ouch} accessibilityLiveRegion="polite">
          {ouch ? "Ai! Eu sou seu amigo! 🤖" : "Toque nos bugs, mas poupe o Bip!"}
        </Status>

        <Animated.View style={shakeStyle}>
          <Garden style={{ gap: GAP, width: size * 3 + GAP * 2 }}>
            {holes.map((target, index) => (
              <Hole key={index} size={size} target={target} onPress={() => hit(index)} />
            ))}
            {floaters}
          </Garden>
        </Animated.View>
      </Body>
    </>
  );
}

export default function BugHunt() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
