import { useCallback, useContext, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import Background from "../Background";
import Bouncy from "../Bouncy";
import { ProgressContext } from "../../contexts/progress";
import { SettingsContext } from "../../contexts/settings";
import { colors } from "../../theme";
import Intro from "./Intro";
import Result from "./Result";
import { Header, IconCircle, Root, Stage, Title, TitleEmoji, TitleWrap } from "./style";

const MAX_BOARD_WIDTH = 720;

// Moldura comum de todos os jogos. Cuida do início, do fim e de salvar o resultado.
// O jogo é passado como função: {({ mode, finish, area }) => <Tabuleiro ... />}
//   mode   → modo escolhido (um item de game.modes)
//   finish → chame com { score, stars, message, stats, detail } quando a partida acabar
//   area   → { width, height } disponível para desenhar o tabuleiro
//            (no máximo 720 de largura; o jogo pode pedir mais com "boardWidth" em data/games.js)
export default function GameShell({ game, children }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { progress, registerResult } = useContext(ProgressContext);
  const { sound, toggleSetting } = useContext(SettingsContext);

  const [phase, setPhase] = useState("intro"); // intro → playing → result
  const [modeId, setModeId] = useState(game.modes[0].id);
  const [run, setRun] = useState(0);
  const [area, setArea] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const finished = useRef(false);

  const mode = game.modes.find((item) => item.id === modeId);

  function start() {
    finished.current = false;
    setOutcome(null);
    setRun((current) => current + 1); // muda a key: o tabuleiro é recriado do zero
    setPhase("playing");
  }

  const finish = useCallback(
    (result) => {
      if (finished.current) return;
      finished.current = true;
      const complete = { ...result, casual: !!mode.casual };
      setOutcome({ result: complete, summary: registerResult(game.id, mode.id, complete) });
      setPhase("result");
    },
    [game.id, mode, registerResult]
  );

  function leave() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("Tabs");
  }

  function handleLayout(event) {
    const { width, height } = event.nativeEvent.layout;
    setArea({
      width: Math.min(width, game.boardWidth || MAX_BOARD_WIDTH) - 24,
      height: height - insets.bottom - 12,
    });
  }

  const inIntro = phase === "intro";

  return (
    <Root>
      <Background colors={game.bg} calm>
        <Header style={{ paddingTop: insets.top + 10 }}>
          <Bouncy
            accessibilityLabel={inIntro ? "Voltar" : "Sair da partida"}
            onPress={inIntro ? leave : () => setPhase("intro")}
          >
            <IconCircle>
              <Ionicons name={inIntro ? "arrow-back" : "close"} size={24} color={colors.white} />
            </IconCircle>
          </Bouncy>

          <TitleWrap>
            <TitleEmoji>{game.emoji}</TitleEmoji>
            <Title numberOfLines={1} $compact={width < 420}>
              {game.title}
            </Title>
          </TitleWrap>

          <Bouncy
            accessibilityLabel={sound ? "Desligar o som" : "Ligar o som"}
            sound={null}
            onPress={() => toggleSetting("sound")}
          >
            <IconCircle>
              <Ionicons name={sound ? "volume-high" : "volume-mute"} size={22} color={colors.white} />
            </IconCircle>
          </Bouncy>
        </Header>

        <Stage onLayout={handleLayout}>
          {inIntro ? (
            <Intro game={game} mode={mode} progress={progress} onSelectMode={setModeId} onStart={start} />
          ) : area ? (
            <View key={run} style={{ width: area.width, height: area.height }}>
              {children({ mode, finish, area })}
            </View>
          ) : null}
        </Stage>

        {phase === "result" && outcome ? (
          <Result
            game={game}
            outcome={outcome}
            onReplay={start}
            onChangeMode={() => setPhase("intro")}
            onLeave={leave}
          />
        ) : null}
      </Background>
    </Root>
  );
}
