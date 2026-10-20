// Peças usadas pelos dois modos do jogo Países do Mundo (treino e online).
import { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Flag from "../../../components/Flag";
import ProgressBar from "../../../components/ProgressBar";
import { CONTINENTS } from "../../../data/countries";
import { colors } from "../../../theme";
import { continentOf, countriesIn, findCountry, getCountry } from "../../../utils/countries";
import {
  ChipsWrap,
  ContinentChip,
  ContinentName,
  Continents,
  CountryChip,
  CountryName,
  FeedbackChip,
  FeedbackText,
  Input,
  InputBox,
  InputRow,
  SendButton,
} from "./style";

const noOutline = Platform.OS === "web" ? { outlineStyle: "none" } : null;

const LOOKS = {
  ok: { color: "#16A34A" },
  typo: { color: "#16A34A" },
  repeat: { color: "#F59E0B", emoji: "🔁", dark: true },
  unknown: { color: "#EF4444", emoji: "🤔" },
  ambiguous: { color: "#8B5CF6", emoji: "🤔" },
  late: { color: "#64748B", emoji: "⏰" },
};

// O que a criança digitou vale? type = "ok" | "typo" (quase certo) | "repeat" | "unknown" | "ambiguous"
export function judge(text, used) {
  const match = findCountry(text);
  if (!match) return { type: "unknown", text: `Hmm, não conheço “${text.trim()}”. Confere a escrita!` };
  if (match.ambiguous) return { type: "ambiguous", text: match.ambiguous };
  const country = getCountry(match.id);
  if (used.includes(match.id))
    return { type: "repeat", id: match.id, text: `${country.name} já foi! Pense em outro.` };
  return { type: match.typo ? "typo" : "ok", id: match.id, text: `${country.name}!` };
}

// cor de cada país no mapa: a cor do continente dele
export const fillsFor = (ids) => Object.fromEntries(ids.map((id) => [id, continentOf(id).color]));

// Campo grandão para digitar o país. Enter (ou a seta) envia; o campo limpa e continua com o foco.
export function CountryInput({ onSubmit, disabled = false, active = false, placeholder, shakeStyle }) {
  const [text, setText] = useState("");
  const field = useRef(null);

  useEffect(() => {
    if (!disabled) field.current?.focus?.();
  }, [disabled]);

  function send() {
    if (disabled || !text.trim()) return;
    onSubmit(text);
    setText("");
    field.current?.focus?.();
  }

  return (
    <InputRow style={shakeStyle}>
      <InputBox $active={active} $disabled={disabled}>
        <Text style={{ fontSize: 24, lineHeight: 30 }}>🌍</Text>
        <Input
          ref={field}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          editable={!disabled}
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="words"
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={send}
          maxLength={40}
          accessibilityLabel="Nome do país"
          style={noOutline}
        />
      </InputBox>
      <Bouncy onPress={send} disabled={disabled} sound={null} accessibilityLabel="Enviar o país">
        <SendButton $disabled={disabled}>
          <Ionicons name="arrow-forward" size={30} color={colors.white} />
        </SendButton>
      </Bouncy>
    </InputRow>
  );
}

export function Feedback({ feedback }) {
  if (!feedback) return null;
  const look = LOOKS[feedback.type];
  return (
    <Appear key={feedback.key} from="scale">
      <FeedbackChip $color={look.color} accessibilityLiveRegion="polite">
        {feedback.id && !look.emoji ? (
          <Flag id={feedback.id} size={38} />
        ) : (
          <Text style={{ fontSize: 22, lineHeight: 28 }}>{look.emoji}</Text>
        )}
        <FeedbackText $dark={look.dark}>{feedback.text}</FeedbackText>
      </FeedbackChip>
    </Appear>
  );
}

// quantos países de cada continente já foram, com uma barrinha na cor do continente
export function ContinentBars({ found }) {
  return (
    <Continents>
      {CONTINENTS.map((continent) => {
        const total = countriesIn(continent.id).length;
        const count = found.filter((id) => getCountry(id).continent === continent.id).length;
        return (
          <ContinentChip key={continent.id}>
            <ContinentName numberOfLines={1}>
              {continent.emoji} {continent.name} · {count}/{total}
            </ContinentName>
            <ProgressBar value={count / total} height={8} color={continent.color} />
          </ContinentChip>
        );
      })}
    </Continents>
  );
}

// bandeirinhas com nome (os mais novos primeiro)
export function CountryChips({ ids, by }) {
  return (
    <ChipsWrap>
      {ids.map((id) => (
        <Appear key={id} from="scale">
          <CountryChip $color={`${continentOf(id).color}55`}>
            <Flag id={id} size={26} />
            <CountryName>
              {getCountry(id).name}
              {by?.[id] ? <Text style={{ opacity: 0.7 }}> · {by[id]}</Text> : null}
            </CountryName>
          </CountryChip>
        </Appear>
      ))}
    </ChipsWrap>
  );
}

export function Spacer({ height = 12 }) {
  return <View style={{ height }} />;
}
