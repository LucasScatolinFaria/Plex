import { useContext, useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../components/Appear";
import Avatar from "../../components/Avatar";
import Bouncy from "../../components/Bouncy";
import Float from "../../components/Float";
import Mascot from "../../components/Mascot";
import ProgressBar from "../../components/ProgressBar";
import Screen from "../../components/Screen";
import Shine from "../../components/Shine";
import TypeText from "../../components/TypeText";
import { AuthContext } from "../../contexts/auth";
import { ProgressContext } from "../../contexts/progress";
import { CATEGORIES, GAMES, maxStars } from "../../data/games";
import useLayout from "../../hooks/useLayout";
import { colors, fonts, gradients, shadow } from "../../theme";
import { firstName } from "../../utils/helpers";
import { currentStreak, gameStars, levelInfo, playsOf, totalStars } from "../../utils/progress";
import {
  Bubble,
  CardCategory,
  CardEmoji,
  CardFooter,
  CardGlow,
  CardTitle,
  CategoryChip,
  CategoryText,
  Chip,
  Footer,
  GameCardBox,
  Greeting,
  Grid,
  HeaderRow,
  Hello,
  HeroBody,
  HeroCard,
  HeroCta,
  HeroCtaText,
  HeroEmoji,
  LevelBadge,
  LevelCard,
  LevelInfo,
  LevelLine,
  LevelName,
  LevelNumber,
  LevelTitle,
  LevelXp,
  NewBadge,
  NewBadgeText,
  PlayCircle,
  SectionTitle,
  StarsPill,
  StarsText,
  TopRow,
} from "./style";

const GAP = 14;
const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

// O Bip sugere primeiro o que ainda não foi jogado; depois, o jogo com menos estrelas.
function suggestGame(progress) {
  const unplayed = GAMES.find((game) => playsOf(progress, game.id) === 0);
  if (unplayed) {
    const text =
      progress.plays === 0
        ? `Oi! Eu sou o Bip. Vamos começar pelo ${unplayed.title}?`
        : `Você ainda não jogou ${unplayed.title}. Bora experimentar?`;
    return { game: unplayed, text };
  }
  const ratio = (game) => gameStars(progress, game) / maxStars(game);
  const weakest = [...GAMES].sort((a, b) => ratio(a) - ratio(b))[0];
  return { game: weakest, text: `Que tal buscar mais estrelas em ${weakest.title}?` };
}

// No computador, com o mouse em cima o cartão sobe, a sombra cresce, o emoji dá um pulinho e o
// botão de jogar aumenta (transições de CSS, com um leve exagero no fim para parecer elástico).
const HOVER_EASE =
  Platform.OS === "web"
    ? {
        transitionProperty: "transform, box-shadow",
        transitionDuration: "320ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }
    : null;

function GameCard({ game, index, width, stars, isNew, onPress }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Appear delay={150 + index * 70} style={{ width }}>
      <Bouncy
        onPress={onPress}
        onHoverChange={setHovered}
        hoverScale={1.02}
        accessibilityLabel={`Jogar ${game.title}`}
      >
        <GameCardBox
          colors={game.colors}
          {...DIAGONAL}
          style={[
            HOVER_EASE,
            hovered
              ? [shadow(20, 34, "rgba(10,3,40,0.55)"), { transform: [{ translateY: -6 }] }]
              : shadow(10, 22, "rgba(10,3,40,0.45)"),
          ]}
        >
          <CardGlow style={[HOVER_EASE, hovered ? { transform: [{ scale: 1.4 }] } : null]} />
          {isNew ? (
            <NewBadge kind="pulse" duration={900}>
              <NewBadgeText>NOVO</NewBadgeText>
            </NewBadge>
          ) : null}
          <Float kind="bob" duration={1400 + index * 120} delay={index * 80} style={{ alignSelf: "flex-start" }}>
            <CardEmoji style={[HOVER_EASE, hovered ? { transform: [{ scale: 1.2 }, { rotate: "-10deg" }] } : null]}>
              {game.emoji}
            </CardEmoji>
          </Float>
          <CardTitle $color={game.text} numberOfLines={2}>
            {game.title}
          </CardTitle>
          <CardCategory $color={game.text}>{game.category}</CardCategory>
          <CardFooter>
            <StarsPill>
              <Ionicons name="star" size={14} color={colors.yellow} />
              <StarsText>
                {stars}/{maxStars(game)}
              </StarsText>
            </StarsPill>
            <PlayCircle style={[HOVER_EASE, hovered ? { transform: [{ scale: 1.18 }] } : null]}>
              <Ionicons name="play" size={18} color={game.colors[1]} />
            </PlayCircle>
          </CardFooter>
        </GameCardBox>
      </Bouncy>
    </Appear>
  );
}

export default function Home() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { progress } = useContext(ProgressContext);
  const { width, isTablet, isWide } = useLayout();
  const [category, setCategory] = useState(CATEGORIES[0]);

  const level = levelInfo(progress.xp);
  const featured = useMemo(() => suggestGame(progress), [progress]);
  const games = category === CATEGORIES[0] ? GAMES : GAMES.filter((game) => game.category === category);

  const columns = isWide ? 4 : isTablet ? 3 : 2;
  const contentWidth = Math.min(width, 1120) - 32;
  const cardWidth = Math.floor((contentWidth - GAP * (columns - 1)) / columns);

  return (
    <Screen>
      <Appear from="top">
        <HeaderRow>
          <Avatar id={user?.avatar} size={54} />
          <Greeting>
            <Hello numberOfLines={1} $compact={!isTablet}>
              Olá, {firstName(user?.name)}!{isTablet ? " 👋" : ""}
            </Hello>
            <LevelTitle>{level.title}</LevelTitle>
          </Greeting>
          <Chip accessibilityLabel={`Sequência de ${currentStreak(progress)} dias`}>🔥 {currentStreak(progress)}</Chip>
          <Chip accessibilityLabel={`${totalStars(progress)} estrelas`}>⭐ {totalStars(progress)}</Chip>
        </HeaderRow>
      </Appear>

      <TopRow $wide={isWide}>
        <Appear delay={80} style={{ flex: isWide ? 2 : undefined }}>
          <Bouncy
            onPress={() => navigation.navigate(featured.game.route)}
            pressedScale={0.97}
            hoverScale={1.015}
            accessibilityLabel={`Jogar ${featured.game.title}`}
          >
            <HeroCard colors={featured.game.colors} {...DIAGONAL} style={shadow(12, 28, "rgba(10,3,40,0.45)")}>
              <HeroEmoji>{featured.game.emoji}</HeroEmoji>
              <Shine every={3600} />
              <Mascot size={isTablet ? 104 : 78} />
              <HeroBody>
                <Bubble>
                  <TypeText
                    text={featured.text}
                    style={{ fontFamily: fonts.heading, fontSize: 16, lineHeight: 21, color: colors.ink }}
                  />
                </Bubble>
                <HeroCta>
                  <Ionicons name="play" size={16} color={colors.yellow} />
                  <HeroCtaText>Jogar agora</HeroCtaText>
                </HeroCta>
              </HeroBody>
            </HeroCard>
          </Bouncy>
        </Appear>

        <Appear delay={40} style={{ flex: isWide ? 1 : undefined }}>
          <LevelCard style={{ flex: isWide ? 1 : undefined }}>
            <LevelBadge colors={gradients.gold}>
              <LevelNumber>{level.level}</LevelNumber>
            </LevelBadge>
            <LevelInfo>
              <LevelLine>
                <LevelName>Nível {level.level}</LevelName>
                <LevelXp>
                  {level.current}/{level.need} XP
                </LevelXp>
              </LevelLine>
              <ProgressBar value={level.ratio} />
            </LevelInfo>
          </LevelCard>
        </Appear>
      </TopRow>

      <SectionTitle accessibilityRole="header">Escolha um jogo</SectionTitle>
      <View style={{ marginHorizontal: -16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}
        >
          {CATEGORIES.map((item) => (
            <Bouncy
              key={item}
              onPress={() => setCategory(item)}
              accessibilityLabel={`Filtrar: ${item}`}
              accessibilityState={{ selected: item === category }}
            >
              <CategoryChip $selected={item === category}>
                <CategoryText $selected={item === category}>{item}</CategoryText>
              </CategoryChip>
            </Bouncy>
          ))}
        </ScrollView>
      </View>

      <Grid style={{ gap: GAP }}>
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={index}
            width={cardWidth}
            stars={gameStars(progress, game)}
            isNew={playsOf(progress, game.id) === 0}
            onPress={() => navigation.navigate(game.route)}
          />
        ))}
      </Grid>

      <Footer>SESI Kids · Aprender brincando 💜</Footer>
    </Screen>
  );
}
