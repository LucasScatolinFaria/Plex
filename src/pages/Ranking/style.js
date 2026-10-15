import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Podium = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
`;

export const PodiumSpot = styled.View`
  flex: 1;
  max-width: 150px;
  align-items: center;
`;

export const Crown = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;

export const PodiumName = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const PodiumStars = styled.Text`
  margin-bottom: 6px;
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.yellow};
`;

export const Pedestal = styled(LinearGradient)`
  align-self: stretch;
  align-items: center;
  padding-top: 8px;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
`;

export const PedestalNumber = styled.Text`
  font-family: ${fonts.title};
  font-size: 30px;
  color: rgba(40, 20, 0, 0.75);
`;

export const List = styled.View`
  gap: 8px;
  margin-top: 18px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 22px;
  border-width: 2px;
  border-color: ${({ $me }) => ($me ? colors.yellow : "transparent")};
  background-color: ${({ $me }) => ($me ? "rgba(255,210,63,0.16)" : colors.glass)};
`;

export const Position = styled.Text`
  min-width: 30px;
  font-family: ${fonts.title};
  font-size: 20px;
  text-align: center;
  color: ${colors.white};
`;

export const PlayerInfo = styled.View`
  flex: 1;
`;

export const PlayerName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 17px;
  color: ${colors.white};
`;

export const PlayerLevel = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

export const PlayerStars = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.yellow};
`;

export const Hint = styled.Text`
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 20px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${colors.white};
  background-color: ${colors.glass};
`;
