import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Avatar from "../../../components/Avatar";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import Confetti from "../../../components/Confetti";
import Flag from "../../../components/Flag";
import Float from "../../../components/Float";
import Mascot from "../../../components/Mascot";
import ProgressBar from "../../../components/ProgressBar";
import WorldMap from "../../../components/WorldMap";
import { AuthContext } from "../../../contexts/auth";
import { COUNTRIES } from "../../../data/countries";
import useNow from "../../../hooks/useNow";
import useShake from "../../../hooks/useShake";
import {
  LIVES,
  MAX_PLAYERS,
  RoomError,
  SPEEDS,
  addBot,
  answerTurn,
  burnTurn,
  createRoom,
  joinRoom,
  leaveRoom,
  normalizeRoomCode,
  removePlayer,
  seatsOf,
  setSpeed,
  startGame,
  watchRoom,
} from "../../../services/countryRooms";
import { fx } from "../../../services/feedback";
import { colors, gradients, nativeDriver } from "../../../theme";
import { getCountry } from "../../../utils/countries";
import { pick } from "../../../utils/helpers";
import { CountryChips, CountryInput, Feedback, Spacer, fillsFor, judge } from "./parts";
import {
  BigText,
  Card,
  CardText,
  CardTitle,
  Center,
  CodeInput,
  CodeLetter,
  CodeRow,
  CodeTile,
  Divider,
  ErrorText,
  Hearts,
  MapBox,
  Muted,
  Overlay,
  OverlayText,
  PlayerCard,
  PlayerName,
  Players,
  Ring,
  Seat,
  SeatName,
  Seconds,
  SectionLabel,
  SpeedChip,
  SpeedLabel,
  Speeds,
  TurnBanner,
} from "./style";

// A sala continua entre uma partida e outra: o "Jogar de novo" recria o tabuleiro e ele volta para a
// mesma sala. Fechar o jogo de verdade tira a pessoa da sala depois de um instante.
const session = { code: null, leaveTimer: null, finishedGame: null };

// chance de o Bip "esquecer" um país e deixar a batata queimar, em cada velocidade
const BIP_MISS = { 20: 0.1, 14: 0.15, 9: 0.25 };

const hearts = (lives) => "❤️".repeat(Math.max(0, lives)) + "🤍".repeat(Math.max(0, LIVES - lives));

function Lobby({ busy, error, onCreate, onJoin, onBip }) {
  const [value, setValue] = useState("");

  return (
    <Appear from="scale">
      <Card>
        <Mascot size={80} mood="happy" />
        <CardTitle>🥔 Batata Quente dos Países</CardTitle>
        <CardText>
          Cada um na sua vez diz um país antes que a batata queime. Repetiu ou demorou? Perde um coração! Quem
          ficar por último na roda ganha.
        </CardText>
        <Button title="Criar uma sala" icon="add-circle" size="lg" full disabled={busy} onPress={onCreate} />
        <Divider>ou digite o código que um amigo te passou:</Divider>
        <CodeInput
          value={value}
          onChangeText={(text) => setValue(normalizeRoomCode(text))}
          placeholder="BOLA"
          placeholderTextColor="#C4B5FD"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={4}
          onSubmitEditing={() => value.length === 4 && onJoin(value)}
          accessibilityLabel="Código da sala"
        />
        <Button
          title="Entrar na sala"
          icon="log-in"
          tone="purple"
          full
          disabled={busy || value.length !== 4}
          onPress={() => onJoin(value)}
        />
        <Divider>sem ninguém por perto?</Divider>
        <Button
          title="Jogar contra o Bip"
          icon="hardware-chip"
          tone="green"
          full
          disabled={busy}
          onPress={onBip}
        />
        {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}
      </Card>
    </Appear>
  );
}

function Waiting({ room, me, code, busy, error, onStart, onSpeed, onBot, onRemove, onExit }) {
  const host = room.host === me;
  const seats = seatsOf(room.players);
  const hostName = room.players[room.host]?.name ?? "o dono da sala";
  const lastWinner = room.status === "over" ? room.players[room.winner] : null;

  return (
    <Appear from="scale">
      <Card>
        <CardTitle>🥔 Sala da batata quente</CardTitle>
        <CodeRow accessibilityLabel={`Código da sala: ${code.split("").join(" ")}`}>
          {code.split("").map((letter, index) => (
            <CodeTile key={index} colors={gradients.candy} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <CodeLetter>{letter}</CodeLetter>
            </CodeTile>
          ))}
        </CodeRow>
        <Muted style={{ color: colors.inkSoft, textAlign: "center" }}>
          Fale este código para os amigos entrarem: eles abrem o jogo, escolhem Online e digitam as 4 letras.
        </Muted>

        {lastWinner ? <CardText>🏆 {lastWinner.name} ganhou a última partida!</CardText> : null}

        <Players>
          {seats.map(([id, player]) => (
            <PlayerCard key={id} $me={id === me}>
              <Avatar id={player.avatar} size={50} />
              <PlayerName numberOfLines={1}>
                {id === me ? "Você" : player.name}
                {id === room.host ? " 👑" : ""}
              </PlayerName>
              {host && id !== me ? (
                <Bouncy onPress={() => onRemove(id)} accessibilityLabel={`Tirar ${player.name} da sala`}>
                  <Ionicons name="close-circle" size={22} color={colors.coral} />
                </Bouncy>
              ) : null}
            </PlayerCard>
          ))}
        </Players>

        {host ? (
          <>
            <CardText>Velocidade da batata:</CardText>
            <Speeds>
              {SPEEDS.map((speed) => (
                <Bouncy
                  key={speed.id}
                  onPress={() => onSpeed(speed.id)}
                  accessibilityState={{ selected: room.speed === speed.id }}
                  accessibilityLabel={`${speed.label}: ${speed.id} segundos por vez`}
                >
                  <SpeedChip $selected={room.speed === speed.id}>
                    <Text style={{ fontSize: 22, lineHeight: 28 }}>{speed.emoji}</Text>
                    <SpeedLabel>
                      {speed.label} · {speed.id}s
                    </SpeedLabel>
                  </SpeedChip>
                </Bouncy>
              ))}
            </Speeds>
            <Button
              title="Chamar o Bip para jogar"
              icon="hardware-chip"
              tone="soft"
              size="sm"
              disabled={busy || seats.length >= MAX_PLAYERS}
              onPress={onBot}
            />
            <Button
              title={room.status === "over" ? "Jogar de novo!" : "Começar!"}
              icon="play"
              size="lg"
              full
              disabled={busy || seats.length < 2}
              onPress={onStart}
            />
            {seats.length < 2 ? (
              <Muted style={{ color: colors.inkSoft }}>Precisa de pelo menos 2 jogadores.</Muted>
            ) : null}
          </>
        ) : (
          <CardText>
            ⏳ Esperando {hostName} começar a partida... (batata{" "}
            {SPEEDS.find((speed) => speed.id === room.speed)?.label.toLowerCase()})
          </CardText>
        )}

        {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}
        <Button title="Sair da sala" icon="exit-outline" tone="white" size="sm" onPress={onExit} />
      </Card>
    </Appear>
  );
}

// A roda: os jogadores em volta, a batata no meio com o tempo e uma seta apontando para quem está com ela.
function PotatoRing({ room, me, width, height, leftMs, total }) {
  const seats = seatsOf(room.players);
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 54;
  const ry = height / 2 - 50;
  const angles = seats.map((_, index) => -Math.PI / 2 + (2 * Math.PI * index) / seats.length);
  const turnIndex = seats.findIndex(([id]) => id === room.turn);
  const arrow = useRef(new Animated.Value(0)).current;
  const heading = useRef(0);
  const hot = leftMs < total * 0.35;

  // a seta gira pelo caminho mais curto até quem está com a batata
  useEffect(() => {
    if (turnIndex < 0) return;
    const target = (angles[turnIndex] * 180) / Math.PI + 90;
    const delta = ((((target - heading.current) % 360) + 540) % 360) - 180;
    heading.current += delta;
    Animated.spring(arrow, {
      toValue: heading.current,
      friction: 6,
      tension: 70,
      useNativeDriver: nativeDriver,
    }).start();
  }, [turnIndex, seats.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const rotate = arrow.interpolate({ inputRange: [-36000, 36000], outputRange: ["-36000deg", "36000deg"] });

  return (
    <Ring style={{ width, height }}>
      <Animated.View
        style={{
          position: "absolute",
          left: cx - 70,
          top: cy - 70,
          width: 140,
          height: 140,
          alignItems: "center",
          transform: [{ rotate }],
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 13,
            borderRightWidth: 13,
            borderBottomWidth: 22,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: colors.yellow,
          }}
        />
      </Animated.View>

      <Center style={{ left: cx - 60, top: cy - 52, width: 120, height: 104 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {hot ? <Text style={{ fontSize: 22, lineHeight: 28 }}>🔥</Text> : null}
          <Float kind={hot ? "beat" : "bob"} duration={hot ? 260 : 900}>
            <Text style={{ fontSize: 50, lineHeight: 62 }}>🥔</Text>
          </Float>
          {hot ? <Text style={{ fontSize: 22, lineHeight: 28 }}>🔥</Text> : null}
        </View>
        <Seconds $hot={hot}>{Math.ceil(leftMs / 1000)}s</Seconds>
        <ProgressBar
          value={leftMs / total}
          height={8}
          color={hot ? colors.coral : colors.yellow}
          style={{ width: 96 }}
        />
      </Center>

      {seats.map(([id, player], index) => {
        const turn = id === room.turn;
        const out = player.lives <= 0;
        return (
          <Seat
            key={id}
            style={{
              left: cx + rx * Math.cos(angles[index]) - 48,
              top: cy + ry * Math.sin(angles[index]) - 44,
              opacity: out ? 0.4 : 1,
            }}
          >
            <Float kind="pulse" duration={450} enabled={turn}>
              <Avatar
                id={player.avatar}
                size={turn ? 58 : 50}
                style={turn ? { borderColor: colors.yellow, borderWidth: 4 } : null}
              />
            </Float>
            <SeatName $turn={turn} numberOfLines={1}>
              {id === me ? "Você" : player.name}
            </SeatName>
            <Hearts>{out ? "😵 fora" : hearts(player.lives)}</Hearts>
          </Seat>
        );
      })}
    </Ring>
  );
}

function Match({ room, me, code, clock, area, onSaid }) {
  const now = useNow(200);
  const [feedback, setFeedback] = useState(null);
  const [shakeStyle, shake] = useShake();
  const sending = useRef(false);
  const attempted = useRef(null);
  const ticked = useRef(null);
  const counter = useRef(0);

  const total = room.speed * 1000;
  const elapsed = room.turnAt ? now + clock.current.offset - room.turnAt : 0;
  const leftMs = Math.max(0, total - elapsed);
  const myTurn = room.turn === me;
  const turnPlayer = room.players[room.turn];

  // Acabou o tempo: quem estava com a batata manda queimar; se o aparelho dele sumiu, o dono da sala
  // manda; se o dono também sumiu, qualquer um manda (a transação garante que só queima uma vez).
  useEffect(() => {
    if (!room.turnAt) return;
    const wait = myTurn ? 600 : room.host === me ? 1800 : 3500;
    const key = `${room.turn}:${room.turnAt}`;
    if (elapsed - total > wait && attempted.current !== key) {
      attempted.current = key;
      burnTurn(code, room.turn, room.turnAt).catch(() => {
        attempted.current = null;
      });
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // tique-taque nos últimos 3 segundos da minha vez
  useEffect(() => {
    const second = Math.ceil(leftMs / 1000);
    const key = `${room.turnAt}:${second}`;
    if (myTurn && second > 0 && second <= 3 && ticked.current !== key) {
      ticked.current = key;
      fx("tick");
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // o aparelho do dono da sala joga pelos Bips (de vez em quando o Bip esquece e a batata queima)
  useEffect(() => {
    if (room.host !== me || !turnPlayer?.bot) return undefined;
    if (Math.random() < (BIP_MISS[room.speed] ?? 0.15)) return undefined;
    const used = room.used;
    const timer = setTimeout(
      () => {
        const free = COUNTRIES.filter((country) => !used.includes(country.id));
        const famous = free.filter((country) => country.famous);
        const choice = pick(famous.length > 0 ? famous : free);
        if (choice) answerTurn(code, room.turn, choice.id).catch(() => {});
      },
      total * (0.25 + Math.random() * 0.4)
    );
    return () => clearTimeout(timer);
  }, [room.turn, room.round, room.used.length, room.host]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(text) {
    if (!myTurn || sending.current) return;
    const verdict = judge(text, room.used);
    counter.current += 1;
    const key = counter.current;
    if (verdict.type !== "ok" && verdict.type !== "typo") {
      setFeedback({ ...verdict, key });
      if (verdict.type === "repeat") {
        fx("tap");
      } else {
        fx("wrong");
        shake();
      }
      return;
    }
    sending.current = true;
    const result = await answerTurn(code, me, verdict.id).catch(() => "error");
    sending.current = false;
    if (result === "ok") {
      fx("correct");
      onSaid();
      setFeedback({ ...verdict, key, text: `${verdict.text} Passou a batata! 🥔` });
    } else if (result === "used") {
      fx("tap");
      setFeedback({
        type: "repeat",
        id: verdict.id,
        key,
        text: `${getCountry(verdict.id).name} já foi! Pense em outro.`,
      });
    } else {
      setFeedback({ type: "late", key, text: "Ops! O tempo acabou antes. 😅" });
    }
  }

  const ringWidth = Math.min(area.width, 620);
  const lastOk = [...room.log].reverse().find((entry) => entry.type === "ok" && entry.round === room.round);

  return (
    <View>
      <TurnBanner $mine={myTurn}>
        {myTurn ? "🥔 SUA VEZ! Diga um país!" : `Vez de ${turnPlayer?.name ?? "..."} 🤔`}
      </TurnBanner>
      <PotatoRing
        room={room}
        me={me}
        width={ringWidth}
        height={area.width < 500 ? 270 : 300}
        leftMs={leftMs}
        total={total}
      />
      {lastOk ? (
        <Appear key={`${lastOk.round}-${lastOk.id}`} from="scale" style={{ alignItems: "center", marginTop: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16, color: colors.textSoft }}>
              🗣️ {lastOk.by === me ? "Você disse" : `${room.players[lastOk.by]?.name ?? "Alguém"} disse`}
            </Text>
            <Flag id={lastOk.id} size={30} />
            <Text style={{ fontSize: 17, color: colors.white, fontFamily: "Fredoka_700Bold" }}>
              {getCountry(lastOk.id)?.name}
            </Text>
          </View>
        </Appear>
      ) : null}

      <Spacer />
      <CountryInput
        onSubmit={submit}
        disabled={!myTurn}
        active={myTurn}
        placeholder={myTurn ? "Digite um país e aperte Enter!" : `Esperando ${turnPlayer?.name ?? ""}...`}
        shakeStyle={shakeStyle}
      />
      <Feedback feedback={feedback} />

      <SectionLabel>
        Rodada {room.round} · {room.used.length} {room.used.length === 1 ? "país" : "países"} na roda
      </SectionLabel>
      {room.used.length > 0 ? (
        <CountryChips ids={[...room.used].reverse()} />
      ) : (
        <Muted>Ninguém disse nenhum país ainda nesta rodada. Os países repetem a cada rodada nova!</Muted>
      )}
      <Spacer />
      <MapBox>
        <WorldMap fills={fillsFor(room.used)} pulse={room.used[room.used.length - 1]} />
      </MapBox>
    </View>
  );
}

function BurnOverlay({ burn, room, me }) {
  const player = room.players[burn.by];
  return (
    <Overlay style={{ pointerEvents: "none" }}>
      <Appear from="scale" style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 70, lineHeight: 84 }}>🔥🥔🔥</Text>
        <BigText>QUEIMOU!</BigText>
        <OverlayText>
          {burn.by === me
            ? "A batata queimou na sua mão!"
            : `A batata queimou na mão de ${player?.name ?? "alguém"}!`}
        </OverlayText>
        <OverlayText>{burn.out ? "Saiu da roda 😵" : "Perdeu um coração 💔 Nova rodada!"}</OverlayText>
      </Appear>
    </Overlay>
  );
}

function WinnerOverlay({ room, me }) {
  const winner = room.players[room.winner];
  return (
    <Overlay>
      <Confetti />
      <Appear from="scale" style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 64, lineHeight: 78 }}>🏆</Text>
        <Avatar id={winner?.avatar} size={96} />
        <BigText>{room.winner === me ? "VOCÊ VENCEU!" : `${winner?.name ?? "Alguém"} venceu!`}</BigText>
        <OverlayText>Último na roda da batata quente! 🥔</OverlayText>
      </Appear>
    </Overlay>
  );
}

// Batata quente dos países, online: salas com código de 4 letras, de 2 a 8 jogadores (o Bip pode entrar).
export default function Online({ finish, area }) {
  const { user } = useContext(AuthContext);
  const me = user.id;
  const [code, setCode] = useState(session.code);
  const [room, setRoom] = useState(undefined); // undefined = carregando, null = a sala não existe mais
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [burn, setBurn] = useState(null);
  const [ending, setEnding] = useState(false);
  // diferença entre o relógio do servidor e o deste aparelho (para todo mundo ver o mesmo tempo)
  const clock = useRef({ offset: 0, samples: [] });
  const said = useRef({ game: null, count: 0 });
  const lastEvent = useRef(null);

  // "Jogar de novo" recria este tabuleiro: volta para a mesma sala em vez de sair dela
  useEffect(() => {
    clearTimeout(session.leaveTimer);
    if (session.code) joinRoom(session.code, user).catch(() => {});
    return () => {
      const leaving = session.code;
      if (!leaving) return;
      session.leaveTimer = setTimeout(() => {
        leaveRoom(leaving, me).catch(() => {});
        if (session.code === leaving) session.code = null;
      }, 1500);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!code) return undefined;
    setRoom(undefined);
    return watchRoom(
      code,
      (next, pending) => {
        if (!pending && next?.updatedAt) {
          const samples = [...clock.current.samples, next.updatedAt - Date.now()].slice(-7);
          const sorted = [...samples].sort((a, b) => a - b);
          clock.current = { samples, offset: sorted[Math.floor(sorted.length / 2)] };
        }
        setRoom(next);
      },
      () => setError("A conexão com a sala caiu. Confira a internet.")
    );
  }, [code]);

  // som e aviso quando a batata queima (ou quando outra pessoa diz um país)
  useEffect(() => {
    const last = room?.log?.[room.log.length - 1];
    if (!last) return undefined;
    const key = JSON.stringify([room.game, last]);
    if (lastEvent.current === null || lastEvent.current === key) {
      lastEvent.current = key;
      return undefined;
    }
    lastEvent.current = key;
    if (last.type === "ok" && last.by !== me) fx("pop");
    if (last.type !== "burn") return undefined;
    fx("wrong");
    setBurn(last);
    const timer = setTimeout(() => setBurn(null), 2200);
    return () => clearTimeout(timer);
  }, [room?.log]); // eslint-disable-line react-hooks/exhaustive-deps

  // fim da partida: comemora o vencedor e entrega o resultado (lugar → estrelas) para a tela de fim
  useEffect(() => {
    if (!room || room.status !== "over" || session.finishedGame === room.game) return undefined;
    const order = [room.winner, ...[...room.out].reverse()].filter(Boolean);
    const place = order.indexOf(me) + 1;
    if (place === 0) return undefined;
    session.finishedGame = room.game;
    setEnding(true);
    fx("match");
    const count = said.current.game === room.game ? said.current.count : 0;
    const timer = setTimeout(() => {
      setEnding(false);
      finish({
        score: count,
        stars: place === 1 ? 3 : place === 2 ? 2 : 1,
        message:
          place === 1
            ? "Você foi o último na roda: campeão da batata quente! 🏆"
            : `Você ficou em ${place}º lugar entre ${order.length} jogadores.`,
        stats: [
          { label: "Lugar", value: `${place}º` },
          { label: "Países ditos", value: count },
        ],
        detail: { place, players: order.length },
      });
    }, 3200);
    return () => clearTimeout(timer);
  }, [room?.status, room?.game]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(
        failure instanceof RoomError ? failure.message : "Não deu certo agora. Confira a internet e tente de novo."
      );
      fx("wrong");
    } finally {
      setBusy(false);
    }
  }

  function enter(value) {
    session.code = value;
    session.finishedGame = null;
    setCode(value);
  }

  function exit() {
    const value = code;
    session.code = null;
    setCode(null);
    setRoom(undefined);
    setError("");
    if (value) leaveRoom(value, me).catch(() => {});
  }

  function countSaid() {
    if (said.current.game !== room.game) said.current = { game: room.game, count: 0 };
    said.current.count += 1;
  }

  let content;
  if (!code) {
    content = (
      <Lobby
        busy={busy}
        error={error}
        onCreate={() => act(async () => enter(await createRoom(user)))}
        onJoin={(value) =>
          act(async () => {
            await joinRoom(value, user);
            enter(value);
          })
        }
        onBip={() =>
          act(async () => {
            const value = await createRoom(user);
            await addBot(value);
            enter(value);
          })
        }
      />
    );
  } else if (room === undefined) {
    content = <ActivityIndicator color={colors.white} style={{ marginTop: 60 }} />;
  } else if (room === null || !room.players[me]) {
    content = (
      <Card>
        <CardTitle>😮 A sala fechou</CardTitle>
        <CardText>Todo mundo saiu ou o dono da sala tirou você. Que tal criar uma sala nova?</CardText>
        <Button title="Voltar" icon="arrow-back" full onPress={exit} />
      </Card>
    );
  } else if (room.status === "playing") {
    content = <Match room={room} me={me} code={code} clock={clock} area={area} onSaid={countSaid} />;
  } else {
    content = (
      <Waiting
        room={room}
        me={me}
        code={code}
        busy={busy}
        error={error}
        onStart={() => act(() => startGame(code))}
        onSpeed={(speed) => act(() => setSpeed(code, speed))}
        onBot={() => act(() => addBot(code))}
        onRemove={(id) => act(() => removePlayer(code, id))}
        onExit={exit}
      />
    );
  }

  return (
    <View style={{ width: area.width, height: area.height }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
      {burn && room?.status === "playing" ? <BurnOverlay burn={burn} room={room} me={me} /> : null}
      {ending && room ? <WinnerOverlay room={room} me={me} /> : null}
    </View>
  );
}
