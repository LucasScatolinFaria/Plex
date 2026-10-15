import { useMemo } from "react";
import { Text } from "react-native";

import GameShell from "../../../components/GameShell";
import RoundsGame, { PromptCard, PromptNote, PromptTag, PromptTitle } from "../../../components/RoundsGame";
import { getGame } from "../../../data/games";
import { BINS, BINS_BY_LEVEL, TRASH } from "../../../data/recycling";
import { colors, fonts, shadow } from "../../../theme";
import { sample } from "../../../utils/helpers";

const GAME = getGame("reciclagem");
const TOTAL = 10;
const TIME = { facil: null, medio: 12000, dificil: 9000 };

function buildRounds(level) {
  const bins = BINS_BY_LEVEL[level];
  const items = TRASH.filter((item) => bins.includes(item.bin));
  return sample(items, TOTAL).map((item) => ({ item, answer: item.bin, options: bins }));
}

function Board({ mode, finish, area }) {
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const bins = BINS_BY_LEVEL[mode.id];

  return (
    <RoundsGame
      rounds={rounds}
      time={TIME[mode.id]}
      area={area}
      finish={finish}
      columns={bins.length > 4 ? 3 : 2}
      unit="Item"
      tones={(bin) => BINS[bin]}
      optionLabel={(bin) => BINS[bin].label}
      describe={(correct, total) => `Você separou ${correct} de ${total} itens na lixeira certa.`}
      renderOption={(bin, { height }) => (
        <>
          <Text allowFontScaling={false} style={{ fontSize: height * 0.34, lineHeight: height * 0.44 }}>
            {BINS[bin].emoji}
          </Text>
          <Text allowFontScaling={false} style={{ fontFamily: fonts.title, fontSize: 16, color: colors.white }}>
            {BINS[bin].label}
          </Text>
        </>
      )}
      renderPrompt={(round, { answered, right }) => (
        <PromptCard style={shadow(10, 24)}>
          <PromptTag>Em qual lixeira vai?</PromptTag>
          <Text allowFontScaling={false} style={{ fontSize: 80, lineHeight: 100 }}>
            {round.item.emoji}
          </Text>
          <PromptTitle>{round.item.name}</PromptTitle>
          <PromptNote $right={right}>{answered ? BINS[round.answer].tip : "♻️ Separar o lixo ajuda o planeta."}</PromptNote>
        </PromptCard>
      )}
    />
  );
}

export default function Recycle() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
