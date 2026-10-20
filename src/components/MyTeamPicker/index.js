import { Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../Appear";
import Bouncy from "../Bouncy";
import TeamCrest from "../TeamCrest";
import { fx } from "../../services/feedback";
import { DIVISIONS } from "../../data/jes";
import { colors } from "../../theme";
import { getTeam, teamsOf } from "../../utils/jes";
import { Choice, ChoiceName, Choices, Group, GroupLabel, Panel, Title, Toggle, ToggleText } from "./style";

// "Minha sala": o botão que mostra a sala escolhida e o painel com todas as salas para escolher.
// A escolha fica só neste aparelho e deixa a sala em destaque no ranking e no placar.
export function MyTeamButton({ myTeam, open, onToggle }) {
  const team = myTeam ? getTeam(myTeam) : null;

  return (
    <Bouncy
      onPress={onToggle}
      accessibilityLabel={team ? `Minha sala: ${team.label}. Trocar` : "Escolher a minha sala"}
    >
      <Toggle>
        {team ? (
          <TeamCrest team={team} size={28} />
        ) : (
          <Text style={{ fontSize: 20, lineHeight: 26, marginLeft: 4 }}>⭐</Text>
        )}
        <ToggleText>{team ? `Minha sala: ${team.label}` : "Qual é a sua sala?"}</ToggleText>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.yellow} />
      </Toggle>
    </Bouncy>
  );
}

export default function MyTeamPicker({ myTeam, onPick }) {
  return (
    <Appear from="top">
      <Panel>
        <Title>⭐ Toque na sua sala para torcer por ela!</Title>
        {DIVISIONS.map((division) => (
          <Group key={division.id}>
            <GroupLabel>
              {division.emoji} {division.label}
            </GroupLabel>
            <Choices>
              {teamsOf(division.id).map((team) => (
                <Bouncy
                  key={team.id}
                  onPress={() => {
                    fx("star");
                    onPick(team.id);
                  }}
                  sound={null}
                  accessibilityState={{ selected: team.id === myTeam }}
                  accessibilityLabel={`${team.label} ${team.name}`}
                >
                  <Choice $selected={team.id === myTeam}>
                    <TeamCrest team={team} size={46} label />
                    <ChoiceName numberOfLines={1}>{team.name}</ChoiceName>
                  </Choice>
                </Bouncy>
              ))}
            </Choices>
          </Group>
        ))}
      </Panel>
    </Appear>
  );
}
