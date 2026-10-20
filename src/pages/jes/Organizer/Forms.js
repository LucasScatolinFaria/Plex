import { useState } from "react";

import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import Field from "../../../components/Field";
import TeamCrest from "../../../components/TeamCrest";
import { DIVISIONS, PLACES } from "../../../data/jes";
import useLayout from "../../../hooks/useLayout";
import {
  addDays,
  addMinutes,
  dateLabel,
  getTeam,
  roundRobin,
  sportsOf,
  teamsOf,
  timeOf,
  validTime,
} from "../../../utils/jes";
import { dayKey } from "../../../utils/progress";
import {
  ChoiceName,
  ErrorText,
  FormActions,
  FormCard,
  FormTitle,
  Label,
  Matchup,
  Option,
  OptionText,
  Options,
  Preview,
  PreviewRow,
  TeamBox,
  TeamBoxLabel,
  TeamChoice,
  TeamChoices,
  VersusBig,
} from "./style";

const INTERVALS = [10, 15, 20, 30];

// próximo horário "redondo" (de meia em meia hora) a partir de agora
function nextSlot() {
  const date = new Date(Date.now() + 30 * 60000);
  date.setMinutes(date.getMinutes() < 30 ? 0 : 30);
  return timeOf(date);
}

// os 7 dias a partir de hoje (e o dia do jogo, se ele já estiver marcado para outra data)
function dayOptions(current) {
  const today = dayKey();
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index));
  if (current && !days.includes(current)) days.unshift(current);
  return days.map((key) => ({ id: key, label: dateLabel(key) }));
}

// "1430" vira "14:30" enquanto a pessoa digita
function maskTime(text) {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

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

function TeamPicker({ label, division, value, other, onChange, wide }) {
  return (
    <TeamBox $wide={wide}>
      <TeamBoxLabel>{label}</TeamBoxLabel>
      <TeamChoices>
        {teamsOf(division).map((team) => {
          const selected = team.id === value;
          const disabled = team.id === other;
          return (
            <Bouncy
              key={team.id}
              onPress={() => onChange(team.id)}
              disabled={disabled}
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={`${team.label} ${team.name}`}
            >
              <TeamChoice $selected={selected} $disabled={disabled}>
                <TeamCrest team={team} size={44} label />
                <ChoiceName numberOfLines={1}>{team.name}</ChoiceName>
              </TeamChoice>
            </Bouncy>
          );
        })}
      </TeamChoices>
    </TeamBox>
  );
}

const divisionItems = DIVISIONS.map((division) => ({
  id: division.id,
  label: `${division.emoji} ${division.label}`,
}));
const sportItems = (division) =>
  sportsOf(division).map((sport) => ({ id: sport.id, label: `${sport.emoji} ${sport.name}` }));
const placeItems = PLACES.map((place) => ({ id: place, label: `📍 ${place}` }));

// Marcar um jogo novo (ou mudar um que já existe: initial = o jogo).
export function MatchForm({ initial, onSave, onCancel }) {
  const { isTablet } = useLayout();
  const [division, setDivision] = useState(initial?.division ?? DIVISIONS[0].id);
  const [sport, setSport] = useState(initial?.sport ?? sportsOf(DIVISIONS[0].id)[0].id);
  const [teamA, setTeamA] = useState(initial?.teamA ?? teamsOf(DIVISIONS[0].id)[0].id);
  const [teamB, setTeamB] = useState(initial?.teamB ?? teamsOf(DIVISIONS[0].id)[1].id);
  const [date, setDate] = useState(initial?.date ?? dayKey());
  const [time, setTime] = useState(initial?.time ?? nextSlot());
  const [place, setPlace] = useState(initial?.place ?? PLACES[0]);
  const [error, setError] = useState("");

  function pickDivision(id) {
    setDivision(id);
    const sports = sportsOf(id);
    if (!sports.some((item) => item.id === sport)) setSport(sports[0].id);
    const teams = teamsOf(id);
    setTeamA(teams[0].id);
    setTeamB(teams[1].id);
  }

  function save() {
    if (teamA === teamB) {
      setError("Escolha duas salas diferentes.");
      return;
    }
    if (!validTime(time)) {
      setError("Digite o horário assim: 14:30.");
      return;
    }
    setError("");
    onSave({ division, sport, teamA, teamB, date, time, place });
  }

  return (
    <FormCard>
      <FormTitle>{initial ? "✏️ Mudar o jogo" : "➕ Novo jogo"}</FormTitle>

      <Label>ANOS</Label>
      <Choices items={divisionItems} value={division} onChange={pickDivision} />

      <Label>ESPORTE</Label>
      <Choices items={sportItems(division)} value={sport} onChange={setSport} />

      <Label>QUEM JOGA</Label>
      <Matchup $wide={isTablet}>
        <TeamPicker
          label="Sala 1"
          division={division}
          value={teamA}
          other={teamB}
          onChange={setTeamA}
          wide={isTablet}
        />
        <VersusBig>x</VersusBig>
        <TeamPicker
          label="Sala 2"
          division={division}
          value={teamB}
          other={teamA}
          onChange={setTeamB}
          wide={isTablet}
        />
      </Matchup>

      <Label>DIA</Label>
      <Choices items={dayOptions(initial?.date)} value={date} onChange={setDate} />

      <Label>HORÁRIO</Label>
      <Field
        icon="time-outline"
        placeholder="14:30"
        value={time}
        onChangeText={(text) => setTime(maskTime(text))}
        keyboardType="number-pad"
        maxLength={5}
        invalid={time.length === 5 && !validTime(time)}
        style={{ maxWidth: 220 }}
      />

      <Label>LOCAL</Label>
      <Choices items={placeItems} value={place} onChange={setPlace} />

      {error ? <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText> : null}

      <FormActions>
        <Button title="Cancelar" tone="soft" size="sm" onPress={onCancel} />
        <Button
          title={initial ? "Salvar" : "Marcar jogo"}
          icon="checkmark"
          tone="green"
          size="sm"
          onPress={save}
        />
      </FormActions>
    </FormCard>
  );
}

// Gera a tabela de um esporte: todas as salas da dupla de anos jogam entre si, um jogo atrás do outro.
export function TableForm({ onSave, onCancel }) {
  const [division, setDivision] = useState(DIVISIONS[0].id);
  const [sport, setSport] = useState(sportsOf(DIVISIONS[0].id)[0].id);
  const [date, setDate] = useState(dayKey());
  const [time, setTime] = useState(nextSlot());
  const [spacing, setSpacing] = useState(20);
  const [place, setPlace] = useState(PLACES[0]);
  const [error, setError] = useState("");

  function pickDivision(id) {
    setDivision(id);
    const sports = sportsOf(id);
    if (!sports.some((item) => item.id === sport)) setSport(sports[0].id);
  }

  const ready = validTime(time);
  const pairs = roundRobin(teamsOf(division).map((team) => team.id));
  const list = ready
    ? pairs.map(([teamA, teamB], index) => ({
        division,
        sport,
        teamA,
        teamB,
        date,
        time: addMinutes(time, index * spacing),
        place,
      }))
    : [];
  // o último jogo não pode passar da meia-noite (o horário daria a volta)
  const lateFinish = ready && list[list.length - 1].time < time;

  function save() {
    if (!ready) {
      setError("Digite o horário do primeiro jogo assim: 14:30.");
      return;
    }
    if (lateFinish) {
      setError("Os últimos jogos passariam da meia-noite. Escolha um horário mais cedo.");
      return;
    }
    setError("");
    onSave(list);
  }

  return (
    <FormCard>
      <FormTitle>⚡ Gerar tabela</FormTitle>

      <Label>ANOS</Label>
      <Choices items={divisionItems} value={division} onChange={pickDivision} />

      <Label>ESPORTE</Label>
      <Choices items={sportItems(division)} value={sport} onChange={setSport} />

      <Label>DIA</Label>
      <Choices items={dayOptions()} value={date} onChange={setDate} />

      <Label>PRIMEIRO JOGO</Label>
      <Field
        icon="time-outline"
        placeholder="14:30"
        value={time}
        onChangeText={(text) => setTime(maskTime(text))}
        keyboardType="number-pad"
        maxLength={5}
        invalid={time.length === 5 && !ready}
        style={{ maxWidth: 220 }}
      />

      <Label>UM JOGO A CADA</Label>
      <Choices
        items={INTERVALS.map((minutes) => ({ id: minutes, label: `${minutes} min` }))}
        value={spacing}
        onChange={setSpacing}
      />

      <Label>LOCAL</Label>
      <Choices items={placeItems} value={place} onChange={setPlace} />

      <Label>{pairs.length} JOGOS · TODAS AS SALAS JOGAM ENTRE SI</Label>
      <Preview>
        {(ready ? list : pairs.map(([teamA, teamB]) => ({ teamA, teamB, time: "--:--" }))).map((match) => (
          <PreviewRow key={`${match.teamA}-${match.teamB}`}>
            🕒 {match.time} · {getTeam(match.teamA).label} {getTeam(match.teamA).emoji} x{" "}
            {getTeam(match.teamB).emoji} {getTeam(match.teamB).label}
          </PreviewRow>
        ))}
      </Preview>

      {error ? <ErrorText style={{ marginTop: 12 }}>{error}</ErrorText> : null}

      <FormActions>
        <Button title="Cancelar" tone="soft" size="sm" onPress={onCancel} />
        <Button title={`Criar ${pairs.length} jogos`} icon="flash" tone="green" size="sm" onPress={save} />
      </FormActions>
    </FormCard>
  );
}
