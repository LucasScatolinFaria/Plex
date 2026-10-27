import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Avatar from "../../../components/Avatar";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import Confetti from "../../../components/Confetti";
import GameShell from "../../../components/GameShell";
import Mascot from "../../../components/Mascot";
import ProgressBar from "../../../components/ProgressBar";
import { AuthContext } from "../../../contexts/auth";
import { getGame } from "../../../data/games";
import useNow from "../../../hooks/useNow";
import { fx } from "../../../services/feedback";
import {
  ANSWER_TIME,
  ESCAPE_POINTS,
  FIND_POINTS,
  HOST_AWAY,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROUND_OPTIONS,
  RoomError,
  VOTE_TIME,
  addBot,
  botGuess,
  botVote,
  closePhase,
  createRoom,
  farthest,
  joinRoom,
  leaveRoom,
  nextRound,
  normalizeRoomCode,
  questionOf,
  removePlayer,
  seatsOf,
  setRounds,
  startGame,
  submitAnswer,
  submitVote,
  watchRoom,
} from "../../../services/guessRooms";
import { colors, gradients } from "../../../theme";
import {
  BigText,
  Card,
  CardText,
  CardTitle,
  CodeInput,
  CodeLetter,
  CodeRow,
  CodeTile,
  Divider,
  ErrorText,
  Muted,
  Overlay,
  OverlayText,
  PlayerCard,
  PlayerName,
  Players,
  SpeedChip,
  SpeedLabel,
  Speeds,
} from "../Countries/style";
import {
  Check,
  Choice,
  ChoiceName,
  Choices,
  Face,
  FaceName,
  Faces,
  Fact,
  Gain,
  GuessCard,
  GuessInfo,
  GuessInput,
  GuessRow,
  GuessValue,
  Hint,
  Phase,
  QuestionCard,
  QuestionText,
  RightAnswer,
  RightLabel,
  RightValue,
  RoundTag,
  Rows,
  ScoreName,
  ScorePlace,
  ScorePoints,
  ScoreRow,
  Secret,
  Verdict,
  VerdictTitle,
} from "./style";

const GAME = getGame("chute");

// A sala continua entre uma partida e outra: o "Jogar de novo" recria o tabuleiro e ele volta para a
// mesma sala. Fechar o jogo de verdade tira a pessoa da sala depois de um instante.
const session = { code: null, leaveTimer: null, finishedGame: null };

const PHASE_TIME = { answer: ANSWER_TIME, vote: VOTE_TIME };

// 384000 → "384.000"; até 4 algarismos fica sem ponto, para os anos (1500, 1969) não parecerem quantidades
const formatNumber = (value) => (value < 10000 ? String(value) : String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "."));

const nameOf = (room, id, me) => (id === me ? "Você" : (room.players[id]?.name ?? "Alguém"));

const joinNames = (names) =>
  names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;

function Lobby({ busy, error, onCreate, onJoin, onBips }) {
  const [value, setValue] = useState("");

  return (
    <Appear from="scale">
      <Card>
        <Mascot size={80} mood="happy" />
        <CardTitle>🕵️ Quem Chutou Longe?</CardTitle>
        <CardText>
          Todo mundo chuta a resposta da mesma pergunta. Depois, vire detetive: descubra quem deu o chute mais
          longe da resposta certa!
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
        <Button title="Jogar com os Bips" icon="hardware-chip" tone="green" full disabled={busy} onPress={onBips} />
        {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}
      </Card>
    </Appear>
  );
}

// placar da partida, do mais pontos para o menos
function Scores({ room, me }) {
  const order = seatsOf(room.players).sort((a, b) => b[1].score - a[1].score);
  return (
    <Rows>
      {order.map(([id, player], index) => (
        <ScoreRow key={id} $me={id === me}>
          <ScorePlace>{index + 1}</ScorePlace>
          <Avatar id={player.avatar} size={32} />
          <ScoreName numberOfLines={1}>{nameOf(room, id, me)}</ScoreName>
          <ScorePoints>
            {player.score} {player.score === 1 ? "ponto" : "pontos"}
          </ScorePoints>
        </ScoreRow>
      ))}
    </Rows>
  );
}

function Waiting({ room, me, code, busy, error, onStart, onRounds, onBot, onRemove, onExit }) {
  const host = room.host === me;
  const seats = seatsOf(room.players);
  const hostName = room.players[room.host]?.name ?? "o dono da sala";
  const winners = room.status === "over" ? room.winners.filter((id) => room.players[id]) : [];

  return (
    <Appear from="scale">
      <Card>
        <CardTitle>🕵️ Sala dos detetives</CardTitle>
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

        {winners.length > 0 ? (
          <CardText>
            🏆 {joinNames(winners.map((id) => nameOf(room, id, me)))}{" "}
            {winners.length > 1 ? "ganharam" : "ganhou"} a última partida!
          </CardText>
        ) : null}

        <Players>
          {seats.map(([id, player]) => (
            <PlayerCard key={id} $me={id === me}>
              <Avatar id={player.avatar} size={50} />
              <PlayerName numberOfLines={1}>
                {nameOf(room, id, me)}
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

        <CardText>
          🎯 Descobriu quem chutou mais longe? +{FIND_POINTS} ponto. Chutou mais longe e escapou (menos da
          metade descobriu)? +{ESCAPE_POINTS} pontos!
        </CardText>

        {host ? (
          <>
            <CardText>Quantas perguntas?</CardText>
            <Speeds>
              {ROUND_OPTIONS.map((rounds) => (
                <Bouncy
                  key={rounds}
                  onPress={() => onRounds(rounds)}
                  accessibilityState={{ selected: room.rounds === rounds }}
                  accessibilityLabel={`${rounds} perguntas`}
                >
                  <SpeedChip $selected={room.rounds === rounds}>
                    <SpeedLabel>{rounds} perguntas</SpeedLabel>
                  </SpeedChip>
                </Bouncy>
              ))}
            </Speeds>
            <Button
              title="Chamar um Bip para jogar"
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
              disabled={busy || seats.length < MIN_PLAYERS}
              onPress={onStart}
            />
            {seats.length < MIN_PLAYERS ? (
              <Muted style={{ color: colors.inkSoft }}>Precisa de pelo menos 3 jogadores (os Bips contam).</Muted>
            ) : null}
          </>
        ) : (
          <CardText>
            ⏳ Esperando {hostName} começar a partida... ({room.rounds} perguntas)
          </CardText>
        )}

        {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}
        <Button title="Sair da sala" icon="exit-outline" tone="white" size="sm" onPress={onExit} />
      </Card>
    </Appear>
  );
}

// onDark: em cima do fundo escuro (fora do cartão branco) os segundos ficam brancos
function Timer({ leftMs, total, onDark = false }) {
  const hot = leftMs < total * 0.3;
  const calm = onDark ? colors.white : colors.violet;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "stretch" }}>
      <ProgressBar
        value={leftMs / total}
        height={10}
        color={hot ? colors.coral : colors.yellow}
        style={{ flex: 1 }}
      />
      <Text style={{ fontFamily: "Fredoka_700Bold", fontSize: 18, color: hot ? colors.coral : calm }}>
        {Math.ceil(leftMs / 1000)}s
      </Text>
    </View>
  );
}

// quem já fez a parte dele (chutou ou votou) ganha um ✅ embaixo do avatar
function Progress({ room, me, done }) {
  return (
    <Faces>
      {seatsOf(room.players).map(([id, player]) => (
        <Face key={id} $dim={!done(id)}>
          <Avatar id={player.avatar} size={44} />
          {done(id) ? <Check>✅</Check> : null}
          <FaceName numberOfLines={1}>{nameOf(room, id, me)}</FaceName>
        </Face>
      ))}
    </Faces>
  );
}

function AnswerPhase({ room, me, code, leftMs }) {
  const question = questionOf(room);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const mine = room.answers[me];
  const count = Object.keys(room.answers).length;

  async function send() {
    if (!text || sending) return;
    setSending(true);
    const sent = await submitAnswer(code, me, Number(text)).catch(() => false);
    setSending(false);
    fx(sent ? "pop" : "wrong");
  }

  return (
    <Phase>
      <RoundTag>
        Pergunta {room.round} de {room.rounds}
      </RoundTag>
      <QuestionCard>
        <Text style={{ fontSize: 40, lineHeight: 48 }}>🤔</Text>
        <QuestionText>{question.text}</QuestionText>
        <Timer leftMs={leftMs} total={ANSWER_TIME} />
        {mine === undefined ? (
          <>
            <GuessRow>
              <GuessInput
                value={text}
                onChangeText={(value) => setText(value.replace(/\D/g, "").slice(0, 9))}
                keyboardType="number-pad"
                placeholder="Seu chute"
                placeholderTextColor={colors.muted}
                onSubmitEditing={send}
                accessibilityLabel="Seu chute"
                autoFocus
              />
              <Button title="Chutar!" icon="paper-plane" disabled={!text || sending} onPress={send} />
            </GuessRow>
            <Hint $dark>Só números. Não sabe? Chute! 😄</Hint>
          </>
        ) : (
          <Hint $dark>✅ Seu chute: {formatNumber(mine)}. Esperando os outros...</Hint>
        )}
      </QuestionCard>
      <Hint>
        {count} de {Object.keys(room.players).length} já chutaram
      </Hint>
      <Progress room={room} me={me} done={(id) => room.answers[id] !== undefined} />
    </Phase>
  );
}

// os chutes em ordem, do mais perto para o mais longe da resposta certa
function guessList(room) {
  const right = questionOf(room).answer;
  return Object.entries(room.answers)
    .map(([id, value]) => ({ id, value, distance: Math.abs(value - right) }))
    .sort((a, b) => a.distance - b.distance || a.value - b.value);
}

const distanceText = (distance) => (distance === 0 ? "acertou em cheio! 🎯" : `errou por ${formatNumber(distance)}`);

function VotePhase({ room, me, code, leftMs }) {
  const question = questionOf(room);
  const far = farthest(room);
  const myVote = room.votes[me];
  const suspects = seatsOf(room.players).filter(([id]) => id !== me && room.answers[id] !== undefined);
  const farValues = [...new Set(far.map((id) => formatNumber(room.answers[id])))];

  function vote(target) {
    if (myVote) return;
    submitVote(code, me, target).catch(() => fx("wrong"));
  }

  return (
    <Phase>
      <RoundTag>
        Pergunta {room.round} de {room.rounds}
      </RoundTag>
      <QuestionCard>
        <QuestionText style={{ fontSize: 19, lineHeight: 25 }}>{question.text}</QuestionText>
        <RightAnswer>
          <RightLabel>Resposta certa</RightLabel>
          <RightValue>{formatNumber(question.answer)}</RightValue>
        </RightAnswer>
      </QuestionCard>

      <Hint>Os chutes, sem os nomes:</Hint>
      <Rows>
        {guessList(room).map((guess) => (
          <GuessCard key={guess.id} $far={far.includes(guess.id)} $mine={guess.id === me}>
            <GuessValue>{formatNumber(guess.value)}</GuessValue>
            <GuessInfo>
              {distanceText(guess.distance)}
              {guess.id === me ? " · seu chute" : ""}
            </GuessInfo>
            {far.includes(guess.id) ? <Text style={{ fontSize: 20, lineHeight: 24 }}>🚀</Text> : null}
          </GuessCard>
        ))}
      </Rows>

      <Timer leftMs={leftMs} total={VOTE_TIME} onDark />
      {far.includes(me) ? (
        <Secret>🤫 O chute mais longe foi o seu! Vote em alguém para disfarçar e torça para ninguém descobrir.</Secret>
      ) : null}
      <Hint>
        🕵️ Quem chutou {joinNames(farValues)}? {myVote ? "Seu voto foi enviado!" : "Toque em quem você acha."}
      </Hint>
      <Choices>
        {suspects.map(([id, player]) => (
          <Bouncy
            key={id}
            onPress={() => vote(id)}
            accessibilityLabel={`Votar em ${player.name}`}
            accessibilityState={{ selected: myVote === id }}
          >
            <Choice $selected={myVote === id}>
              <Avatar id={player.avatar} size={54} />
              <ChoiceName numberOfLines={1}>{player.name}</ChoiceName>
            </Choice>
          </Bouncy>
        ))}
      </Choices>
      <Progress room={room} me={me} done={(id) => !!room.votes[id]} />
    </Phase>
  );
}

function Outcome({ room, me }) {
  const { result } = room;
  if (result.skipped) {
    const texts = {
      few: "Quase ninguém chutou a tempo: essa pergunta não valeu pontos.",
      exact: `Todo mundo acertou em cheio! +${FIND_POINTS} para cada um 🎯`,
      tie: "Todo mundo chutou à mesma distância: ninguém ganha ponto.",
    };
    return (
      <Verdict>
        <VerdictTitle>{texts[result.skipped]}</VerdictTitle>
      </Verdict>
    );
  }

  const finders = Object.keys(result.gains).filter((id) => !result.far.includes(id));
  return (
    <Verdict>
      {result.far.map((id) => {
        const escaped = result.escaped.includes(id);
        return (
          <Appear key={id} from="scale" style={{ alignItems: "center", gap: 4 }}>
            <Avatar id={room.players[id]?.avatar} size={72} />
            <VerdictTitle>
              {id === me ? "O chute mais longe foi o seu" : `Quem chutou mais longe foi ${nameOf(room, id, me)}`}:{" "}
              {formatNumber(room.answers[id] ?? 0)}!
            </VerdictTitle>
            <Hint $dark>
              {escaped
                ? `🤫 Escapou! Só ${result.found[id]} de ${result.voters} detetives descobriram. +${ESCAPE_POINTS} pontos!`
                : `🕵️ Descoberto por ${result.found[id]} de ${result.voters} detetives: sem pontos desta vez.`}
            </Hint>
          </Appear>
        );
      })}
      <Hint $dark>
        {finders.length > 0
          ? `🎯 Descobriram: ${joinNames(finders.map((id) => nameOf(room, id, me)))} (+${FIND_POINTS})`
          : "Ninguém descobriu! 😮"}
      </Hint>
    </Verdict>
  );
}

// canAdvance: é o dono da sala, ou o dono sumiu e qualquer um pode passar (veja nextRound)
function RevealPhase({ room, me, busy, canAdvance, onNext }) {
  const question = questionOf(room);
  const far = room.result.far;
  const hostName = room.players[room.host]?.name ?? "o dono da sala";

  return (
    <Phase>
      <RoundTag>
        Pergunta {room.round} de {room.rounds}
      </RoundTag>
      <Outcome room={room} me={me} />
      <Fact>
        💡 {question.text} Resposta: {formatNumber(question.answer)}. {question.fact}
      </Fact>

      <Hint>Quem chutou o quê:</Hint>
      <Rows>
        {guessList(room).map((guess) => {
          const voted = room.votes[guess.id];
          return (
            <GuessCard key={guess.id} $far={far.includes(guess.id)} $mine={guess.id === me}>
              <Avatar id={room.players[guess.id]?.avatar} size={34} />
              <View style={{ flex: 1 }}>
                <GuessValue style={{ minWidth: 0 }} numberOfLines={1}>
                  {nameOf(room, guess.id, me)}: {formatNumber(guess.value)}
                </GuessValue>
                <GuessInfo>
                  {distanceText(guess.distance)}
                  {voted ? ` · votou em ${voted === me ? "você" : nameOf(room, voted, me)}` : ""}
                </GuessInfo>
              </View>
              {room.result.gains[guess.id] ? <Gain>+{room.result.gains[guess.id]}</Gain> : null}
            </GuessCard>
          );
        })}
      </Rows>

      <Hint>Placar:</Hint>
      <Scores room={room} me={me} />

      {canAdvance && room.host !== me ? <Hint>🙈 {hostName} não passou para a próxima. Siga você!</Hint> : null}
      {canAdvance ? (
        <Button
          title={room.round >= room.rounds ? "Ver o resultado final" : "Próxima pergunta"}
          icon={room.round >= room.rounds ? "trophy" : "arrow-forward"}
          size="lg"
          full
          disabled={busy}
          onPress={onNext}
        />
      ) : (
        <Hint>⏳ Esperando {hostName} passar para a próxima...</Hint>
      )}
    </Phase>
  );
}

function WinnerOverlay({ room, me }) {
  const winners = room.winners.filter((id) => room.players[id]);
  const iWon = winners.includes(me);
  return (
    <Overlay>
      <Confetti />
      <Appear from="scale" style={{ alignItems: "center", paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 64, lineHeight: 78 }}>🏆</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {winners.map((id) => (
            <Avatar key={id} id={room.players[id].avatar} size={84} />
          ))}
        </View>
        <BigText>
          {iWon && winners.length === 1
            ? "VOCÊ VENCEU!"
            : `${joinNames(winners.map((id) => nameOf(room, id, me)))} ${winners.length > 1 ? "venceram" : "venceu"}!`}
        </BigText>
        <OverlayText>Os melhores detetives (e chutadores) da sala! 🕵️</OverlayText>
      </Appear>
    </Overlay>
  );
}

// Quem Chutou Longe?, online: salas com código de 4 letras, de 3 a 8 jogadores (os Bips podem entrar).
function Board({ finish, area }) {
  const { user } = useContext(AuthContext);
  const me = user.id;
  const [code, setCode] = useState(session.code);
  const [room, setRoom] = useState(undefined); // undefined = carregando, null = a sala não existe mais
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ending, setEnding] = useState(false);
  // diferença entre o relógio do servidor e o deste aparelho (para todo mundo ver o mesmo tempo)
  const clock = useRef({ offset: 0, samples: [] });
  const attempted = useRef(null);
  const ticked = useRef(null);
  const lastPhase = useRef(null);

  const timed = room && PHASE_TIME[room.status] && room.phaseAt;
  // no resultado o relógio anda mais devagar, só para notar se o dono da sala sumiu
  const revealing = room?.status === "reveal";
  const now = useNow(timed ? 250 : 1000, !!timed || revealing);
  const total = timed ? PHASE_TIME[room.status] : 1;
  const elapsed = timed ? now + clock.current.offset - room.phaseAt : 0;
  const leftMs = Math.max(0, total - elapsed);
  // o resultado começa na última mudança da sala (updatedAt, na hora do servidor)
  const hostAway = revealing && !!room.updatedAt && now + clock.current.offset - room.updatedAt > HOST_AWAY;

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

  // Acabou o tempo da fase: o dono da sala fecha; se ele sumiu, qualquer um fecha um pouco depois
  // (a transação garante que fecha uma vez só).
  useEffect(() => {
    if (!timed) return;
    const key = `${room.status}:${room.phaseAt}`;
    const wait = room.host === me ? 1200 : 4000;
    if (elapsed - total > wait && attempted.current !== key) {
      attempted.current = key;
      closePhase(code, room.status, room.phaseAt).catch(() => {
        attempted.current = null;
      });
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // tique-taque nos últimos 3 segundos, para quem ainda não chutou ou não votou
  useEffect(() => {
    if (!timed) return;
    const pending = room.status === "answer" ? room.answers[me] === undefined : !room.votes[me];
    const second = Math.ceil(leftMs / 1000);
    const key = `${room.phaseAt}:${second}`;
    if (pending && second > 0 && second <= 3 && ticked.current !== key) {
      ticked.current = key;
      fx("tick");
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  // som quando a fase muda (no resultado: estrela para quem ganhou ponto)
  useEffect(() => {
    if (!room) return;
    const key = `${room.game}:${room.round}:${room.status}`;
    if (lastPhase.current === null || lastPhase.current === key) {
      lastPhase.current = key;
      return;
    }
    lastPhase.current = key;
    if (room.status === "vote") fx("flip");
    if (room.status === "reveal") fx(room.result?.gains?.[me] ? "star" : "pop");
  }, [room?.status, room?.round, room?.game]); // eslint-disable-line react-hooks/exhaustive-deps

  // o aparelho do dono da sala chuta e vota pelos Bips, cada um num tempo diferente
  useEffect(() => {
    if (!room || room.host !== me || !["answer", "vote"].includes(room.status)) return undefined;
    const bots = Object.keys(room.players).filter((id) => room.players[id].bot);
    const snapshot = room;
    const timers = bots.map((bot) =>
      setTimeout(
        () => {
          if (snapshot.status === "answer") {
            submitAnswer(code, bot, botGuess(questionOf(snapshot).answer)).catch(() => {});
          } else {
            const target = botVote(snapshot, bot);
            if (target) submitVote(code, bot, target).catch(() => {});
          }
        },
        3000 + Math.random() * 9000
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [room?.status, room?.round, room?.game, room?.host]); // eslint-disable-line react-hooks/exhaustive-deps

  // fim da partida: comemora quem venceu e entrega o resultado (lugar → estrelas) para a tela de fim
  useEffect(() => {
    if (!room || room.status !== "over" || session.finishedGame === room.game || !room.players[me]) return undefined;
    const myScore = room.players[me].score;
    const place = 1 + Object.values(room.players).filter((player) => player.score > myScore).length;
    const count = Object.keys(room.players).length;
    session.finishedGame = room.game;
    setEnding(true);
    fx("match");
    const timer = setTimeout(() => {
      setEnding(false);
      finish({
        score: myScore,
        stars: place === 1 ? 3 : place === 2 ? 2 : 1,
        message:
          place === 1
            ? "Você fez mais pontos que todo mundo: detetive campeão! 🏆"
            : `Você ficou em ${place}º lugar entre ${count} jogadores.`,
        stats: [
          { label: "Lugar", value: `${place}º` },
          { label: "Pontos", value: myScore },
        ],
        detail: { place, players: count },
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
        onBips={() =>
          act(async () => {
            const value = await createRoom(user);
            await addBot(value);
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
  } else if (room.status === "answer") {
    content = <AnswerPhase key={`${room.game}:${room.round}`} room={room} me={me} code={code} leftMs={leftMs} />;
  } else if (room.status === "vote") {
    content = <VotePhase room={room} me={me} code={code} leftMs={leftMs} />;
  } else if (room.status === "reveal") {
    content = (
      <RevealPhase
        room={room}
        me={me}
        busy={busy}
        canAdvance={room.host === me || hostAway}
        onNext={() => act(() => nextRound(code, me))}
      />
    );
  } else {
    content = (
      <Waiting
        room={room}
        me={me}
        code={code}
        busy={busy}
        error={error}
        onStart={() => act(() => startGame(code))}
        onRounds={(rounds) => act(() => setRounds(code, rounds))}
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
        {error && room && room.status !== "lobby" && room.status !== "over" ? (
          <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText>
        ) : null}
      </ScrollView>
      {ending && room ? <WinnerOverlay room={room} me={me} /> : null}
    </View>
  );
}

export default function WildGuess() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
