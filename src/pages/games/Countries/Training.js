import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Flag from "../../../components/Flag";
import WorldMap from "../../../components/WorldMap";
import { COUNTRIES } from "../../../data/countries";
import useShake from "../../../hooks/useShake";
import { fx } from "../../../services/feedback";
import { continentOf, getCountry } from "../../../utils/countries";
import { formatTime, pick } from "../../../utils/helpers";
import { ContinentBars, CountryChips, CountryInput, Feedback, Spacer, fillsFor, judge } from "./parts";
import { HintCard, HintText, MapBox, Muted, Pill, PillText, SectionLabel, TopBar } from "./style";

const DURATION = 240;
const HINTS = 3;

const starsFor = (count) => (count >= 40 ? 3 : count >= 20 ? 2 : count >= 8 ? 1 : 0);

// Treino: quantos países você lembra em 4 minutos? Cada país certo acende no mapa com a cor do continente.
// A dica mostra a bandeira de um país que ainda falta (começa pelos mais conhecidos).
export default function Training({ finish, area }) {
  const [found, setFound] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [hint, setHint] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(HINTS);
  const [left, setLeft] = useState(DURATION);
  const [shakeStyle, shake] = useShake();
  const latest = useRef([]);
  const counter = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  function end() {
    if (done.current) return;
    done.current = true;
    const list = latest.current;
    const continents = new Set(list.map((id) => getCountry(id).continent)).size;
    finish({
      score: list.length,
      stars: starsFor(list.length),
      message:
        list.length === 0
          ? "Que tal tentar de novo? Comece pelo Brasil e pelos vizinhos!"
          : `Você lembrou ${list.length} ${list.length === 1 ? "país" : "países"} de ${continents} ${
              continents === 1 ? "continente" : "continentes"
            }!`,
      stats: [
        { label: "Países", value: list.length },
        { label: "Continentes", value: `${continents}/6` },
      ],
      detail: { found: list.length },
    });
  }

  // os últimos 10 segundos fazem tique-taque; no zero, acabou (end só usa refs, então tanto faz o render)
  useEffect(() => {
    if (left > 0 && left <= 10) fx("tick");
    if (left === 0) end();
  }, [left]);

  function submit(text) {
    const verdict = judge(text, latest.current);
    counter.current += 1;
    if (verdict.type === "ok" || verdict.type === "typo") {
      const continent = continentOf(verdict.id);
      const first = !latest.current.some((id) => getCountry(id).continent === continent.id);
      const next = [verdict.id, ...latest.current];
      latest.current = next;
      setFound(next);
      if (hint === verdict.id) setHint(null);
      fx(first ? "star" : "correct");
      setFeedback({
        ...verdict,
        key: counter.current,
        text: first
          ? `${verdict.text} Primeiro país da ${continent.name}! ${continent.emoji}`
          : `${verdict.text} +1`,
      });
      return;
    }
    setFeedback({ ...verdict, key: counter.current });
    if (verdict.type === "repeat") {
      fx("tap");
    } else {
      fx("wrong");
      shake();
    }
  }

  function askHint() {
    if (hintsLeft === 0) return;
    const missing = COUNTRIES.filter((country) => !latest.current.includes(country.id));
    const famous = missing.filter((country) => country.famous);
    const choice = pick(famous.length > 0 ? famous : missing);
    if (!choice) return;
    setHint(choice.id);
    setHintsLeft((value) => value - 1);
    fx("pop");
  }

  const hinted = hint ? getCountry(hint) : null;

  return (
    <ScrollView
      style={{ width: area.width, height: area.height }}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TopBar>
        <Pill $alert={left <= 30} accessibilityLabel={`Tempo: ${formatTime(left)}`}>
          <Text style={{ fontSize: 18 }}>⏱️</Text>
          <PillText>{formatTime(left)}</PillText>
        </Pill>
        <Pill accessibilityLabel={`${found.length} países`}>
          <Text style={{ fontSize: 18 }}>🌍</Text>
          <PillText>{found.length} de 195</PillText>
        </Pill>
        <Bouncy
          onPress={askHint}
          disabled={hintsLeft === 0}
          accessibilityLabel={`Pedir uma dica, sobram ${hintsLeft}`}
        >
          <Pill style={{ opacity: hintsLeft === 0 ? 0.5 : 1 }}>
            <Text style={{ fontSize: 18 }}>💡</Text>
            <PillText>Dica ({hintsLeft})</PillText>
          </Pill>
        </Bouncy>
        <Bouncy onPress={end} accessibilityLabel="Terminar a partida">
          <Pill>
            <Text style={{ fontSize: 18 }}>🏁</Text>
            <PillText>Terminar</PillText>
          </Pill>
        </Bouncy>
      </TopBar>

      <MapBox>
        <WorldMap fills={fillsFor(found)} pulse={found[0]} />
      </MapBox>

      <Spacer />
      <CountryInput
        onSubmit={submit}
        active
        placeholder="Digite um país e aperte Enter..."
        shakeStyle={shakeStyle}
      />
      <Feedback feedback={feedback} />

      {hinted ? (
        <Appear key={hinted.id} from="scale">
          <HintCard>
            <Flag id={hinted.id} size={64} />
            <HintText>
              💡 De quem é esta bandeira? O país fica na {continentOf(hinted.id).name}{" "}
              {continentOf(hinted.id).emoji} e começa com “{hinted.name.slice(0, 2)}”.
            </HintText>
          </HintCard>
        </Appear>
      ) : null}

      <SectionLabel>Continentes</SectionLabel>
      <ContinentBars found={found} />

      <SectionLabel>
        {found.length > 0 ? "Seus países" : "Dica: comece pelo Brasil e pelos vizinhos!"}
      </SectionLabel>
      {found.length > 0 ? (
        <CountryChips ids={found} />
      ) : (
        <View>
          <Muted>Não precisa de acento nem de letra maiúscula: “japao” vale como Japão.</Muted>
        </View>
      )}
    </ScrollView>
  );
}
