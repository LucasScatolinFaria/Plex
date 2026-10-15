import { Animated, ScrollView } from "react-native";

import Appear from "../Appear";
import Bouncy from "../Bouncy";
import Button from "../Button";
import StarRow from "../StarRow";
import useLoop from "../../hooks/useLoop";
import { shadow } from "../../theme";
import { bestOf, bestStars } from "../../utils/progress";
import {
  BestText,
  BigEmoji,
  Card,
  CardText,
  CardTitle,
  IconBubble,
  ModeChip,
  ModeEmoji,
  ModeLabel,
  Modes,
  SectionLabel,
  Step,
  StepNumber,
  StepText,
  Steps,
} from "./style";

function bestMessage(mode, best) {
  if (mode.casual) return "Chame um amigo! Este modo não vale estrelas.";
  if (!best) return "Você ainda não jogou este modo.";
  return `🏆 Seu recorde: ${best.score} pontos`;
}

// Tela que aparece antes da partida: como jogar, escolha do modo e botão de começar.
export default function Intro({ game, mode, progress, onSelectMode, onStart }) {
  const bob = useLoop(1300);
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [3, -5] });
  const accent = game.colors[1];

  return (
    <ScrollView
      style={{ alignSelf: "stretch" }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingTop: 64,
        paddingBottom: 32,
      }}
    >
      <Appear from="scale" style={{ width: "100%", maxWidth: 520 }}>
        <Card style={shadow(16, 40)}>
          <IconBubble colors={game.colors}>
            <Animated.View style={{ transform: [{ translateY }] }}>
              <BigEmoji>{game.emoji}</BigEmoji>
            </Animated.View>
          </IconBubble>

          <CardTitle>{game.title}</CardTitle>
          <CardText>{game.description}</CardText>

          <Steps>
            {game.howTo.map((step, index) => (
              <Step key={step}>
                <StepNumber $color={accent}>{index + 1}</StepNumber>
                <StepText>{step}</StepText>
              </Step>
            ))}
          </Steps>

          <SectionLabel>{game.modeLabel || "Escolha o nível"}</SectionLabel>
          <Modes>
            {game.modes.map((item) => (
              <Bouncy
                key={item.id}
                onPress={() => onSelectMode(item.id)}
                accessibilityLabel={item.label}
                accessibilityState={{ selected: item.id === mode.id }}
                style={{ flexGrow: 1 }}
              >
                <ModeChip $selected={item.id === mode.id} $color={accent}>
                  <ModeEmoji>{item.emoji}</ModeEmoji>
                  <ModeLabel>{item.label}</ModeLabel>
                  {item.casual ? null : (
                    <StarRow count={bestStars(progress, game.id, item.id)} size={15} style={{ marginTop: 3 }} />
                  )}
                </ModeChip>
              </Bouncy>
            ))}
          </Modes>

          <BestText>{bestMessage(mode, bestOf(progress, game.id, mode.id))}</BestText>

          <Button title="Jogar!" icon="play" size="lg" full onPress={onStart} />
        </Card>
      </Appear>
    </ScrollView>
  );
}
