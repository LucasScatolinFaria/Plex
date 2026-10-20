import { useState } from "react";
import { Platform, Text } from "react-native";

import Bouncy from "../Bouncy";
import StatusBadge from "../StatusBadge";
import TeamCrest from "../TeamCrest";
import useNow from "../../hooks/useNow";
import { shadow } from "../../theme";
import { clockSeconds, dateLabel, formatClock, getDivision, getSport, getTeam, winnerOf } from "../../utils/jes";
import {
  Card,
  Clock,
  DivisionText,
  Footer,
  FooterText,
  Middle,
  Score,
  SportChip,
  SportText,
  TeamName,
  TeamSide,
  Teams,
  TopRow,
  Versus,
} from "./style";

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

// no computador o cartão sobe um pouco com o mouse em cima (transição de CSS, com leve exagero no fim)
const HOVER_EASE =
  Platform.OS === "web"
    ? {
        transitionProperty: "transform, box-shadow",
        transitionDuration: "300ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }
    : null;

function LiveClock({ match }) {
  const now = useNow(1000, match.clock.running);
  return <Clock>⏱ {formatClock(clockSeconds(match, now))}</Clock>;
}

function Side({ team }) {
  return (
    <TeamSide>
      <TeamCrest team={team} size={50} label />
      <TeamName numberOfLines={1}>{team.name}</TeamName>
    </TeamSide>
  );
}

// Cartão de um jogo nas listas: esporte, salas, placar (ou "VS" antes de começar), horário e local.
export default function MatchCard({ match, onPress, showDate = true }) {
  const [hovered, setHovered] = useState(false);
  const sport = getSport(match.sport);
  const teamA = getTeam(match.teamA);
  const teamB = getTeam(match.teamB);
  const started = match.status !== "scheduled";
  const winner = match.status === "finished" ? winnerOf(match) : null;
  const scoreText = started ? `${match.scoreA} a ${match.scoreB}` : "ainda não começou";

  return (
    <Bouncy
      onPress={onPress}
      onHoverChange={setHovered}
      hoverScale={1.02}
      pressedScale={0.97}
      accessibilityLabel={`${sport.name}: ${teamA.label} contra ${teamB.label}, ${scoreText}. Abrir o placar.`}
    >
      <Card
        $live={match.status === "live"}
        style={[
          HOVER_EASE,
          hovered
            ? [shadow(18, 30, "rgba(0,0,0,0.5)"), { transform: [{ translateY: -4 }] }]
            : shadow(8, 20, "rgba(0,0,0,0.35)"),
        ]}
      >
        <TopRow>
          <SportChip colors={sport.colors} {...DIAGONAL}>
            <Text style={{ fontSize: 13, lineHeight: 17 }}>{sport.emoji}</Text>
            <SportText>{sport.name}</SportText>
          </SportChip>
          <DivisionText numberOfLines={1}>{getDivision(match.division).label}</DivisionText>
          <StatusBadge match={match} size="sm" />
        </TopRow>

        <Teams>
          <Side team={teamA} />
          <Middle>
            {started ? (
              <>
                <Score $win={winner === "A"}>{match.scoreA}</Score>
                <Versus>x</Versus>
                <Score $win={winner === "B"}>{match.scoreB}</Score>
              </>
            ) : (
              <Versus $big>VS</Versus>
            )}
          </Middle>
          <Side team={teamB} />
        </Teams>

        <Footer>
          <FooterText numberOfLines={1}>
            🕒 {showDate ? `${dateLabel(match.date)} · ` : ""}
            {match.time}
          </FooterText>
          {match.status === "live" ? (
            <LiveClock match={match} />
          ) : (
            <FooterText numberOfLines={1}>📍 {match.place}</FooterText>
          )}
        </Footer>
      </Card>
    </Bouncy>
  );
}
