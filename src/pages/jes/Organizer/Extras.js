import { useState } from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import Field from "../../../components/Field";
import TeamCrest from "../../../components/TeamCrest";
import { BONUS_REASONS, DIVISIONS, TEAM_COLORS, TEAM_EMOJIS } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import { deleteBonus, resetTeam, saveTeam } from "../../../services/jes";
import { getDivision, getSport, getTeam, lighten, sportsOf, teamCustomized, teamsOf } from "../../../utils/jes";
import {
  BonusMeta,
  BonusPoints,
  BonusRow,
  BonusText,
  ChoiceName,
  ConfirmText,
  CrestPreview,
  EditorRow,
  EmojiCell,
  ErrorText,
  FormActions,
  FormCard,
  FormHint,
  FormTitle,
  Grid,
  Label,
  Option,
  OptionText,
  Options,
  PreviewName,
  SmallIcon,
  Swatch,
  TeamChoice,
  TeamChoices,
} from "./style";

const POINT_STEPS = [1, 2, 3, 5, 10, -1, -5];

function Choices({ items, value, onChange }) {
  return (
    <Options>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <Bouncy
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
          >
            <Option $selected={selected}>
              <OptionText $selected={selected}>{item.label}</OptionText>
            </Option>
          </Bouncy>
        );
      })}
    </Options>
  );
}

function TeamGrid({ division, value, onChange }) {
  return (
    <TeamChoices style={{ justifyContent: "flex-start", gap: 6, flexWrap: "wrap" }}>
      {teamsOf(division).map((team) => (
        <Bouncy
          key={team.id}
          onPress={() => onChange(team.id)}
          accessibilityState={{ selected: team.id === value }}
          accessibilityLabel={`${team.label} ${team.name}`}
        >
          <TeamChoice $selected={team.id === value}>
            <TeamCrest team={team} size={46} label />
            <ChoiceName numberOfLines={1}>{team.name}</ChoiceName>
          </TeamChoice>
        </Bouncy>
      ))}
    </TeamChoices>
  );
}

const divisionItems = DIVISIONS.map((division) => ({
  id: division.id,
  label: `${division.emoji} ${division.label}`,
}));

// Dar pontos extras para uma sala (fair play, torcida, campeã de um esporte...). Ponto negativo serve para corrigir.
export function BonusForm({ onSave, onCancel }) {
  const [division, setDivision] = useState(DIVISIONS[0].id);
  const [team, setTeam] = useState(teamsOf(DIVISIONS[0].id)[0].id);
  const [points, setPoints] = useState(3);
  const [reason, setReason] = useState(BONUS_REASONS[0].label);
  const [other, setOther] = useState("");
  const [sport, setSport] = useState("");
  const [error, setError] = useState("");

  function pickDivision(id) {
    setDivision(id);
    setTeam(teamsOf(id)[0].id);
    setSport("");
  }

  function save() {
    const text = reason === "outro" ? other.trim() : reason;
    if (!text) {
      setError("Escreva o motivo dos pontos.");
      return;
    }
    setError("");
    onSave({ division, team, points, reason: text.slice(0, 60), sport });
  }

  const chosen = getTeam(team);

  return (
    <FormCard>
      <FormTitle>🎁 Dar pontos extras</FormTitle>

      <Label>ANOS</Label>
      <Choices items={divisionItems} value={division} onChange={pickDivision} />

      <Label>PARA QUAL SALA</Label>
      <TeamGrid division={division} value={team} onChange={setTeam} />

      <Label>QUANTOS PONTOS</Label>
      <Choices
        items={POINT_STEPS.map((step) => ({ id: step, label: step > 0 ? `+${step}` : `${step}` }))}
        value={points}
        onChange={setPoints}
      />

      <Label>POR QUÊ</Label>
      <Choices
        items={[
          ...BONUS_REASONS.map((item) => ({ id: item.label, label: `${item.emoji} ${item.label}` })),
          { id: "outro", label: "✏️ Outro motivo" },
        ]}
        value={reason}
        onChange={setReason}
      />
      {reason === "outro" ? (
        <Field
          icon="create-outline"
          placeholder="Ex.: ajudou a arrumar a quadra"
          value={other}
          onChangeText={setOther}
          maxLength={60}
          style={{ marginTop: 8 }}
        />
      ) : null}

      <Label>VALE PARA</Label>
      <Choices
        items={[
          { id: "", label: "🏅 Ranking geral" },
          ...sportsOf(division).map((item) => ({ id: item.id, label: `${item.emoji} ${item.name}` })),
        ]}
        value={sport}
        onChange={setSport}
      />

      {error ? <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText> : null}

      <FormActions>
        <Button title="Cancelar" tone="soft" size="sm" onPress={onCancel} />
        <Button
          title={`Dar ${points > 0 ? `+${points}` : points} para o ${chosen.label}`}
          icon="gift"
          tone="green"
          size="sm"
          sound="star"
          onPress={save}
        />
      </FormActions>
    </FormCard>
  );
}

function BonusItem({ bonus, run }) {
  const [confirming, setConfirming] = useState(false);
  const team = getTeam(bonus.team);
  const reason = BONUS_REASONS.find((item) => item.label === bonus.reason);

  return (
    <BonusRow>
      <BonusPoints $negative={bonus.points < 0}>
        {bonus.points > 0 ? `+${bonus.points}` : bonus.points}
      </BonusPoints>
      <TeamCrest team={team} size={32} />
      <View style={{ flex: 1, minWidth: 140 }}>
        <BonusText numberOfLines={1}>
          {team.label} {team.name} · {reason ? `${reason.emoji} ` : ""}
          {bonus.reason}
        </BonusText>
        <BonusMeta>
          {getDivision(bonus.division).label} ·{" "}
          {bonus.sport ? `${getSport(bonus.sport).emoji} ${getSport(bonus.sport).name}` : "ranking geral"}
        </BonusMeta>
      </View>
      {confirming ? (
        <>
          <ConfirmText style={{ flex: 0, minWidth: 0 }}>Tirar esses pontos?</ConfirmText>
          <Button title="Não" tone="soft" size="sm" onPress={() => setConfirming(false)} />
          <Button
            title="Tirar"
            icon="trash"
            tone="red"
            size="sm"
            onPress={() => {
              setConfirming(false);
              run(() => deleteBonus(bonus.id));
            }}
          />
        </>
      ) : (
        <Bouncy onPress={() => setConfirming(true)} accessibilityLabel="Tirar esses pontos extras">
          <SmallIcon>
            <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
          </SmallIcon>
        </Bouncy>
      )}
    </BonusRow>
  );
}

export function BonusList({ bonuses, run }) {
  return (
    <View style={{ gap: 10 }}>
      {[...bonuses]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((bonus) => (
          <BonusItem key={bonus.id} bonus={bonus} run={run} />
        ))}
    </View>
  );
}

// Trocar o nome, o apelido curto, o bicho e a cor de uma sala. Vale na hora para todo mundo.
export function TeamsEditor({ run, onClose }) {
  const { isTablet } = useLayout();
  const [editing, setEditing] = useState(null);
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  function open(id) {
    const team = getTeam(id);
    setEditing(id);
    setLabel(team.label);
    setName(team.name);
    setEmoji(team.emoji);
    setColor(team.color);
    setError("");
  }

  async function save() {
    if (!label.trim()) {
      setError("A sala precisa de um nome curto, como 1ºA.");
      return;
    }
    const saved = await run(() => saveTeam(editing, { label: label.trim(), name: name.trim(), emoji, color }));
    if (saved) setEditing(null);
  }

  async function reset() {
    if (await run(() => resetTeam(editing))) setEditing(null);
  }

  const preview = editing
    ? { ...getTeam(editing), label: label || "?", name, emoji, color, light: lighten(color) }
    : null;

  return (
    <FormCard>
      <FormTitle>🎨 Salas e mascotes</FormTitle>
      <FormHint>Toque numa sala para trocar o nome, o bicho e a cor.</FormHint>

      {DIVISIONS.map((division) => (
        <View key={division.id}>
          <Label>
            {division.emoji} {division.label.toUpperCase()}
          </Label>
          <TeamGrid division={division.id} value={editing} onChange={open} />
        </View>
      ))}

      {preview ? (
        <View style={{ marginTop: 14 }}>
          <EditorRow $wide={isTablet}>
            <CrestPreview>
              <TeamCrest team={preview} size={92} label />
              <PreviewName>
                {preview.label} {preview.name}
              </PreviewName>
            </CrestPreview>
            <View style={{ flex: 1, gap: 4 }}>
              <Label>NOME CURTO (APARECE NO ESCUDO)</Label>
              <Field
                icon="pricetag-outline"
                placeholder="1ºA"
                value={label}
                onChangeText={setLabel}
                maxLength={6}
              />
              <Label>NOME DA EQUIPE</Label>
              <Field
                icon="people-outline"
                placeholder="Leões"
                value={name}
                onChangeText={setName}
                maxLength={18}
              />
            </View>
          </EditorRow>

          <Label>MASCOTE</Label>
          <Grid>
            {TEAM_EMOJIS.map((item) => (
              <Bouncy key={item} onPress={() => setEmoji(item)} accessibilityLabel={`Mascote ${item}`}>
                <EmojiCell $selected={item === emoji}>
                  <Text style={{ fontSize: 24, lineHeight: 30 }}>{item}</Text>
                </EmojiCell>
              </Bouncy>
            ))}
          </Grid>

          <Label>COR</Label>
          <Grid>
            {TEAM_COLORS.map((item) => (
              <Bouncy key={item} onPress={() => setColor(item)} accessibilityLabel={`Cor ${item}`}>
                <Swatch $selected={item === color} style={{ backgroundColor: item }} />
              </Bouncy>
            ))}
          </Grid>

          {error ? <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText> : null}

          <FormActions>
            {teamCustomized(editing) ? (
              <Button title="Voltar ao original" icon="refresh" tone="ghost" size="sm" onPress={reset} />
            ) : null}
            <Button title="Cancelar" tone="soft" size="sm" onPress={() => setEditing(null)} />
            <Button title="Salvar sala" icon="checkmark" tone="green" size="sm" onPress={save} />
          </FormActions>
        </View>
      ) : null}

      <FormActions>
        <Button title="Fechar" icon="close" tone="soft" size="sm" onPress={onClose} />
      </FormActions>
    </FormCard>
  );
}
