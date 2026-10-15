import { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";

import Button from "../../../components/Button";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow, useFloaters } from "../../../components/Hud";
import ProgressBar from "../../../components/ProgressBar";
import { getGame } from "../../../data/games";
import { SONGS } from "../../../data/songs";
import useLoop from "../../../hooks/useLoop";
import { pianoOff, pianoOn, preloadPiano } from "../../../services/feedback";
import { shadow, textShadow } from "../../../theme";
import {
  BlackKey,
  Body,
  Finger,
  Hint,
  KeyLetter,
  KeyTag,
  Keyboard,
  NoteBubble,
  NoteName,
  Notes,
  Sheet,
  SongTitle,
  WhiteKey,
} from "./style";

const GAME = getGame("piano");

// midi 60 = Dó central. Teclas brancas, da esquerda para a direita:
const WHITE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
// teclas pretas: [nota, posição da tecla branca que fica à esquerda dela]
const BLACK = [[61, 0], [63, 1], [66, 3], [68, 4], [70, 5], [73, 7], [75, 8]];
const NAMES = {
  60: "Dó", 61: "Dó♯", 62: "Ré", 63: "Ré♯", 64: "Mi", 65: "Fá", 66: "Fá♯", 67: "Sol", 68: "Sol♯",
  69: "Lá", 70: "Si♭", 71: "Si", 72: "Dó", 73: "Dó♯", 74: "Ré", 75: "Ré♯", 76: "Mi",
};
// cada nota tem sempre a mesma cor, para ajudar a decorar
const COLORS = {
  Dó: "#EF4444", Ré: "#F97316", Mi: "#EAB308", Fá: "#22C55E", Sol: "#06B6D4", Lá: "#3B82F6", Si: "#8B5CF6",
};
const colorOf = (midi) => COLORS[NAMES[midi].replace(/[♯♭]/, "")];
// teclado do computador: a fileira do A toca as brancas e a de cima toca as pretas
const COMPUTER_KEYS = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ";": 76, ç: 76,
};
const LETTERS = Object.fromEntries(Object.entries(COMPUTER_KEYS).map(([letter, midi]) => [midi, letter.toUpperCase()]));

function Board({ mode, finish, area }) {
  const song = SONGS[mode.id]; // no modo livre não tem música
  const total = song ? song.notes.length : 0;

  // "game" guarda os valores sempre atuais (dois dedos podem tocar no mesmo instante); "view" é a cópia desenhada
  const game = useRef({ position: 0, mistakes: 0, played: 0 }).current;
  const [view, setView] = useState({ position: 0, mistakes: 0, played: 0 });
  const [down, setDown] = useState([]); // teclas apertadas agora
  const [wrong, setWrong] = useState(null);
  const [demoNote, setDemoNote] = useState(null); // nota que o Bip está tocando no "ouvir"
  const [listening, setListening] = useState(false);

  const touched = useRef(new Set()); // teclas seguradas com o dedo ou o mouse
  const typed = useRef(new Set()); // teclas seguradas pelo teclado do computador
  const origin = useRef({ x: 0, y: 0 });
  const keyboard = useRef(null);
  const demo = useRef({ playing: false, timers: [] });
  const [floaters, float] = useFloaters();
  const pulse = useLoop(500);

  const whiteWidth = area.width / WHITE.length;
  const whiteHeight = Math.max(150, Math.min(250, area.height * 0.38));
  const blackWidth = whiteWidth * 0.62;
  const blackHeight = whiteHeight * 0.6;
  const blackLeft = (after) => (after + 1) * whiteWidth - blackWidth / 2;

  const done = !!song && view.position >= total;
  const next = song && !done && !listening ? song.notes[view.position][0] : null;

  useEffect(() => {
    preloadPiano();
  }, []);

  // Uma tecla acabou de descer (dedo, mouse ou teclado): o som sai aqui, antes de qualquer desenho.
  function strike(midi) {
    pianoOn(midi);
    const whiteIndex = WHITE.indexOf(midi);
    const x = whiteIndex >= 0 ? whiteIndex * whiteWidth + whiteWidth / 2 : blackLeft(BLACK.find(([note]) => note === midi)[1]) + blackWidth / 2;
    float("♪", { x: x - 9, y: -30, color: colorOf(midi), size: 26 });

    if (!song) {
      game.played += 1;
    } else if (!demo.current.playing && game.position < total) {
      if (midi === song.notes[game.position][0]) {
        game.position += 1;
      } else {
        game.mistakes += 1;
        setWrong(midi);
        setTimeout(() => setWrong((current) => (current === midi ? null : current)), 280);
      }
    }
    setView({ ...game });
  }

  function refresh() {
    setDown([...touched.current, ...typed.current]);
  }

  /* ---------- dedos e mouse ---------- */

  function keyAt(pageX, pageY) {
    const x = pageX - origin.current.x;
    const y = pageY - origin.current.y;
    if (x < 0 || x >= area.width || y < 0 || y > whiteHeight) return null;
    if (y <= blackHeight) {
      const black = BLACK.find(([, after]) => Math.abs(x - (after + 1) * whiteWidth) <= blackWidth / 2);
      if (black) return black[0];
    }
    return WHITE[Math.floor(x / whiteWidth)];
  }

  // Olha onde está cada dedo e descobre quais teclas desceram e quais subiram (dá para arrastar e tocar acordes).
  function handleTouches(event) {
    const pressed = new Set();
    (event.nativeEvent.touches || []).forEach((touch) => {
      const midi = keyAt(touch.pageX, touch.pageY);
      if (midi) pressed.add(midi);
    });
    touched.current.forEach((midi) => {
      if (!pressed.has(midi) && !typed.current.has(midi)) pianoOff(midi);
    });
    pressed.forEach((midi) => {
      if (!touched.current.has(midi)) strike(midi);
    });
    touched.current = pressed;
    refresh();
  }

  function measure() {
    if (keyboard.current) {
      keyboard.current.measureInWindow((x, y) => {
        origin.current = { x, y };
      });
    }
  }

  /* ---------- teclado do computador (só no site) ---------- */

  const strikeRef = useRef(strike);
  strikeRef.current = strike;

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const onKeyDown = (event) => {
      const midi = COMPUTER_KEYS[event.key.toLowerCase()];
      if (!midi || event.repeat || event.ctrlKey || event.metaKey || typed.current.has(midi)) return;
      typed.current.add(midi);
      strikeRef.current(midi);
      setDown([...touched.current, ...typed.current]);
    };
    const onKeyUp = (event) => {
      const midi = COMPUTER_KEYS[event.key.toLowerCase()];
      if (!midi || !typed.current.delete(midi)) return;
      if (!touched.current.has(midi)) pianoOff(midi);
      setDown([...touched.current, ...typed.current]);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ---------- "ouvir a música" ---------- */

  function stopDemo() {
    demo.current.timers.forEach(clearTimeout);
    demo.current = { playing: false, timers: [] };
    setDemoNote(null);
    setListening(false);
  }

  function playDemo() {
    if (demo.current.playing) {
      stopDemo();
      return;
    }
    demo.current.playing = true;
    setListening(true);
    let at = 250;
    song.notes.forEach(([midi, beats]) => {
      const length = beats * song.beat;
      demo.current.timers.push(
        setTimeout(() => {
          pianoOn(midi);
          setDemoNote(midi);
        }, at),
        setTimeout(() => {
          pianoOff(midi);
          setDemoNote((current) => (current === midi ? null : current));
        }, at + length * 0.85)
      );
      at += length;
    });
    demo.current.timers.push(setTimeout(stopDemo, at + 150));
  }

  useEffect(() => () => demo.current.timers.forEach(clearTimeout), []);

  /* ---------- fim ---------- */

  useEffect(() => {
    if (!done) return undefined;
    const { mistakes } = view;
    const timer = setTimeout(() => {
      finish({
        score: Math.max(20, total * 10 - mistakes * 5),
        stars: mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1,
        message:
          mistakes === 0
            ? `Você tocou “${song.title}” sem errar nenhuma nota!`
            : `Você tocou “${song.title}” inteira, com ${mistakes} ${mistakes === 1 ? "escorregão" : "escorregões"}.`,
        stats: [
          { label: "Notas", value: total },
          { label: "Erros", value: mistakes },
        ],
        detail: { mistakes },
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [done, finish, view, total, song]);

  const upcoming = song ? song.notes.slice(view.position, view.position + 6) : [];
  const fingerLift = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const lit = (midi) => down.includes(midi) || demoNote === midi;

  return (
    <>
      <HudRow>
        {song ? (
          <>
            <HudPill icon="🎵" value={`${view.position}/${total}`} label="Notas" />
            <HudPill icon="🙈" value={view.mistakes} label="Erros" />
          </>
        ) : (
          <HudPill icon="🎵" value={view.played} label="Notas tocadas" />
        )}
      </HudRow>

      <Body>
        <Sheet style={shadow(10, 24)}>
          <SongTitle>{song ? song.title : "Piano livre"}</SongTitle>
          {song ? (
            <>
              <Notes accessibilityLabel="Próximas notas">
                {upcoming.map(([midi], index) => {
                  const size = index === 0 ? 60 : 42;
                  return (
                    <NoteBubble
                      key={view.position + index}
                      $color={colorOf(midi)}
                      $far={index > 0}
                      style={{ width: size, height: size }}
                    >
                      <NoteName $far={index > 0} style={[{ fontSize: index === 0 ? 20 : 13 }, index === 0 ? textShadow("rgba(0,0,0,0.3)", 1, 2) : null]}>
                        {NAMES[midi]}
                      </NoteName>
                    </NoteBubble>
                  );
                })}
              </Notes>
              <ProgressBar value={view.position / total} color={GAME.colors[1]} track="#EDE9FE" style={{ alignSelf: "stretch" }} />
              <Hint>
                {listening
                  ? "Escute com atenção... 🎧"
                  : done
                  ? "Lindo! Você tocou a música inteira! 🎉"
                  : "Toque na tecla que está piscando."}
              </Hint>
            </>
          ) : (
            <Hint>
              Toque como quiser! Dá para arrastar o dedo e tocar várias teclas juntas.
              {Platform.OS === "web" ? " No computador, use as teclas A S D F G H J K L." : ""}
            </Hint>
          )}
          {song ? (
            <Button
              title={listening ? "Parar" : "Ouvir a música"}
              icon={listening ? "stop" : "ear"}
              tone="soft"
              size="sm"
              sound={null}
              disabled={done}
              onPress={playDemo}
            />
          ) : (
            <Button
              title="Terminei"
              icon="checkmark"
              tone="green"
              size="sm"
              disabled={view.played === 0}
              onPress={() => finish({ headline: "Que show! 🎶", message: `Você tocou ${view.played} ${view.played === 1 ? "nota" : "notas"} no piano.` })}
            />
          )}
        </Sheet>

        <Keyboard
          ref={keyboard}
          testID="teclado"
          accessibilityLabel="Teclado do piano"
          onLayout={measure}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={handleTouches}
          onResponderStart={handleTouches}
          onResponderMove={handleTouches}
          onResponderEnd={handleTouches}
          onResponderRelease={handleTouches}
          onResponderTerminate={handleTouches}
          style={[{ width: area.width, height: whiteHeight }, shadow(10, 24)]}
        >
          {WHITE.map((midi, index) => (
            <WhiteKey
              key={midi}
              $down={lit(midi)}
              $next={next === midi}
              $wrong={wrong === midi}
              style={{ left: index * whiteWidth, width: whiteWidth, height: whiteHeight, pointerEvents: "none" }}
            >
              <KeyTag $color={colorOf(midi)}>{NAMES[midi]}</KeyTag>
              {Platform.OS === "web" && whiteWidth > 44 ? <KeyLetter>{LETTERS[midi]}</KeyLetter> : null}
            </WhiteKey>
          ))}
          {BLACK.map(([midi, after]) => (
            <BlackKey
              key={midi}
              $down={lit(midi)}
              $next={next === midi}
              $wrong={wrong === midi}
              style={{ left: blackLeft(after), width: blackWidth, height: blackHeight, pointerEvents: "none" }}
            >
              {Platform.OS === "web" && whiteWidth > 44 ? <KeyLetter $light>{LETTERS[midi]}</KeyLetter> : null}
            </BlackKey>
          ))}
          {next ? (
            <Animated.View
              style={{
                position: "absolute",
                top: WHITE.includes(next) ? whiteHeight * 0.62 : blackHeight * 0.3,
                left:
                  (WHITE.includes(next)
                    ? WHITE.indexOf(next) * whiteWidth + whiteWidth / 2
                    : blackLeft(BLACK.find(([note]) => note === next)[1]) + blackWidth / 2) - 16,
                pointerEvents: "none",
                transform: [{ translateY: fingerLift }],
              }}
            >
              <Finger>👆</Finger>
            </Animated.View>
          ) : null}
          {floaters}
        </Keyboard>
      </Body>
    </>
  );
}

export default function Piano() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
