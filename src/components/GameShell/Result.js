import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import Appear from "../Appear";
import Button from "../Button";
import Confetti from "../Confetti";
import CountUp from "../CountUp";
import Mascot from "../Mascot";
import ProgressBar from "../ProgressBar";
import StarRow from "../StarRow";
import { fx } from "../../services/feedback";
import { colors, fonts, shadow } from "../../theme";
import {
  ActionRow,
  Actions,
  Card,
  CardText,
  CardTitle,
  LevelUpText,
  MascotSlot,
  Overlay,
  RecordBadge,
  ScoreBox,
  ScoreLabel,
  Stat,
  StatLabel,
  StatValue,
  Stats,
  Unlocked,
  UnlockedEmoji,
  UnlockedLabel,
  UnlockedTitle,
  XpBox,
  XpGain,
  XpLevel,
  XpRow,
} from "./style";

const HEADLINES = ["Quase lá!", "Boa!", "Muito bem!", "Incrível!"];

// Tela de fim de partida: estrelas, pontos, XP e conquistas novas.
export default function Result({ game, outcome, onReplay, onChangeMode, onLeave }) {
  const { result, summary } = outcome;
  const stars = result.casual ? 0 : result.stars;
  const good = result.casual || stars > 0;
  const leveledUp = summary.after.level > summary.before.level;
  // a barra começa de onde estava (ou do zero, se subiu de nível) e enche até o valor novo
  const [xpRatio, setXpRatio] = useState(leveledUp ? 0 : summary.before.ratio);

  useEffect(() => {
    fx(good ? "win" : "lose");
    const fill = setTimeout(() => setXpRatio(summary.after.ratio), 900);
    const cheer = leveledUp ? setTimeout(() => fx("levelup"), 2000) : null;
    return () => {
      clearTimeout(fill);
      clearTimeout(cheer);
    };
  }, [good, leveledUp, summary.after.ratio]);

  return (
    <Overlay>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingTop: 96,
          paddingBottom: 32,
        }}
      >
        <Appear from="scale" style={{ width: "100%", maxWidth: 440 }}>
          <Card style={shadow(16, 40)}>
            <MascotSlot>
              <Mascot size={84} mood={good ? "excited" : "sad"} />
            </MascotSlot>

            <CardTitle>{result.headline || HEADLINES[stars]}</CardTitle>
            {result.message ? <CardText>{result.message}</CardText> : null}

            {result.casual ? null : (
              <>
                <StarRow count={stars} size={50} animated style={{ marginTop: 12 }} />
                <ScoreBox>
                  <ScoreLabel>Pontos</ScoreLabel>
                  <CountUp
                    to={result.score}
                    delay={300}
                    style={{ fontFamily: fonts.title, fontSize: 44, lineHeight: 50, color: game.colors[1] }}
                  />
                  {summary.newRecord ? <RecordBadge>🏆 Novo recorde!</RecordBadge> : null}
                </ScoreBox>
              </>
            )}

            {result.stats ? (
              <Stats>
                {result.stats.map((stat) => (
                  <Stat key={stat.label}>
                    <StatValue>{stat.value}</StatValue>
                    <StatLabel>{stat.label}</StatLabel>
                  </Stat>
                ))}
              </Stats>
            ) : null}

            <XpBox>
              <XpRow>
                <XpGain>+{summary.xpGained} XP</XpGain>
                <XpLevel>Nível {summary.after.level}</XpLevel>
              </XpRow>
              <ProgressBar value={xpRatio} height={12} color={colors.yellow} />
              {leveledUp ? <LevelUpText>Subiu de nível! Agora você é {summary.after.title}.</LevelUpText> : null}
            </XpBox>

            {summary.unlocked.map((achievement, index) => (
              <Appear key={achievement.id} delay={1200 + index * 250} style={{ alignSelf: "stretch" }}>
                <Unlocked>
                  <UnlockedEmoji>{achievement.emoji}</UnlockedEmoji>
                  <View style={{ flex: 1 }}>
                    <UnlockedLabel>Nova conquista!</UnlockedLabel>
                    <UnlockedTitle>{achievement.title}</UnlockedTitle>
                  </View>
                </Unlocked>
              </Appear>
            ))}

            <Actions>
              <Button title="Jogar de novo" icon="refresh" size="lg" full onPress={onReplay} />
              <ActionRow>
                <Button
                  title={game.modeLabel ? "Trocar modo" : "Trocar nível"}
                  icon="options"
                  tone="soft"
                  size="sm"
                  onPress={onChangeMode}
                />
                <Button title="Sair" icon="home" tone="soft" size="sm" onPress={onLeave} />
              </ActionRow>
            </Actions>
          </Card>
        </Appear>
      </ScrollView>
      {good ? <Confetti /> : null}
    </Overlay>
  );
}
