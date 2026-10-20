import { useState } from "react";
import { Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import StatusBadge from "../../../components/StatusBadge";
import TeamCrest from "../../../components/TeamCrest";
import Timeline from "../../../components/Timeline";
import { HIGHLIGHTS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import useNow from "../../../hooks/useNow";
import {
  addHighlight,
  addScore,
  deleteMatch,
  finishMatch,
  pauseMatch,
  resumeMatch,
  startMatch,
  undoScore,
} from "../../../services/jes";
import { colors } from "../../../theme";
import { clockSeconds, dateLabel, formatClock, getDivision, getSport, getTeam } from "../../../utils/jes";
import {
  BigScore,
  ClockText,
  ConfirmText,
  ControlCard,
  ControlFoot,
  ControlHead,
  DayText,
  HeadText,
  HighlightButton,
  Highlights,
  RowActions,
  RowCard,
  RowInfo,
  RowMain,
  RowScore,
  RowSport,
  RowTeam,
  RowTeams,
  SideName,
  SidePanel,
  Sides,
  SmallIcon,
  Steps,
  SubLabel,
  TimeBox,
  TimeText,
} from "./style";

// Mesa de controle de um jogo ao vivo: botões de ponto para cada sala, desfazer, lances especiais,
// pausar o relógio e encerrar. Tudo que muda aqui aparece na hora no placar de todo mundo.
// run(ação) mostra o erro no painel se o banco recusar.
export function LiveControl({ match, run, onOpen }) {
  const [ending, setEnding] = useState(false);
  const now = useNow(1000, match.clock.running);
  const sport = getSport(match.sport);
  const teams = { A: getTeam(match.teamA), B: getTeam(match.teamB) };
  const many = sport.score.steps.length > 1;

  return (
    <ControlCard>
      <ControlHead>
        <HeadText numberOfLines={1}>
          {sport.emoji} {sport.name} · {getDivision(match.division).short}
        </HeadText>
        <StatusBadge match={match} size="sm" />
        <ClockText accessibilityLabel={`Tempo de jogo ${formatClock(clockSeconds(match, now))}`}>
          ⏱ {formatClock(clockSeconds(match, now))}
        </ClockText>
        <Button
          title={match.clock.running ? "Pausar" : "Continuar"}
          icon={match.clock.running ? "pause" : "play"}
          tone="ghost"
          size="sm"
          onPress={() => run(() => (match.clock.running ? pauseMatch(match) : resumeMatch(match)))}
        />
      </ControlHead>

      <Sides>
        {["A", "B"].map((side) => {
          const team = teams[side];
          const score = match[`score${side}`];
          return (
            <SidePanel key={side}>
              <TeamCrest team={team} size={54} label />
              <SideName numberOfLines={1}>{team.name}</SideName>
              <BigScore accessibilityLabel={`${team.label}: ${score} ${sport.score.unit}`}>{score}</BigScore>
              <Steps>
                {sport.score.steps.map((points) => (
                  <Button
                    key={points}
                    title={`+${points}`}
                    tone="green"
                    size={many ? "sm" : "md"}
                    sound="pop"
                    onPress={() => run(() => addScore(match, side, points))}
                  />
                ))}
              </Steps>
              <Button
                title="Desfazer"
                icon="arrow-undo"
                tone="ghost"
                size="sm"
                disabled={score === 0}
                onPress={() => run(() => undoScore(match, side))}
              />
              <Highlights>
                {HIGHLIGHTS.map((highlight) => (
                  <Bouncy
                    key={highlight.id}
                    onPress={() => run(() => addHighlight(match, side, highlight.id))}
                    accessibilityLabel={`${highlight.label} do ${team.label}`}
                  >
                    <HighlightButton>
                      <Text style={{ fontSize: 20, lineHeight: 26 }}>{highlight.emoji}</Text>
                    </HighlightButton>
                  </Bouncy>
                ))}
              </Highlights>
            </SidePanel>
          );
        })}
      </Sides>

      <SubLabel>Últimos lances</SubLabel>
      <Timeline match={match} limit={3} />

      <ControlFoot>
        {ending ? (
          <>
            <ConfirmText>
              Encerrar com {teams.A.label} {match.scoreA} x {match.scoreB} {teams.B.label}?
            </ConfirmText>
            <Button title="Ainda não" tone="soft" size="sm" onPress={() => setEnding(false)} />
            <Button
              title="Sim, encerrar"
              icon="flag"
              tone="red"
              size="sm"
              sound="win"
              onPress={() => {
                setEnding(false);
                run(() => finishMatch(match));
              }}
            />
          </>
        ) : (
          <>
            <Button title="Ver placar" icon="tv" tone="ghost" size="sm" onPress={onOpen} />
            <Button title="Encerrar jogo" icon="flag" tone="red" size="sm" onPress={() => setEnding(true)} />
          </>
        )}
      </ControlFoot>
    </ControlCard>
  );
}

// Linha de um jogo que ainda vai começar (começar, mudar, apagar) ou que já acabou (reabrir, apagar).
export function MatchRow({ match, run, onEdit }) {
  const { isTablet } = useLayout();
  const [confirming, setConfirming] = useState(false);
  const sport = getSport(match.sport);
  const teamA = getTeam(match.teamA);
  const teamB = getTeam(match.teamB);
  const finished = match.status === "finished";

  return (
    <RowCard $wide={isTablet}>
      <RowMain $wide={isTablet}>
        <TimeBox>
          <TimeText>{match.time}</TimeText>
          <DayText>{dateLabel(match.date)}</DayText>
        </TimeBox>
        <RowInfo>
          <RowSport numberOfLines={1}>
            {sport.emoji} {sport.name} · {getDivision(match.division).short} · 📍 {match.place}
          </RowSport>
          <RowTeams>
            <TeamCrest team={teamA} size={26} />
            <RowTeam>{teamA.label}</RowTeam>
            {finished ? (
              <RowScore>
                {match.scoreA} x {match.scoreB}
              </RowScore>
            ) : (
              <RowTeam>x</RowTeam>
            )}
            <RowTeam>{teamB.label}</RowTeam>
            <TeamCrest team={teamB} size={26} />
          </RowTeams>
        </RowInfo>
      </RowMain>

      <RowActions>
        {confirming ? (
          <>
            <ConfirmText style={{ flex: 0, minWidth: 0 }}>Apagar este jogo?</ConfirmText>
            <Button title="Não" tone="soft" size="sm" onPress={() => setConfirming(false)} />
            <Button
              title="Apagar"
              icon="trash"
              tone="red"
              size="sm"
              onPress={() => {
                setConfirming(false);
                run(() => deleteMatch(match.id));
              }}
            />
          </>
        ) : (
          <>
            {finished ? (
              <Button
                title="Reabrir"
                icon="refresh"
                tone="ghost"
                size="sm"
                onPress={() => run(() => startMatch(match))}
              />
            ) : (
              <>
                <Button
                  title="Começar"
                  icon="play"
                  tone="green"
                  size="sm"
                  onPress={() => run(() => startMatch(match))}
                />
                <Bouncy onPress={onEdit} accessibilityLabel="Mudar este jogo">
                  <SmallIcon>
                    <Ionicons name="create-outline" size={20} color={colors.white} />
                  </SmallIcon>
                </Bouncy>
              </>
            )}
            <Bouncy onPress={() => setConfirming(true)} accessibilityLabel="Apagar este jogo">
              <SmallIcon>
                <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
              </SmallIcon>
            </Bouncy>
          </>
        )}
      </RowActions>
    </RowCard>
  );
}
