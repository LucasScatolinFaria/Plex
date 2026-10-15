import { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import Float from "../../../components/Float";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow, useFloaters } from "../../../components/Hud";
import ProgressBar from "../../../components/ProgressBar";
import { getGame } from "../../../data/games";
import { SONGS } from "../../../data/songs";
import { pianoOff, pianoOn, preloadPiano } from "../../../services/feedback";
import { colors, shadow, textShadow } from "../../../theme";
import { clamp } from "../../../utils/helpers";
import { hasMouse } from "../../../utils/pointer";
import { BLACKS, CODES, KEYS, WHITES, colorOf, letterOf, noteName, octaveOf, slotOf } from "./keys";
import {
  Arrow,
  ArrowText,
  BlackKey,
  Body,
  Buttons,
  Cap,
  CapLetter,
  CapName,
  Caps,
  Finger,
  Hint,
  Housing,
  HousingBar,
  HousingTitle,
  KeyLetter,
  KeyTag,
  Keys,
  RangeText,
  Sheet,
  SheetLine,
  SongTitle,
  WhiteKey,
} from "./style";

const GAME = getGame("piano");
const IS_WEB = Platform.OS === "web";
// no computador dá para tocar com as letras do teclado (no celular, mesmo pelo navegador, é com o dedo)
const WITH_KEYBOARD = IS_WEB && hasMouse();
const MIN_WHITE = 36; // tecla branca mais fina que isso fica difícil de acertar com o dedo
const OCTAVE = 7; // as setas andam uma oitava (7 teclas brancas)
const PAD = 10; // borda da caixa do piano

const fullName = (midi) => `${noteName(midi)}${octaveOf(midi)}`;

function WhiteKeyView({ midi, left, width, height, down, next, wrong }) {
  const key = KEYS[midi];
  const isC = midi % 12 === 0;
  return (
    <WhiteKey
      $down={down}
      $next={next}
      $wrong={wrong}
      $color={colorOf(midi)}
      style={{ left, width, height, pointerEvents: "none", transform: [{ translateY: down ? 2 : 0 }] }}
    >
      {/* o nome da nota cabe nas teclas largas; nas finas aparece só no Dó, que marca cada oitava */}
      {isC || width >= 46 ? <KeyTag $color={colorOf(midi)}>{isC ? fullName(midi) : noteName(midi)}</KeyTag> : null}
      <KeyLetter $small={width < 40}>{key.letter}</KeyLetter>
    </WhiteKey>
  );
}

function BlackKeyView({ midi, left, width, height, down, next, wrong }) {
  return (
    <BlackKey
      $down={down}
      $next={next}
      $wrong={wrong}
      $color={colorOf(midi)}
      style={{ left, width, height, pointerEvents: "none", transform: [{ translateY: down ? 2 : 0 }] }}
    >
      {width >= 20 ? (
        <KeyLetter $light $small>
          {KEYS[midi].letter}
        </KeyLetter>
      ) : null}
    </BlackKey>
  );
}

// Piano de 61 teclas, igual ao dos jogos do Roblox: toca com o dedo, com o mouse ou com as letras do teclado.
function Board({ mode, finish, area }) {
  const song = SONGS[mode.id]; // no modo livre não tem música
  const total = song ? song.notes.length : 0;

  // "game" guarda os valores sempre atuais (dois dedos podem tocar no mesmo instante); "view" é a cópia desenhada
  const game = useRef({ position: 0, mistakes: 0, played: 0, ended: false }).current;
  const [view, setView] = useState({ position: 0, mistakes: 0, played: 0 });
  const [down, setDown] = useState([]); // teclas apertadas agora
  const [wrong, setWrong] = useState(null);
  const [demoNote, setDemoNote] = useState(null); // nota que o Bip está tocando no "ouvir"
  const [listening, setListening] = useState(false);
  const [pedal, setPedal] = useState(false); // pedal de sustentação: a nota continua soando depois de soltar

  const touched = useRef(new Set()); // teclas seguradas com o dedo ou o mouse
  const typed = useRef(new Map()); // tecla do computador (event.code) → nota que ela está tocando
  const origin = useRef({ x: 0, y: 0 });
  const keyboard = useRef(null);
  const demo = useRef({ playing: false, timers: [] });
  const pedalOn = useRef(false);
  pedalOn.current = pedal;
  const [floaters, float] = useFloaters();

  // No computador cabem as 61 teclas; na tela pequena aparece um pedaço e as setas trocam de oitava.
  const keysWidth = area.width - PAD * 2;
  const fit = clamp(Math.floor(keysWidth / MIN_WHITE), OCTAVE, WHITES.length);
  const windowed = fit < WHITES.length;
  const whiteWidth = keysWidth / fit;
  const whiteHeight = clamp(area.height * 0.4, 140, 250);
  const blackWidth = whiteWidth * 0.6;
  const blackHeight = whiteHeight * 0.6;

  const centerOn = (slot) => clamp(Math.round(slot - (fit - 1) / 2), 0, WHITES.length - fit);
  const [start, setStart] = useState(() => centerOn(slotOf(song ? song.notes[0][0] : 60)));
  const first = clamp(start, 0, WHITES.length - fit);

  const done = !!song && view.position >= total;
  const next = song && !done && !listening ? song.notes[view.position][0] : null;

  const whiteX = (index) => (index - first) * whiteWidth;
  const blackX = (after) => (after + 1 - first) * whiteWidth - blackWidth / 2;
  const centerX = (midi) =>
    KEYS[midi].black ? blackX(KEYS[midi].after) + blackWidth / 2 : whiteX(KEYS[midi].index) + whiteWidth / 2;
  const isVisible = (midi) => {
    const slot = slotOf(midi);
    return slot >= first && slot <= first + fit - 1;
  };

  useEffect(() => {
    preloadPiano();
  }, []);

  // A janela do teclado vai até a próxima nota da música (e até a nota que o Bip está tocando).
  // Só quando a nota muda: se a criança usar as setas, a janela fica onde ela deixou até a nota seguinte.
  const follow = next ?? demoNote;
  const visibleNow = useRef(isVisible);
  visibleNow.current = isVisible;
  useEffect(() => {
    if (windowed && follow !== null && !visibleNow.current(follow)) setStart(centerOn(slotOf(follow)));
  }, [follow, windowed, fit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Uma tecla acabou de descer (dedo, mouse ou teclado): o som sai aqui, antes de qualquer desenho.
  function strike(midi) {
    if (game.ended) return;
    pianoOn(midi);
    if (isVisible(midi)) float("♪", { x: centerX(midi) - 9, y: -30, color: colorOf(midi), size: 26 });

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

  // com o pedal ligado a nota não para quando a tecla sobe: vai sumindo sozinha
  function letGo(midi) {
    if (!pedalOn.current) pianoOff(midi);
  }

  const heldByKeyboard = (midi) => [...typed.current.values()].includes(midi);

  function refresh() {
    setDown([...touched.current, ...typed.current.values()]);
  }

  /* ---------- dedos e mouse ---------- */

  function keyAt(pageX, pageY) {
    const x = pageX - origin.current.x;
    const y = pageY - origin.current.y;
    if (x < 0 || x >= keysWidth || y < 0 || y > whiteHeight) return null;
    if (y <= blackHeight) {
      const black = BLACKS.find(
        ({ after }) => after >= first && after < first + fit - 1 && Math.abs(x - (after + 1 - first) * whiteWidth) <= blackWidth / 2
      );
      if (black) return black.midi;
    }
    return WHITES[first + Math.floor(x / whiteWidth)]?.midi ?? null;
  }

  // Olha onde está cada dedo e descobre quais teclas desceram e quais subiram (dá para arrastar e tocar acordes).
  function handleTouches(event) {
    const pressed = new Set();
    (event.nativeEvent.touches || []).forEach((touch) => {
      const midi = keyAt(touch.pageX, touch.pageY);
      if (midi) pressed.add(midi);
    });
    touched.current.forEach((midi) => {
      if (!pressed.has(midi) && !heldByKeyboard(midi)) letGo(midi);
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

  /* ---------- teclado do computador (só no site), igual ao Roblox ---------- */

  const latest = useRef({});
  latest.current = { strike, letGo, refresh };

  useEffect(() => {
    if (!IS_WEB) return undefined;
    const held = typed.current;
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const keys = CODES[event.code];
      if (!keys) return;
      event.preventDefault();
      if (event.repeat || held.has(event.code)) return;
      // Shift + letra = a tecla preta à direita dela (onde não tem preta, toca a branca mesmo)
      const midi = event.shiftKey && keys.black ? keys.black : keys.white;
      held.set(event.code, midi);
      latest.current.strike(midi);
      latest.current.refresh();
    };
    // a tecla que sobe é achada pelo código físico: se o Shift já foi solto, a nota certa para mesmo assim
    const onKeyUp = (event) => {
      const midi = held.get(event.code);
      if (midi === undefined) return;
      held.delete(event.code);
      if (!touched.current.has(midi) && ![...held.values()].includes(midi)) latest.current.letGo(midi);
      latest.current.refresh();
    };
    // trocou de janela com uma tecla apertada: solta tudo para nenhuma nota ficar presa
    const onBlur = () => {
      held.forEach((midi) => latest.current.letGo(midi));
      held.clear();
      latest.current.refresh();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
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
    game.ended = true;
    const { mistakes } = view;
    // música comprida pode ter alguns escorregões a mais para ganhar 3 estrelas
    const allowance = Math.max(1, Math.round(total * 0.04));
    const timer = setTimeout(() => {
      finish({
        score: Math.max(20, total * 10 - mistakes * 5),
        stars: mistakes <= allowance ? 3 : mistakes <= allowance * 3 + 1 ? 2 : 1,
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
  }, [done, finish, view, total, song, game]);

  function finishFree() {
    game.ended = true;
    finish({
      headline: "Que show! 🎶",
      message: `Você tocou ${view.played} ${view.played === 1 ? "nota" : "notas"} no piano.`,
    });
  }

  const lit = (midi) => down.includes(midi) || demoNote === midi;
  const upcoming = song ? song.notes.slice(view.position, view.position + (area.width >= 600 ? 8 : 5)) : [];
  const visibleWhites = WHITES.slice(first, first + fit);
  const visibleBlacks = BLACKS.filter(({ after }) => after >= first && after < first + fit - 1);
  const range = `${fullName(visibleWhites[0].midi)} até ${fullName(visibleWhites[visibleWhites.length - 1].midi)}`;
  const shiftOctave = (direction) => setStart(clamp(first + direction * OCTAVE, 0, WHITES.length - fit));

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
              <Caps accessibilityLabel="Próximas notas">
                {upcoming.map(([midi], index) => {
                  const current = index === 0 && !listening;
                  const size = current ? 62 : 44;
                  return (
                    <Cap
                      key={view.position + index}
                      $color={colorOf(midi)}
                      $current={current}
                      style={[{ width: size, height: size + 10, opacity: index === 0 ? 1 : 1 - index * 0.08 }, current ? shadow(4, 10, "rgba(30,27,75,0.25)") : null]}
                    >
                      <CapLetter $current={current} style={[{ fontSize: current ? 26 : 18 }, current ? textShadow("rgba(0,0,0,0.25)", 1, 2) : null]}>
                        {letterOf(midi)}
                      </CapLetter>
                      <CapName $current={current}>{noteName(midi)}</CapName>
                    </Cap>
                  );
                })}
              </Caps>
              {area.height >= 620 ? (
                <SheetLine accessibilityLabel="Partitura em letras">
                  {song.notes.map(([midi], index) => (
                    <Text
                      key={index}
                      style={
                        index < view.position
                          ? { color: colors.mint }
                          : index === view.position
                          ? { color: colors.white, backgroundColor: colorOf(midi) }
                          : null
                      }
                    >
                      {` ${letterOf(midi)} `}
                    </Text>
                  ))}
                </SheetLine>
              ) : null}
              <ProgressBar value={view.position / total} color={GAME.colors[1]} track="#EDE9FE" style={{ alignSelf: "stretch" }} />
              <Hint>
                {listening
                  ? "Escute com atenção... 🎧"
                  : done
                  ? "Lindo! Você tocou a música inteira! 🎉"
                  : WITH_KEYBOARD
                  ? "Toque a tecla que pisca ou aperte a letra no teclado. Maiúscula = segure Shift."
                  : "Toque na tecla que está piscando."}
              </Hint>
            </>
          ) : (
            <Hint>
              Toque como quiser! Dá para arrastar o dedo e tocar várias teclas juntas.
              {WITH_KEYBOARD ? " No computador, cada letra toca uma tecla: o “t” é o Dó do meio e Shift + letra toca a tecla preta." : ""}
            </Hint>
          )}
          <Buttons>
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
              <Button title="Terminei" icon="checkmark" tone="green" size="sm" disabled={view.played === 0} onPress={finishFree} />
            )}
            <Button
              title={pedal ? "Pedal ligado" : "Pedal"}
              icon="infinite"
              tone={pedal ? "purple" : "soft"}
              size="sm"
              sound={null}
              onPress={() => setPedal(!pedal)}
            />
          </Buttons>
        </Sheet>

        <Housing colors={["#2B2566", "#120F33"]} style={[{ width: area.width }, shadow(12, 28, "rgba(10,3,40,0.55)")]}>
          <HousingBar>
            {windowed ? (
              <Bouncy accessibilityLabel="Oitava mais grave" disabled={first === 0} onPress={() => shiftOctave(-1)}>
                <Arrow $disabled={first === 0}>
                  <Ionicons name="chevron-back" size={18} color={colors.white} />
                  {area.width >= 420 ? <ArrowText>Grave</ArrowText> : null}
                </Arrow>
              </Bouncy>
            ) : null}
            <HousingTitle numberOfLines={1}>
              🎹 Piano SESI Kids {area.width >= 420 ? <RangeText>· {windowed ? range : "61 teclas"}</RangeText> : null}
            </HousingTitle>
            {windowed ? (
              <Bouncy
                accessibilityLabel="Oitava mais aguda"
                disabled={first >= WHITES.length - fit}
                onPress={() => shiftOctave(1)}
              >
                <Arrow $disabled={first >= WHITES.length - fit}>
                  {area.width >= 420 ? <ArrowText>Agudo</ArrowText> : null}
                  <Ionicons name="chevron-forward" size={18} color={colors.white} />
                </Arrow>
              </Bouncy>
            ) : null}
          </HousingBar>

          <Keys
            ref={keyboard}
            testID="teclado"
            accessibilityLabel={`Teclado do piano, de ${range}`}
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
            style={{ width: keysWidth, height: whiteHeight }}
          >
            {visibleWhites.map(({ midi, index }) => (
              <WhiteKeyView
                key={midi}
                midi={midi}
                left={whiteX(index)}
                width={whiteWidth}
                height={whiteHeight}
                down={lit(midi)}
                next={next === midi}
                wrong={wrong === midi}
              />
            ))}
            {visibleBlacks.map(({ midi, after }) => (
              <BlackKeyView
                key={midi}
                midi={midi}
                left={blackX(after)}
                width={blackWidth}
                height={blackHeight}
                down={lit(midi)}
                next={next === midi}
                wrong={wrong === midi}
              />
            ))}
            {next && isVisible(next) ? (
              <View
                style={{
                  position: "absolute",
                  top: KEYS[next].black ? blackHeight * 0.18 : whiteHeight * 0.4,
                  left: centerX(next) - 16,
                  pointerEvents: "none",
                }}
              >
                <Float kind="float" duration={480}>
                  <Finger>👆</Finger>
                </Float>
              </View>
            ) : null}
            {floaters}
          </Keys>
        </Housing>
      </Body>
    </>
  );
}

export default function Piano() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
