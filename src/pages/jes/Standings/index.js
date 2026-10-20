import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import CheerCrest from "../../../components/CheerCrest";
import ChipScroll from "../../../components/ChipScroll";
import Float from "../../../components/Float";
import JesScreen from "../../../components/JesScreen";
import Mascot from "../../../components/Mascot";
import TeamCrest from "../../../components/TeamCrest";
import { useJes } from "../../../contexts/jes";
import { DIVISIONS, POINTS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import { colors, jes } from "../../../theme";
import { getDivision, sportsOf, standings } from "../../../utils/jes";
import { Chip, ChipText, Kicker, PageHead, PageHint, PageTitle } from "../style";
import {
  BodyRow,
  Cell,
  Dot,
  HeadCell,
  HeadEmoji,
  HeadRow,
  Legend,
  MineTag,
  Pedestal,
  PedestalNumber,
  Podium,
  PointsCell,
  PositionCell,
  RuleChip,
  Rules,
  Spot,
  SpotName,
  SpotNick,
  SpotPoints,
  StartCard,
  StartText,
  Tab,
  TabEmoji,
  TabNick,
  TabTitle,
  Table,
  Tabs,
  TeamCell,
  TeamNick,
  TeamText,
} from "./style";

// ordem do pódio na tela: 2º, 1º, 3º
const PODIUM = [
  { place: 2, height: 84, crest: 70, colors: ["#E2E8F0", "#94A3B8"] },
  { place: 1, height: 118, crest: 92, colors: ["#FFE27A", "#FFB020"] },
  { place: 3, height: 62, crest: 62, colors: ["#FDBA74", "#C2703A"] },
];

const MEDAL_COLORS = { 1: colors.yellow, 2: "#E2E8F0", 3: "#FDBA74" };
const FORM_COLORS = { V: "#22C55E", E: "#FACC15", D: "#EF4444" };
const FORM_WORDS = { V: "vitória", E: "empate", D: "derrota" };
const UNSELECTED = ["rgba(4,28,16,0.85)", "rgba(4,28,16,0.85)"];

// colunas da tabela com emoji (fácil de entender); no celular saem o saldo e a forma
function columnsFor(compact, withExtras) {
  return [
    { key: "played", emoji: "🎮", label: "Jogos", width: compact ? 30 : 64 },
    { key: "wins", emoji: "✅", label: "Vitórias", width: compact ? 30 : 64 },
    { key: "draws", emoji: "🤝", label: "Empates", width: compact ? 30 : 64 },
    { key: "losses", emoji: "❌", label: "Derrotas", width: compact ? 30 : 64 },
    ...(compact ? [] : [{ key: "balance", emoji: "⚖️", label: "Saldo", width: 58 }]),
    ...(withExtras ? [{ key: "extra", emoji: "🎁", label: "Extras", width: compact ? 30 : 58 }] : []),
  ];
}

const signed = (value) => (value > 0 ? `+${value}` : `${value}`);

function Form({ results }) {
  return (
    <View
      style={{ flexDirection: "row", gap: 4, width: 84, justifyContent: "center" }}
      accessibilityLabel={`Últimos jogos: ${results.map((result) => FORM_WORDS[result]).join(", ") || "nenhum"}`}
    >
      {results.map((result, index) => (
        <Dot key={index} style={{ backgroundColor: FORM_COLORS[result] }} />
      ))}
    </View>
  );
}

// Ranking das salas: cada dupla de anos (1º e 2º, 3º e 4º, 5º e 6º) tem a sua tabela, somando todos os
// esportes ("Geral") ou só um. Começa zerada; quando alguém pontua, os três primeiros sobem no pódio.
export default function JesStandings() {
  const route = useRoute();
  const { matches, bonuses, myTeam } = useJes();
  const { isTablet } = useLayout();
  const [division, setDivision] = useState(route.params?.division || DIVISIONS[0].id);
  const [sport, setSport] = useState(null);

  // o ranking da página inicial abre direto na dupla de anos tocada
  useEffect(() => {
    if (route.params?.division) {
      setDivision(route.params.division);
      setSport(null);
    }
  }, [route.params?.division]);

  const rows = standings(matches, division, sport, bonuses);
  const started = rows.some((row) => row.points !== 0 || row.played > 0);
  const withExtras = rows.some((row) => row.extra !== 0);
  const columns = columnsFor(!isTablet, withExtras);
  const info = getDivision(division);

  return (
    <JesScreen maxWidth={980}>
      <PageHead>
        <Kicker>JES KIDS 2026</Kicker>
        <PageTitle accessibilityRole="header" $compact={!isTablet}>
          Ranking das salas 🏆
        </PageTitle>
        <PageHint>
          O 1º ano disputa com o 2º, o 3º com o 4º e o 5º com o 6º. Cada sala soma pontos em todos os esportes!
        </PageHint>
      </PageHead>

      <Tabs>
        {DIVISIONS.map((item) => {
          const selected = item.id === division;
          return (
            <Bouncy
              key={item.id}
              style={{ flex: 1 }}
              onPress={() => {
                setDivision(item.id);
                setSport(null);
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${item.label}: ${item.nick}`}
            >
              <Tab
                colors={selected ? item.colors : UNSELECTED}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                $selected={selected}
              >
                <TabEmoji>{item.emoji}</TabEmoji>
                <TabTitle $selected={selected} $compact={!isTablet}>
                  {item.label}
                </TabTitle>
                <TabNick $selected={selected} numberOfLines={1}>
                  {item.nick}
                </TabNick>
              </Tab>
            </Bouncy>
          );
        })}
      </Tabs>

      <ChipScroll style={{ marginTop: 14 }}>
        {[{ id: null, emoji: "🏅", name: "Geral" }, ...sportsOf(division)].map((item) => (
          <Bouncy
            key={item.id ?? "geral"}
            onPress={() => setSport(item.id)}
            accessibilityState={{ selected: sport === item.id }}
            accessibilityLabel={`Ranking de ${item.name}`}
          >
            <Chip $selected={sport === item.id}>
              <ChipText $selected={sport === item.id}>
                {item.emoji} {item.name}
              </ChipText>
            </Chip>
          </Bouncy>
        ))}
      </ChipScroll>

      {started ? (
        <Podium key={`${division}-${sport}`}>
          {PODIUM.map((spot, index) => {
            const row = rows[spot.place - 1];
            return (
              <Spot key={spot.place}>
                <Appear from="bottom" delay={200 + index * 140} style={{ alignItems: "center" }}>
                  {spot.place === 1 ? (
                    <Float kind="bob" duration={1000}>
                      <Text style={{ fontSize: 30, lineHeight: 36 }}>👑</Text>
                    </Float>
                  ) : null}
                  <TeamCrest team={row.team} size={isTablet ? spot.crest : spot.crest * 0.75} />
                  <SpotName>{row.team.label}</SpotName>
                  <SpotNick numberOfLines={1}>{row.team.name}</SpotNick>
                  <SpotPoints>{row.points} pts</SpotPoints>
                </Appear>
                <Pedestal colors={spot.colors} style={{ height: spot.height }}>
                  <PedestalNumber>{spot.place}º</PedestalNumber>
                </Pedestal>
              </Spot>
            );
          })}
        </Podium>
      ) : (
        <Appear from="scale">
          <StartCard>
            <Mascot sporty size={isTablet ? 84 : 64} mood="wink" />
            <StartText>
              {info.emoji} Ninguém pontuou {sport ? "neste esporte " : ""}ainda no {info.label}. Todo mundo começa
              com 0 pontos! O pódio aparece quando o primeiro jogo acabar.
            </StartText>
          </StartCard>
        </Appear>
      )}

      <Table style={{ marginTop: started ? 0 : 14 }}>
        <HeadRow>
          <HeadCell style={{ width: 34 }}>#</HeadCell>
          <HeadCell style={{ flex: 1, textAlign: "left", paddingLeft: 6 }}>SALA</HeadCell>
          {columns.map((column) => (
            <View key={column.key} style={{ width: column.width, alignItems: "center" }}>
              <HeadEmoji>{column.emoji}</HeadEmoji>
              {isTablet ? <HeadCell>{column.label.toUpperCase()}</HeadCell> : null}
            </View>
          ))}
          <View style={{ width: isTablet ? 64 : 44, alignItems: "center" }}>
            <HeadEmoji>⭐</HeadEmoji>
            {isTablet ? <HeadCell>PONTOS</HeadCell> : null}
          </View>
          {isTablet ? (
            <View style={{ width: 84, alignItems: "center" }}>
              <HeadEmoji>📈</HeadEmoji>
              <HeadCell>ÚLTIMOS</HeadCell>
            </View>
          ) : null}
        </HeadRow>
        {rows.map((row, index) => {
          const mine = row.team.id === myTeam;
          return (
            <Appear key={`${division}-${sport}-${row.team.id}`} from="left" delay={300 + index * 70}>
              <BodyRow
                $leader={started && index === 0}
                $mine={mine}
                accessibilityLabel={`${started ? `${row.position}º lugar: ` : ""}${row.team.label} ${row.team.name}, ${
                  row.points
                } pontos`}
              >
                <PositionCell
                  style={{ width: 34 }}
                  $color={started ? (MEDAL_COLORS[row.position] ?? jes.textSoft) : jes.muted}
                >
                  {started ? `${row.position}º` : "–"}
                </PositionCell>
                <TeamCell style={{ paddingLeft: 6 }}>
                  <CheerCrest team={row.team} size={isTablet ? 38 : 32} />
                  <TeamText numberOfLines={1}>
                    {row.team.label}
                    {isTablet ? <TeamNick> {row.team.name}</TeamNick> : null}
                  </TeamText>
                  {mine ? <MineTag>{isTablet ? "SUA SALA" : "⭐"}</MineTag> : null}
                </TeamCell>
                {columns.map((column) => (
                  <Cell key={column.key} style={{ width: column.width }}>
                    {column.key === "balance" || column.key === "extra"
                      ? signed(row[column.key])
                      : row[column.key]}
                  </Cell>
                ))}
                <PointsCell style={{ width: isTablet ? 64 : 44 }}>{row.points}</PointsCell>
                {isTablet ? <Form results={row.form} /> : null}
              </BodyRow>
            </Appear>
          );
        })}
      </Table>

      <Legend>
        {isTablet
          ? "Toque no escudo de uma sala para torcer por ela! 📣\n🟢 vitória  🟡 empate  🔴 derrota (últimos 5 jogos)"
          : `🎮 jogos · ✅ vitórias · 🤝 empates · ❌ derrotas${withExtras ? " · 🎁 extras" : ""} · ⭐ pontos\nToque no escudo para torcer! 📣`}
      </Legend>

      <Rules>
        <RuleChip>🏆 Vitória = {POINTS.win} pontos</RuleChip>
        <RuleChip>🤝 Empate = {POINTS.draw} ponto</RuleChip>
        <RuleChip>💪 Derrota = {POINTS.loss} pontos, mas muito aprendizado!</RuleChip>
        <RuleChip>🎁 Extras = pontos que o organizador dá por fair play, torcida e mais</RuleChip>
      </Rules>
      <Legend>Empatou em pontos? Desempata quem tiver mais vitórias, depois o melhor saldo.</Legend>
    </JesScreen>
  );
}
