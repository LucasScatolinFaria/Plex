import { useMemo } from "react";
import { Text } from "react-native";

import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptTag } from "../../../components/RoundsGame";
import { getGame } from "../../../data/games";
import { pick, randomInt, shuffle } from "../../../utils/helpers";

const GAME = getGame("frutas");
const FRUITS = ["🍎", "🍌", "🍇", "🍓", "🍊"];
const MAX = { facil: 5, medio: 9, dificil: 15 }; // quantas frutas podem aparecer em cada nível

// 8 perguntas: cada uma tem a resposta certa e 4 alternativas
function buildRounds(level) {
  return Array.from({ length: 8 }, () => {
    const answer = randomInt(1, MAX[level]);
    const options = new Set([answer]);
    while (options.size < 4) options.add(Math.max(1, answer + randomInt(-3, 3)));
    return { fruit: pick(FRUITS), answer, options: shuffle([...options]) };
  });
}

function Board({ mode, finish, area }) {
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);

  return (
    <RoundsGame
      rounds={rounds}
      area={area}
      finish={finish}
      time={mode.id === "dificil" ? 8000 : undefined}
      renderPrompt={(round) => (
        <PromptCard>
          <PromptTag>Quantas frutas tem aqui?</PromptTag>
          <Text style={{ fontSize: 34, textAlign: "center" }}>{round.fruit.repeat(round.answer)}</Text>
        </PromptCard>
      )}
    />
  );
}

export default function Fruits() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
