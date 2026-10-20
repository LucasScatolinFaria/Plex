import { useCallback, useContext, useState } from "react";
import { Animated, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import ChipScroll from "../../../components/ChipScroll";
import Confetti from "../../../components/Confetti";
import Field from "../../../components/Field";
import { Header, IconCircle, Title, TitleWrap } from "../../../components/GameShell/style";
import Mascot from "../../../components/Mascot";
import Stadium from "../../../components/Stadium";
import { AuthContext } from "../../../contexts/auth";
import { useJes } from "../../../contexts/jes";
import { DIVISIONS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import useShake from "../../../hooks/useShake";
import { fx } from "../../../services/feedback";
import { addBonus, createMatches, editMatch, joinStaff, leaveStaff, normalizeCode } from "../../../services/jes";
import { colors } from "../../../theme";
import { firstName } from "../../../utils/helpers";
import { byKickoff } from "../../../utils/jes";
import { Chip, ChipText, Empty } from "../style";
import { LiveControl, MatchRow } from "./Control";
import { BonusForm, BonusList, TeamsEditor } from "./Extras";
import { MatchForm, TableForm } from "./Forms";
import {
  Banner,
  Buttons,
  Count,
  ErrorText,
  GateCard,
  GateText,
  GateTitle,
  LeaveLink,
  Section,
  SectionTitle,
  Welcome,
  WelcomeText,
  WelcomeTitle,
} from "./style";

// erros do Firestore em palavras que o professor entende
function friendly(error) {
  if (error?.code === "permission-denied") {
    return 'O banco não aceitou a mudança. Se o código do organizador mudou, toque em "Sair da organização" e entre de novo com o código novo.';
  }
  if (error?.code === "unavailable") return "Sem conexão agora. Confira a internet e tente de novo.";
  return "Não deu certo agora. Tente de novo.";
}

// Visitante não organiza: precisa de uma conta (o código fica ligado à conta).
function GuestGate({ onSignUp }) {
  return (
    <Appear from="scale">
      <GateCard>
        <Mascot sporty size={84} mood="thinking" />
        <GateTitle>Área do organizador</GateTitle>
        <GateText>
          Quem lança os placares do JES Kids precisa entrar com uma conta. Crie a sua (o seu progresso nos jogos
          vai junto) e volte aqui com o código do organizador.
        </GateText>
        <Button title="Criar minha conta" icon="sparkles" full onPress={onSignUp} />
      </GateCard>
    </Appear>
  );
}

function CodeGate({ user, onJoined }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeStyle, shake] = useShake();

  function fail(message) {
    setError(message);
    shake();
    fx("wrong");
  }

  async function submit() {
    if (normalizeCode(code).length < 8) {
      fail("Digite o código inteiro.");
      return;
    }
    setLoading(true);
    try {
      await joinStaff(user.id, user.name, code);
      fx("levelup");
      onJoined();
    } catch (failure) {
      setLoading(false);
      fail(
        failure?.code === "permission-denied"
          ? "Código errado. Confira com quem organiza o JES Kids."
          : "Não deu certo agora. Confira a internet e tente de novo."
      );
    }
  }

  return (
    <Appear from="scale">
      <Animated.View style={shakeStyle}>
        <GateCard>
          <Mascot sporty size={84} mood={error ? "sad" : "happy"} />
          <GateTitle>Área do organizador</GateTitle>
          <GateText>
            Aqui os professores marcam os jogos e lançam o placar ao vivo. Para liberar, digite o código do
            organizador.
          </GateText>
          <Field
            icon="key-outline"
            placeholder="Código do organizador"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={submit}
            style={{ alignSelf: "stretch" }}
          />
          {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}
          <Button title="Liberar acesso" icon="lock-open" full disabled={loading} onPress={submit} />
        </GateCard>
      </Animated.View>
    </Appear>
  );
}

function Dashboard({ user, matches, bonuses, onOpen, onLeave, celebrate }) {
  const { isTablet } = useLayout();
  // null | { kind: "match", match? } | { kind: "table" } | { kind: "bonus" } | { kind: "teams" }
  const [form, setForm] = useState(null);
  const [division, setDivision] = useState("all");
  const [error, setError] = useState("");

  const run = useCallback(async (action) => {
    setError("");
    try {
      await action();
      return true;
    } catch (failure) {
      setError(friendly(failure));
      fx("wrong");
      return false;
    }
  }, []);

  const shown = matches.filter((match) => division === "all" || match.division === division).sort(byKickoff);
  const live = shown.filter((match) => match.status === "live");
  const scheduled = shown.filter((match) => match.status === "scheduled");
  const finished = shown.filter((match) => match.status === "finished").reverse();
  const extras = bonuses.filter((bonus) => division === "all" || bonus.division === division);

  async function saveMatch(data) {
    const editing = form?.match;
    const saved = await run(() => (editing ? editMatch(editing.id, data) : createMatches([data])));
    if (saved) {
      fx("correct");
      setForm(null);
    }
  }

  async function saveTable(list) {
    if (await run(() => createMatches(list))) {
      fx("correct");
      setForm(null);
    }
  }

  async function saveBonus(bonus) {
    if (await run(() => addBonus(bonus))) {
      fx("levelup");
      setForm(null);
    }
  }

  return (
    <>
      <Appear from="top">
        <Welcome $wide={isTablet}>
          <View style={{ flex: isTablet ? 1 : undefined }}>
            <WelcomeTitle>Oi, {firstName(user.name)}! Você organiza o JES Kids 🎽</WelcomeTitle>
            <WelcomeText>
              Marque os jogos, toque em "Começar" na hora e vá lançando os pontos. Tudo aparece na hora no placar
              de todo mundo.
            </WelcomeText>
          </View>
          <Buttons>
            <Button title="Novo jogo" icon="add" size="sm" onPress={() => setForm({ kind: "match" })} />
            <Button
              title="Gerar tabela"
              icon="flash"
              tone="ghost"
              size="sm"
              onPress={() => setForm({ kind: "table" })}
            />
            <Button
              title="Dar pontos"
              icon="gift"
              tone="pink"
              size="sm"
              onPress={() => setForm({ kind: "bonus" })}
            />
            <Button
              title="Salas"
              icon="color-palette"
              tone="purple"
              size="sm"
              onPress={() => setForm({ kind: "teams" })}
            />
          </Buttons>
        </Welcome>
      </Appear>

      {celebrate ? <Banner $ok>🎉 Acesso liberado! Agora é com você.</Banner> : null}
      {error ? <Banner accessibilityRole="alert">{error}</Banner> : null}

      {form?.kind === "match" ? (
        <MatchForm
          key={form.match?.id ?? "novo"}
          initial={form.match}
          onSave={saveMatch}
          onCancel={() => setForm(null)}
        />
      ) : null}
      {form?.kind === "table" ? <TableForm onSave={saveTable} onCancel={() => setForm(null)} /> : null}
      {form?.kind === "bonus" ? <BonusForm onSave={saveBonus} onCancel={() => setForm(null)} /> : null}
      {form?.kind === "teams" ? <TeamsEditor run={run} onClose={() => setForm(null)} /> : null}

      <ChipScroll style={{ marginTop: 18 }}>
        {[{ id: "all", emoji: "🏫", label: "Todos os anos" }, ...DIVISIONS].map((item) => (
          <Bouncy
            key={item.id}
            onPress={() => setDivision(item.id)}
            accessibilityState={{ selected: division === item.id }}
            accessibilityLabel={`Mostrar ${item.label}`}
          >
            <Chip $selected={division === item.id}>
              <ChipText $selected={division === item.id}>
                {item.emoji} {item.label}
              </ChipText>
            </Chip>
          </Bouncy>
        ))}
      </ChipScroll>

      <Section>
        <SectionTitle accessibilityRole="header">🔴 Ao vivo agora</SectionTitle>
        <Count>{live.length}</Count>
      </Section>
      <View style={{ gap: 14 }}>
        {live.length > 0 ? (
          live.map((match) => <LiveControl key={match.id} match={match} run={run} onOpen={() => onOpen(match)} />)
        ) : (
          <Empty>Nenhum jogo rolando. Toque em "Começar" num dos próximos jogos.</Empty>
        )}
      </View>

      <Section>
        <SectionTitle accessibilityRole="header">⏳ Próximos jogos</SectionTitle>
        <Count>{scheduled.length}</Count>
      </Section>
      <View style={{ gap: 10 }}>
        {scheduled.length > 0 ? (
          scheduled.map((match) => (
            <MatchRow key={match.id} match={match} run={run} onEdit={() => setForm({ kind: "match", match })} />
          ))
        ) : (
          <Empty>Nenhum jogo marcado. Use "Novo jogo" ou "Gerar tabela".</Empty>
        )}
      </View>

      <Section>
        <SectionTitle accessibilityRole="header">✅ Encerrados</SectionTitle>
        <Count>{finished.length}</Count>
      </Section>
      <View style={{ gap: 10 }}>
        {finished.length > 0 ? (
          finished.map((match) => <MatchRow key={match.id} match={match} run={run} />)
        ) : (
          <Empty>Os jogos encerrados aparecem aqui e já contam no ranking das salas.</Empty>
        )}
      </View>

      <Section>
        <SectionTitle accessibilityRole="header">🎁 Pontos extras</SectionTitle>
        <Count>{extras.length}</Count>
      </Section>
      {extras.length > 0 ? (
        <BonusList bonuses={extras} run={run} />
      ) : (
        <Empty>Use "Dar pontos" para premiar fair play, torcida animada ou a campeã de um esporte.</Empty>
      )}

      <Bouncy onPress={onLeave} accessibilityLabel="Sair da organização">
        <LeaveLink>Sair da organização</LeaveLink>
      </Bouncy>
    </>
  );
}

// Área do organizador do JES Kids: quem tem o código do organizador marca os jogos e lança os placares.
export default function JesOrganizer() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { matches, bonuses, staff, setStaff } = useJes();
  const [joined, setJoined] = useState(false);

  function leave() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("Jes");
  }

  async function leaveStaffArea() {
    try {
      await leaveStaff(user.id);
    } catch (error) {}
    setJoined(false);
    setStaff(false);
  }

  if (!user) return null;

  return (
    <Stadium calm>
      <Header style={{ paddingTop: insets.top + 10 }}>
        <Bouncy accessibilityLabel="Voltar" onPress={leave}>
          <IconCircle>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </IconCircle>
        </Bouncy>
        <TitleWrap>
          <Title numberOfLines={1}>📋 Organizador</Title>
        </TitleWrap>
        <View style={{ width: 44 }} />
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 48,
        }}
      >
        <View style={{ width: "100%", maxWidth: 980 }}>
          {user.guest ? (
            <GuestGate onSignUp={() => navigation.navigate("SignUp")} />
          ) : staff === null ? null : staff ? (
            <Dashboard
              user={user}
              matches={matches}
              bonuses={bonuses}
              celebrate={joined}
              onOpen={(match) => navigation.navigate("JesMatch", { id: match.id })}
              onLeave={leaveStaffArea}
            />
          ) : (
            <CodeGate
              user={user}
              onJoined={() => {
                setJoined(true);
                setStaff(true);
              }}
            />
          )}
        </View>
      </ScrollView>
      {joined ? <Confetti /> : null}
    </Stadium>
  );
}
