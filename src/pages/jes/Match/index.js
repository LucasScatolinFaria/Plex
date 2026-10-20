import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import { useCelebration } from "../../../components/Celebration";
import { Header, IconCircle, Title, TitleWrap } from "../../../components/GameShell/style";
import Scoreboard from "../../../components/Scoreboard";
import Stadium from "../../../components/Stadium";
import TeamCrest from "../../../components/TeamCrest";
import Timeline from "../../../components/Timeline";
import { useJes } from "../../../contexts/jes";
import useLayout from "../../../hooks/useLayout";
import { colors } from "../../../theme";
import { getDivision, getSport, getTeam, standings } from "../../../utils/jes";
import { Empty, LinkButton, LinkText, Panel, SectionRow, SectionTitle } from "../style";
import { Columns, SideText, SideTitle, TeamInfo, TeamLabel, TeamRow, TeamStat, Toast } from "./style";

const NO_MATCHES = [];

// Placar de um jogo em tela cheia (dá para projetar no telão): placar gigante, lance a lance
// e como as duas salas estão no ranking. Atualiza sozinho e comemora cada ponto.
export default function JesMatch() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const { matches, bonuses, status } = useJes();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const match = matches.find((item) => item.id === route.params?.id);
  const watched = useMemo(() => (match ? [match] : NO_MATCHES), [match]);
  const party = useCelebration(watched);

  const sport = match ? getSport(match.sport) : null;
  const teamA = match ? getTeam(match.teamA) : null;
  const teamB = match ? getTeam(match.teamB) : null;
  const table = match ? standings(matches, match.division, null, bonuses) : [];

  // nome do jogo na aba do navegador
  useEffect(() => {
    if (teamA && teamB) navigation.setOptions({ title: `${teamA.label} x ${teamB.label}` });
  }, [navigation, teamA, teamB]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function leave() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Jes");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch (error) {}
  }

  function rankOf(team) {
    const row = table.find((item) => item.team.id === team.id);
    if (!row || (row.played === 0 && row.points === 0)) return "Ainda sem pontos";
    return `${row.position}º lugar · ${row.points} pts · ${row.wins} ${row.wins === 1 ? "vitória" : "vitórias"}`;
  }

  return (
    <Stadium>
      <Header style={{ paddingTop: insets.top + 10 }}>
        <Bouncy accessibilityLabel="Voltar" onPress={leave}>
          <IconCircle>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </IconCircle>
        </Bouncy>
        <TitleWrap>
          <Title numberOfLines={1}>{sport ? `${sport.emoji} ${sport.name}` : "Placar"}</Title>
        </TitleWrap>
        {Platform.OS === "web" ? (
          <Bouncy accessibilityLabel="Copiar o link deste placar" onPress={copyLink}>
            <IconCircle>
              <Ionicons name={copied ? "checkmark" : "link"} size={22} color={colors.white} />
            </IconCircle>
          </Bouncy>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <View style={{ width: "100%", maxWidth: 1000 }}>
          {match ? (
            <>
              <Appear from="scale">
                <Scoreboard match={match} big />
              </Appear>

              <Columns $wide={isWide}>
                <View style={{ width: isWide ? undefined : "100%", flex: isWide ? 3 : undefined }}>
                  <SectionRow>
                    <SectionTitle accessibilityRole="header">📣 Lance a lance</SectionTitle>
                  </SectionRow>
                  <Timeline match={match} />
                </View>

                <View style={{ width: isWide ? undefined : "100%", flex: isWide ? 2 : undefined }}>
                  <SectionRow>
                    <SectionTitle accessibilityRole="header">🏆 No ranking</SectionTitle>
                  </SectionRow>
                  <Panel>
                    <SideTitle>{getDivision(match.division).label}</SideTitle>
                    {[teamA, teamB].map((team) => (
                      <TeamRow key={team.id}>
                        <TeamCrest team={team} size={44} />
                        <TeamInfo>
                          <TeamLabel>
                            {team.label} {team.name}
                          </TeamLabel>
                          <TeamStat>{rankOf(team)}</TeamStat>
                        </TeamInfo>
                      </TeamRow>
                    ))}
                  </Panel>

                  <Panel style={{ marginTop: 14 }}>
                    <SideTitle>
                      {sport.emoji} Sobre o {sport.name.toLowerCase()}
                    </SideTitle>
                    <SideText>{sport.about}</SideText>
                    <Bouncy
                      onPress={() =>
                        navigation.navigate("Jes", { screen: "JesSports", params: { sport: sport.id } })
                      }
                      accessibilityLabel={`Ver as regras de ${sport.name}`}
                    >
                      <LinkButton>
                        <LinkText>Ver as regras</LinkText>
                        <Ionicons name="arrow-forward" size={16} color={colors.yellow} />
                      </LinkButton>
                    </Bouncy>
                  </Panel>
                </View>
              </Columns>
            </>
          ) : status === "loading" ? null : (
            <Empty style={{ marginTop: 30 }}>
              Não achamos esse jogo. Ele pode ter sido apagado pelo organizador. 🤔
            </Empty>
          )}
        </View>
      </ScrollView>

      {copied ? <Toast>Link copiado! Mande para a família torcer junto. 📲</Toast> : null}
      {party}
    </Stadium>
  );
}
