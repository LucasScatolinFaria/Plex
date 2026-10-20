import { useMemo, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import ChipScroll from "../../../components/ChipScroll";
import JesScreen from "../../../components/JesScreen";
import MatchCard from "../../../components/MatchCard";
import TeamCrest from "../../../components/TeamCrest";
import { useJes } from "../../../contexts/jes";
import { DIVISIONS, SPORTS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import { allTeams, byKickoff, dateLabel, getTeam, shortDate, teamsOf } from "../../../utils/jes";
import { dayKey } from "../../../utils/progress";
import { Chip, ChipText, Empty, Grid, Kicker, PageHead, PageHint, PageTitle, Panel } from "../style";
import { DayCount, DayDate, DayHeader, DayTitle, FilterLabel } from "./style";

const GAP = 14;

const STATUSES = [
  { id: "all", label: "Todos" },
  { id: "live", label: "🔴 Ao vivo" },
  { id: "scheduled", label: "⏳ Em breve" },
  { id: "finished", label: "✅ Encerrados" },
];

function FilterChip({ selected, onPress, label, children }) {
  return (
    <Bouncy onPress={onPress} accessibilityLabel={`Filtrar: ${label}`} accessibilityState={{ selected }}>
      <Chip $selected={selected}>
        {children}
        <ChipText $selected={selected}>{label}</ChipText>
      </Chip>
    </Bouncy>
  );
}

// Tabela de jogos: todos os jogos, separados por dia (hoje e os próximos primeiro, depois os que já passaram),
// com filtros de situação, anos, esporte e sala.
export default function JesSchedule() {
  const navigation = useNavigation();
  const { matches } = useJes();
  const { width, isTablet, isWide } = useLayout();
  const [status, setStatus] = useState("all");
  const [division, setDivision] = useState("all");
  const [sport, setSport] = useState("all");
  const [team, setTeam] = useState("all");

  const today = dayKey();
  const days = useMemo(() => {
    const shown = matches
      .filter(
        (match) =>
          (status === "all" || match.status === status) &&
          (division === "all" || match.division === division) &&
          (sport === "all" || match.sport === sport) &&
          (team === "all" || match.teamA === team || match.teamB === team)
      )
      .sort(byKickoff);
    const byDay = {};
    shown.forEach((match) => {
      byDay[match.date] = [...(byDay[match.date] || []), match];
    });
    const dates = Object.keys(byDay).sort();
    const coming = dates.filter((date) => date >= today);
    const past = dates.filter((date) => date < today).reverse();
    return [...coming, ...past].map((date) => ({ date, matches: byDay[date] }));
  }, [matches, status, division, sport, team, today]);

  const teams = division === "all" ? allTeams() : teamsOf(division);
  const sports = division === "all" ? SPORTS : SPORTS.filter((item) => item.divisions.includes(division));

  function pickDivision(id) {
    setDivision(id);
    // a sala e o esporte escolhidos podem não existir na dupla de anos nova
    if (team !== "all" && id !== "all" && getTeam(team).division !== id) setTeam("all");
    if (sport !== "all" && id !== "all" && !SPORTS.find((item) => item.id === sport)?.divisions.includes(id)) {
      setSport("all");
    }
  }

  const columns = isWide ? 3 : isTablet ? 2 : 1;
  const contentWidth = Math.min(width, 1120) - 32;
  const cardWidth = Math.floor((contentWidth - GAP * (columns - 1)) / columns);

  return (
    <JesScreen>
      <PageHead>
        <Kicker>JES KIDS 2026</Kicker>
        <PageTitle accessibilityRole="header" $compact={!isTablet}>
          Tabela de jogos 📅
        </PageTitle>
        <PageHint>
          Todos os jogos, horários e lugares. Toque num jogo para ver o placar e o lance a lance.
        </PageHint>
      </PageHead>

      <Panel style={{ marginTop: 16, paddingTop: 4 }}>
        <FilterLabel>SITUAÇÃO</FilterLabel>
        <ChipScroll>
          {STATUSES.map((item) => (
            <FilterChip
              key={item.id}
              label={item.label}
              selected={status === item.id}
              onPress={() => setStatus(item.id)}
            />
          ))}
        </ChipScroll>

        <FilterLabel>ANOS</FilterLabel>
        <ChipScroll>
          <FilterChip label="Todos os anos" selected={division === "all"} onPress={() => pickDivision("all")} />
          {DIVISIONS.map((item) => (
            <FilterChip
              key={item.id}
              label={`${item.emoji} ${item.label}`}
              selected={division === item.id}
              onPress={() => pickDivision(item.id)}
            />
          ))}
        </ChipScroll>

        <FilterLabel>ESPORTE</FilterLabel>
        <ChipScroll>
          <FilterChip label="Todos" selected={sport === "all"} onPress={() => setSport("all")} />
          {sports.map((item) => (
            <FilterChip
              key={item.id}
              label={`${item.emoji} ${item.name}`}
              selected={sport === item.id}
              onPress={() => setSport(item.id)}
            />
          ))}
        </ChipScroll>

        <FilterLabel>MINHA SALA</FilterLabel>
        <ChipScroll>
          <FilterChip label="Todas" selected={team === "all"} onPress={() => setTeam("all")} />
          {teams.map((item) => (
            <FilterChip
              key={item.id}
              label={`${item.label} ${item.name}`}
              selected={team === item.id}
              onPress={() => setTeam(item.id)}
            >
              <TeamCrest team={item} size={24} />
            </FilterChip>
          ))}
        </ChipScroll>
      </Panel>

      {days.length === 0 ? (
        <Empty style={{ marginTop: 20 }}>Nenhum jogo com esses filtros. Tente outra combinação! 🔍</Empty>
      ) : null}

      {days.map((day) => (
        <View key={day.date}>
          <DayHeader>
            <DayTitle $today={day.date === today}>{dateLabel(day.date)}</DayTitle>
            {["Hoje", "Amanhã", "Ontem"].includes(dateLabel(day.date)) ? (
              <DayDate>{shortDate(day.date)}</DayDate>
            ) : null}
            <DayCount>
              {day.matches.length} {day.matches.length === 1 ? "jogo" : "jogos"}
            </DayCount>
          </DayHeader>
          <Grid style={{ gap: GAP }}>
            {day.matches.map((match, index) => (
              <Appear key={match.id} delay={Math.min(index, 8) * 50} style={{ width: cardWidth }}>
                <MatchCard
                  match={match}
                  showDate={false}
                  onPress={() => navigation.navigate("JesMatch", { id: match.id })}
                />
              </Appear>
            ))}
          </Grid>
        </View>
      ))}
    </JesScreen>
  );
}
