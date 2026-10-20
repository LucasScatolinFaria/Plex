import { useContext, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import { useCelebration } from "../../../components/Celebration";
import CheerCrest from "../../../components/CheerCrest";
import ChipScroll from "../../../components/ChipScroll";
import Float from "../../../components/Float";
import JesScreen from "../../../components/JesScreen";
import Mascot from "../../../components/Mascot";
import MyTeamPicker, { MyTeamButton } from "../../../components/MyTeamPicker";
import Scoreboard from "../../../components/Scoreboard";
import TypeText from "../../../components/TypeText";
import { AuthContext } from "../../../contexts/auth";
import { useJes } from "../../../contexts/jes";
import { DIVISIONS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import { colors, fonts, glow, jesGradients, shadow } from "../../../theme";
import { byKickoff, dateLabel, describeEvent, getSport, getTeam, standings } from "../../../utils/jes";
import { LinkButton, LinkText, SectionHint, SectionRow, SectionTitle } from "../style";
import {
  Bubble,
  BubbleLabel,
  CardFoot,
  DivisionCard,
  DivisionHead,
  DivisionNick,
  DivisionTitle,
  EmptyBoard,
  EmptyDigit,
  EmptyDigits,
  EmptyText,
  EmptyTitle,
  LiveDot,
  LiveTitle,
  MineTag,
  MiniName,
  MiniPoints,
  MiniPosition,
  MiniRow,
  Narrator,
  NextLabel,
  OrganizerLink,
  Picker,
  PickerText,
  RankingGrid,
  Stage,
} from "./style";

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

// "hoje", "amanhã" ou "no dia 22/10"
function whenText(match) {
  const label = dateLabel(match.date);
  if (label === "Hoje" || label === "Amanhã") return label.toLowerCase();
  return `no dia ${match.date.slice(8)}/${match.date.slice(5, 7)}`;
}

// O que o Bip Craque fala: narra o último lance do jogo ao vivo, avisa o próximo jogo
// ou explica que tudo começa quando o organizador marcar os jogos.
function narration(match, next, myTeam) {
  if (match) {
    const sport = getSport(match.sport);
    const teamA = getTeam(match.teamA);
    const teamB = getTeam(match.teamB);
    const last = match.events[match.events.length - 1];
    if (last?.type === "score") {
      const { text, team } = describeEvent(last, match);
      const mine = team?.id === myTeam ? " É a SUA sala!" : "";
      return { mood: "excited", text: `${sport.score.cheer} ${text} ${team?.emoji ?? ""}${mine}` };
    }
    if (!match.clock.running) {
      return { mood: "thinking", text: "Pausa para beber água! Já já a bola volta a rolar. 💧" };
    }
    if (last && last.type !== "start") return { mood: "happy", text: describeEvent(last, match).text };
    return {
      mood: "happy",
      text: `Tá rolando ${sport.name.toLowerCase()}: ${teamA.label} ${teamA.emoji} x ${teamB.emoji} ${teamB.label}! Quem vai marcar primeiro?`,
    };
  }
  if (next) {
    const sport = getSport(next.sport);
    return {
      mood: "happy",
      text: `Nenhum jogo agora. O próximo é ${whenText(next)}, às ${next.time}: ${getTeam(next.teamA).label} x ${
        getTeam(next.teamB).label
      } no ${sport.name.toLowerCase()}! ${sport.emoji}`,
    };
  }
  const mine = myTeam ? getTeam(myTeam) : null;
  return {
    mood: "wink",
    text: mine
      ? `Oi, torcida do ${mine.label} ${mine.emoji}! Ainda não tem jogo marcado. Quando o organizador marcar, eu narro tudo aqui!`
      : "Oi! Eu sou o Bip Craque, o narrador do JES Kids! Quando o organizador marcar os jogos, eu conto tudo aqui. ⚽",
  };
}

// o placar do jogo ao vivo; sem jogo rolando, o próximo jogo; sem nenhum jogo, o placar apagado
function Board({ featured, next, onOpen }) {
  if (featured) return <Scoreboard match={featured} big onPress={() => onOpen(featured)} />;
  if (next) {
    return (
      <View>
        <NextLabel>⏳ PRÓXIMO JOGO</NextLabel>
        <Scoreboard match={next} big onPress={() => onOpen(next)} />
      </View>
    );
  }
  return (
    <EmptyBoard colors={jesGradients.board} {...DIAGONAL} style={shadow(16, 36, "rgba(0,0,0,0.55)")}>
      <EmptyDigits>
        <Text style={{ fontSize: 40, lineHeight: 50 }}>🏟️</Text>
        <EmptyDigit>0</EmptyDigit>
        <Text style={{ fontFamily: fonts.title, fontSize: 24, color: "rgba(255,255,255,0.4)" }}>x</Text>
        <EmptyDigit>0</EmptyDigit>
        <Text style={{ fontSize: 40, lineHeight: 50 }}>🏆</Text>
      </EmptyDigits>
      <EmptyTitle>AGUARDANDO OS JOGOS</EmptyTitle>
      <EmptyText>O placar acende sozinho quando o primeiro jogo começar.</EmptyText>
    </EmptyBoard>
  );
}

// Resumo do ranking de uma dupla de anos. Começa zerado; o escudo de cada sala dá para tocar e torcer.
function DivisionRanking({ division, matches, bonuses, myTeam, onOpen }) {
  const rows = standings(matches, division.id, null, bonuses);
  const started = rows.some((row) => row.points !== 0 || row.played > 0);

  return (
    <DivisionCard style={shadow(8, 20, "rgba(0,0,0,0.35)")}>
      <Bouncy
        onPress={onOpen}
        pressedScale={0.98}
        hoverScale={1.01}
        accessibilityLabel={`Ranking do ${division.label}`}
      >
        <DivisionHead colors={division.colors} {...DIAGONAL}>
          <Text style={{ fontSize: 18, lineHeight: 22 }}>{division.emoji}</Text>
          <DivisionTitle>{division.label}</DivisionTitle>
          <DivisionNick>{division.nick}</DivisionNick>
          <Ionicons name="chevron-forward" size={16} color="rgba(26,18,3,0.7)" />
        </DivisionHead>
      </Bouncy>
      {rows.map((row, index) => {
        const leader = started && index === 0 && row.points > 0;
        const mine = row.team.id === myTeam;
        return (
          <MiniRow key={row.team.id} $first={index === 0} $mine={mine}>
            <MiniPosition $leader={leader}>{started ? `${row.position}º` : "–"}</MiniPosition>
            <CheerCrest team={row.team} size={34} />
            <MiniName numberOfLines={1}>
              {row.team.label} {row.team.name}
              {leader ? " 👑" : ""}
            </MiniName>
            {mine ? <MineTag>SUA SALA</MineTag> : null}
            <MiniPoints $zero={row.points === 0}>{row.points} pts</MiniPoints>
          </MiniRow>
        );
      })}
      {started ? null : <CardFoot>Todo mundo começa com 0 pontos. Que vença o jogo limpo! 🤝</CardFoot>}
    </DivisionCard>
  );
}

// Página inicial do JES Kids: só o placar (com o Bip Craque narrando) e o ranking das salas.
// O resto (tabela, ranking completo, esportes) fica nas abas do topo.
export default function JesLive() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { matches, bonuses, myTeam, setMyTeam } = useJes();
  const { isTablet, isWide } = useLayout();
  const [selected, setSelected] = useState(null);
  const [picking, setPicking] = useState(false);
  const party = useCelebration(matches);

  const { live, next } = useMemo(() => {
    const sorted = [...matches].sort(byKickoff);
    return {
      live: sorted.filter((match) => match.status === "live"),
      next: sorted.find((match) => match.status === "scheduled"),
    };
  }, [matches]);

  const featured = live.find((match) => match.id === selected) || live[0];
  const line = narration(featured, next, myTeam);
  const openMatch = (match) => navigation.navigate("JesMatch", { id: match.id });

  return (
    <JesScreen overlay={party}>
      <SectionRow style={{ marginTop: 4 }}>
        <LiveTitle>
          <Float kind="beat" duration={600}>
            <LiveDot style={glow("rgba(255,59,78,0.9)", 10)} />
          </Float>
          <SectionTitle accessibilityRole="header">Placar ao vivo</SectionTitle>
        </LiveTitle>
        <SectionHint>Atualiza sozinho ⚡</SectionHint>
      </SectionRow>

      {live.length > 1 ? (
        <ChipScroll style={{ marginBottom: 12 }}>
          {live.map((match) => {
            const active = match.id === featured.id;
            return (
              <Bouncy
                key={match.id}
                onPress={() => setSelected(match.id)}
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Ver ${getTeam(match.teamA).label} contra ${getTeam(match.teamB).label}`}
              >
                <Picker $selected={active}>
                  <PickerText>
                    {getSport(match.sport).emoji} {getTeam(match.teamA).label} {match.scoreA} x {match.scoreB}{" "}
                    {getTeam(match.teamB).label}
                  </PickerText>
                </Picker>
              </Bouncy>
            );
          })}
        </ChipScroll>
      ) : null}

      <Appear from="scale">
        <Stage $wide={isWide}>
          <Narrator $wide={isWide}>
            <Mascot sporty size={isWide ? 118 : isTablet ? 92 : 74} mood={line.mood} />
            <Bubble $wide={isWide} style={shadow(8, 18, "rgba(0,0,0,0.3)")}>
              <BubbleLabel>📣 BIP CRAQUE NARRANDO</BubbleLabel>
              <TypeText
                key={line.text}
                text={line.text}
                style={{ fontFamily: fonts.heading, fontSize: 16, lineHeight: 21, color: colors.ink }}
              />
            </Bubble>
          </Narrator>
          <View style={{ flex: isWide ? 1 : undefined, width: isWide ? undefined : "100%" }}>
            <Board featured={featured} next={next} onOpen={openMatch} />
          </View>
        </Stage>
      </Appear>

      <SectionRow style={{ flexWrap: "wrap" }}>
        <SectionTitle accessibilityRole="header">🏆 Ranking das salas</SectionTitle>
        <MyTeamButton myTeam={myTeam} open={picking} onToggle={() => setPicking((open) => !open)} />
      </SectionRow>

      {picking ? (
        <MyTeamPicker
          myTeam={myTeam}
          onPick={(id) => {
            setMyTeam(id);
            setPicking(false);
          }}
        />
      ) : null}

      <RankingGrid $wide={isWide}>
        {DIVISIONS.map((division, index) => (
          <Appear key={division.id} delay={120 + index * 90} style={{ flex: isWide ? 1 : undefined }}>
            <DivisionRanking
              division={division}
              matches={matches}
              bonuses={bonuses}
              myTeam={myTeam}
              onOpen={() => navigation.navigate("JesStandings", { division: division.id })}
            />
          </Appear>
        ))}
      </RankingGrid>

      <Bouncy onPress={() => navigation.navigate("JesStandings")} accessibilityLabel="Ver o ranking completo">
        <LinkButton>
          <LinkText>Ver o ranking completo</LinkText>
          <Ionicons name="arrow-forward" size={16} color={colors.yellow} />
        </LinkButton>
      </Bouncy>

      {user && !user.guest ? (
        <Bouncy
          onPress={() => navigation.navigate("JesOrganizer")}
          accessibilityLabel="Abrir a área do organizador"
        >
          <OrganizerLink>📋 Área do organizador</OrganizerLink>
        </Bouncy>
      ) : null}
    </JesScreen>
  );
}
