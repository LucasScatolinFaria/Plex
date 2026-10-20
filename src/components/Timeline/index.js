import { View } from "react-native";

import Appear from "../Appear";
import { describeEvent, minuteOf } from "../../utils/jes";
import { Emoji, Empty, Line, Minute, Row } from "./style";

// Lance a lance de um jogo, do mais novo para o mais antigo. limit mostra só os últimos.
export default function Timeline({ match, limit }) {
  const events = [...match.events].reverse().slice(0, limit ?? match.events.length);

  if (events.length === 0) {
    return (
      <Empty>
        {match.status === "scheduled"
          ? "Os lances aparecem aqui quando o jogo começar. ⏳"
          : "Nenhum lance marcado ainda."}
      </Empty>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {events.map((event, index) => {
        const { emoji, text, team } = describeEvent(event, match);
        const score = event.type === "score";
        return (
          <Appear key={event.id} from="left" delay={Math.min(index, 8) * 50}>
            <Row $score={score} style={{ borderLeftColor: team?.color ?? "rgba(255,255,255,0.25)" }}>
              <Minute>{minuteOf(event.at)}</Minute>
              <Emoji>{emoji}</Emoji>
              <Line $score={score}>{text}</Line>
            </Row>
          </Appear>
        );
      })}
    </View>
  );
}
