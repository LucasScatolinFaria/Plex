import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import ChipScroll from "../../../components/ChipScroll";
import Float from "../../../components/Float";
import JesScreen from "../../../components/JesScreen";
import MatchCard from "../../../components/MatchCard";
import Shine from "../../../components/Shine";
import { useJes } from "../../../contexts/jes";
import { SPORTS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import { shadow } from "../../../theme";
import { byKickoff, getDivision, getSport } from "../../../utils/jes";
import {
  Chip,
  ChipText,
  Empty,
  Grid,
  Kicker,
  PageHead,
  PageHint,
  PageTitle,
  SectionRow,
  SectionTitle,
} from "../style";
import {
  About,
  BigEmoji,
  Detail,
  Fact,
  FactLabel,
  FactText,
  Header,
  HeaderTop,
  Layout,
  Menu,
  MenuBadge,
  MenuItem,
  MenuLabel,
  MenuText,
  RuleCard,
  RuleEmoji,
  RuleGrid,
  RuleText,
  RuleTitle,
  SportName,
  Who,
  WhoChip,
} from "./style";

const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const GAP = 12;

// Esportes do JES Kids: o que é, como se joga (com as regras do jeito da escola), uma curiosidade
// e os próximos jogos de cada um.
export default function JesSports() {
  const navigation = useNavigation();
  const route = useRoute();
  const { matches } = useJes();
  const { width, isTablet, isWide } = useLayout();
  const [selected, setSelected] = useState(route.params?.sport || SPORTS[0].id);

  // o placar de um jogo abre esta tela já no esporte dele
  useEffect(() => {
    if (route.params?.sport) setSelected(route.params.sport);
  }, [route.params?.sport]);

  const sport = getSport(selected);
  const next = matches
    .filter((match) => match.sport === sport.id && match.status !== "finished")
    .sort(byKickoff)
    .slice(0, isWide ? 2 : 3);

  const detailWidth = isWide ? Math.min(width, 1120) - 32 - 260 - 18 : Math.min(width, 1120) - 32;
  const ruleColumns = isTablet ? 2 : 1;
  const ruleWidth = Math.floor((detailWidth - GAP * (ruleColumns - 1)) / ruleColumns);
  const cardColumns = isTablet ? 2 : 1;
  const cardWidth = Math.floor((detailWidth - 14 * (cardColumns - 1)) / cardColumns);

  const options = SPORTS.map((item) => ({ ...item, active: item.id === sport.id }));

  return (
    <JesScreen>
      <PageHead>
        <Kicker>JES KIDS 2026</Kicker>
        <PageTitle accessibilityRole="header" $compact={!isTablet}>
          Esportes do JES Kids 🏅
        </PageTitle>
        <PageHint>Conheça cada esporte e as regras do jeitinho que a gente joga na escola.</PageHint>
      </PageHead>

      {isWide ? null : (
        <ChipScroll style={{ marginTop: 16 }}>
          {options.map((item) => (
            <Bouncy
              key={item.id}
              onPress={() => setSelected(item.id)}
              accessibilityState={{ selected: item.active }}
              accessibilityLabel={item.name}
            >
              <Chip $selected={item.active}>
                <ChipText $selected={item.active}>
                  {item.emoji} {item.name}
                </ChipText>
              </Chip>
            </Bouncy>
          ))}
        </ChipScroll>
      )}

      <Layout $wide={isWide}>
        {isWide ? (
          <Menu>
            <MenuLabel>ESCOLHA O ESPORTE</MenuLabel>
            {options.map((item) => (
              <Bouncy
                key={item.id}
                onPress={() => setSelected(item.id)}
                hoverScale={1.02}
                accessibilityState={{ selected: item.active }}
                accessibilityLabel={item.name}
              >
                <MenuItem $selected={item.active}>
                  <MenuBadge colors={item.colors} {...DIAGONAL}>
                    <Text style={{ fontSize: 20, lineHeight: 26 }}>{item.emoji}</Text>
                  </MenuBadge>
                  <MenuText numberOfLines={1}>{item.name}</MenuText>
                </MenuItem>
              </Bouncy>
            ))}
          </Menu>
        ) : null}

        <Detail key={sport.id}>
          <Appear from="scale">
            <Header colors={sport.colors} {...DIAGONAL} style={shadow(12, 28, "rgba(0,0,0,0.4)")}>
              <Shine every={5000} />
              <HeaderTop>
                <Float kind="bob" duration={1200}>
                  <BigEmoji $compact={!isTablet}>{sport.emoji}</BigEmoji>
                </Float>
                <View style={{ flex: 1 }}>
                  <SportName $compact={!isTablet}>{sport.name}</SportName>
                  <Who>
                    {sport.divisions.map((id) => (
                      <WhoChip key={id}>
                        {getDivision(id).emoji} {getDivision(id).label}
                      </WhoChip>
                    ))}
                  </Who>
                </View>
              </HeaderTop>
              <About>{sport.about}</About>
            </Header>
          </Appear>

          <SectionRow>
            <SectionTitle accessibilityRole="header">📋 Como se joga</SectionTitle>
          </SectionRow>
          <RuleGrid>
            {sport.rules.map((rule, index) => (
              <Appear key={rule.title} delay={100 + index * 70} style={{ width: ruleWidth }}>
                <RuleCard style={{ borderLeftColor: sport.colors[1], minHeight: isTablet ? 118 : undefined }}>
                  <RuleEmoji>
                    <Text style={{ fontSize: 22, lineHeight: 28 }}>{rule.emoji}</Text>
                  </RuleEmoji>
                  <View style={{ flex: 1 }}>
                    <RuleTitle>{rule.title}</RuleTitle>
                    <RuleText>{rule.text}</RuleText>
                  </View>
                </RuleCard>
              </Appear>
            ))}
          </RuleGrid>

          {sport.fact ? (
            <Appear delay={400}>
              <Fact style={shadow(8, 20, "rgba(0,0,0,0.3)")}>
                <Float kind="pulse" duration={900}>
                  <Text style={{ fontSize: 34, lineHeight: 42 }}>💡</Text>
                </Float>
                <View style={{ flex: 1 }}>
                  <FactLabel>VOCÊ SABIA?</FactLabel>
                  <FactText>{sport.fact}</FactText>
                </View>
              </Fact>
            </Appear>
          ) : null}

          <SectionRow>
            <SectionTitle accessibilityRole="header">
              {sport.emoji} Próximos jogos de {sport.name.toLowerCase()}
            </SectionTitle>
          </SectionRow>
          {next.length > 0 ? (
            <Grid style={{ gap: 14 }}>
              {next.map((match) => (
                <View key={match.id} style={{ width: cardWidth }}>
                  <MatchCard match={match} onPress={() => navigation.navigate("JesMatch", { id: match.id })} />
                </View>
              ))}
            </Grid>
          ) : (
            <Empty>Nenhum jogo de {sport.name.toLowerCase()} marcado agora.</Empty>
          )}
        </Detail>
      </Layout>
    </JesScreen>
  );
}
