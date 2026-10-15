import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const PageTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 30px;
  color: ${colors.white};
`;

export const PageHint = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.body};
  font-size: 15px;
  color: ${colors.textSoft};
`;

export const Summary = styled.View`
  gap: 12px;
  margin-top: 18px;
  padding: 18px;
  border-radius: 26px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: ${colors.glass};
`;

export const SummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
`;

export const SummaryText = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 19px;
  line-height: 24px;
  color: ${colors.white};
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 18px;
`;

export const Badge = styled.View`
  align-items: center;
  height: 188px;
  padding: 14px 10px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${({ $unlocked }) => ($unlocked ? colors.white : colors.glassLine)};
  background-color: ${({ $unlocked }) => ($unlocked ? colors.white : colors.glass)};
`;

export const Medal = styled(LinearGradient)`
  width: 62px;
  height: 62px;
  border-radius: 31px;
  align-items: center;
  justify-content: center;
`;

export const MedalEmoji = styled.Text`
  font-size: 30px;
  line-height: 38px;
`;

export const BadgeTitle = styled.Text`
  margin-top: 8px;
  font-family: ${fonts.heading};
  font-size: 16px;
  line-height: 19px;
  text-align: center;
  color: ${({ $unlocked }) => ($unlocked ? colors.ink : colors.white)};
`;

export const BadgeText = styled.Text`
  margin-top: 3px;
  font-family: ${fonts.text};
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  color: ${({ $unlocked }) => ($unlocked ? colors.inkSoft : colors.textSoft)};
`;

export const BadgeDate = styled.Text`
  position: absolute;
  bottom: 10px;
  font-family: ${fonts.body};
  font-size: 12px;
  color: ${colors.success};
`;
