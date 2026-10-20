import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

import Bouncy from "../Bouncy";
import Float from "../Float";
import StatusBadge from "../StatusBadge";
import TeamCrest from "../TeamCrest";
import useLayout from "../../hooks/useLayout";
import useNow from "../../hooks/useNow";
import { colors, fonts, jesGradients, nativeDriver, shadow, textShadow } from "../../theme";
import { clockSeconds, dateLabel, formatClock, getDivision, getSport, getTeam, winnerOf } from "../../utils/jes";
import {
  Body,
  Bulb,
  Bulbs,
  ClockBox,
  ClockText,
  DigitBox,
  Digits,
  DivisionText,
  Footer,
  FooterText,
  Frame,
  Header,
  Separator,
  SportChip,
  SportText,
  TeamColumn,
  TeamLabel,
  TeamName,
} from "./style";

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const BULBS = 22;
const GLOW = textShadow("rgba(255,210,63,0.75)", 0, 14);

// Número do placar: quando muda, dá um pulo (só depois que o placar já está na tela).
// dim = quem perdeu, com o número mais apagado.
function ScoreDigit({ value, size, dim }) {
  const bump = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    bump.setValue(1.45);
    const animation = Animated.spring(bump, {
      toValue: 1,
      friction: 3,
      tension: 120,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [value, bump]);

  return (
    <DigitBox style={{ minWidth: size * 1.25, paddingHorizontal: size * 0.18, height: size * 1.3 }}>
      <Animated.Text
        allowFontScaling={false}
        style={[
          { fontFamily: fonts.title, fontSize: size, lineHeight: size * 1.2, color: colors.yellow },
          dim ? { opacity: 0.45 } : GLOW,
          { transform: [{ scale: bump }] },
        ]}
      >
        {value}
      </Animated.Text>
    </DigitBox>
  );
}

function MatchClock({ match, size }) {
  const now = useNow(1000, match.status === "live" && match.clock.running);
  const text =
    match.status === "live"
      ? formatClock(clockSeconds(match, now))
      : match.status === "finished"
        ? "FIM"
        : match.time;
  return (
    <ClockBox>
      <ClockText style={{ fontSize: size }} accessibilityLabel={`Tempo de jogo ${text}`}>
        {text}
      </ClockText>
    </ClockBox>
  );
}

function TeamSide({ team, crest, label, winner }) {
  return (
    <TeamColumn>
      {winner ? (
        <Float kind="bob" duration={900} style={{ position: "absolute", top: -14, zIndex: 2 }}>
          <Text style={{ fontSize: 26, lineHeight: 32 }}>🏆</Text>
        </Float>
      ) : null}
      <TeamCrest team={team} size={crest} />
      <TeamLabel style={{ fontSize: label }}>{team.label}</TeamLabel>
      <TeamName numberOfLines={1}>{team.name}</TeamName>
    </TeamColumn>
  );
}

// Placar de estádio: lâmpadas, escudos das salas, números grandes que pulam a cada ponto e o relógio do jogo.
// big = versão gigante (tela do jogo e destaque do "Ao vivo"). Com onPress o placar inteiro vira um botão.
export default function Scoreboard({ match, big = false, onPress, style }) {
  const { isTablet } = useLayout();
  const sport = getSport(match.sport);
  const teamA = getTeam(match.teamA);
  const teamB = getTeam(match.teamB);
  const large = big && isTablet;
  const started = match.status !== "scheduled";
  const winner = match.status === "finished" ? winnerOf(match) : null;
  const live = match.status === "live";

  const sizes = large
    ? { crest: 112, label: 30, digit: 84, clock: 24 }
    : isTablet
      ? { crest: 84, label: 24, digit: 60, clock: 20 }
      : { crest: 62, label: 19, digit: 44, clock: 17 };

  const board = (
    <Frame
      colors={jesGradients.board}
      {...DIAGONAL}
      $compact={!isTablet}
      style={[shadow(16, 36, "rgba(0,0,0,0.55)"), style]}
    >
      <Bulbs>
        {Array.from({ length: BULBS }, (_, index) => (
          <Bulb key={index} $on={live ? index % 2 === 0 : index % 4 === 0} />
        ))}
      </Bulbs>

      <Header>
        <SportChip colors={sport.colors} {...DIAGONAL}>
          <Text style={{ fontSize: 15, lineHeight: 19 }}>{sport.emoji}</Text>
          <SportText>{sport.name.toUpperCase()}</SportText>
        </SportChip>
        <DivisionText numberOfLines={1}>{getDivision(match.division).label}</DivisionText>
        <StatusBadge match={match} />
        <MatchClock match={match} size={sizes.clock} />
      </Header>

      <Body>
        <TeamSide team={teamA} crest={sizes.crest} label={sizes.label} winner={winner === "A"} />
        <Digits style={{ marginTop: (sizes.crest - sizes.digit * 1.3) / 2 }}>
          {started ? (
            <>
              <ScoreDigit value={match.scoreA} size={sizes.digit} dim={winner === "B"} />
              <Separator style={{ fontSize: sizes.digit * 0.45 }}>x</Separator>
              <ScoreDigit value={match.scoreB} size={sizes.digit} dim={winner === "A"} />
            </>
          ) : (
            <Separator style={{ fontSize: sizes.digit * 0.6, lineHeight: sizes.digit * 1.3 }}>VS</Separator>
          )}
        </Digits>
        <TeamSide team={teamB} crest={sizes.crest} label={sizes.label} winner={winner === "B"} />
      </Body>

      <Footer>
        <FooterText>
          📍 {match.place} · 🕒 {dateLabel(match.date)}, {match.time}
        </FooterText>
        <FooterText>Placar em {sport.score.unit}</FooterText>
      </Footer>
    </Frame>
  );

  if (!onPress) return board;
  return (
    <Bouncy
      onPress={onPress}
      pressedScale={0.98}
      hoverScale={1.01}
      accessibilityLabel={`Abrir o placar de ${teamA.label} contra ${teamB.label}`}
    >
      {board}
    </Bouncy>
  );
}
