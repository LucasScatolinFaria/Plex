import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

export const Toggle = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 5px 12px 5px 6px;
  border-radius: 20px;
  border-width: 2px;
  border-color: ${colors.yellow};
  background-color: rgba(255, 210, 63, 0.14);
`;

export const ToggleText = styled.Text`
  font-family: ${fonts.title};
  font-size: 15px;
  color: ${colors.white};
`;

export const Panel = styled.View`
  gap: 12px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 24px;
  border-width: 2px;
  border-color: ${colors.yellow};
  background-color: ${jes.cardStrong};
`;

export const Title = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.white};
`;

export const Group = styled.View`
  gap: 6px;
`;

export const GroupLabel = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${jes.textSoft};
`;

export const Choices = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Choice = styled.View`
  align-items: center;
  gap: 4px;
  width: 84px;
  padding: 8px 4px;
  border-radius: 18px;
  border-width: 2px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : "transparent")};
  background-color: ${({ $selected }) => ($selected ? "rgba(255,210,63,0.18)" : "rgba(255,255,255,0.06)")};
`;

export const ChoiceName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 12px;
  color: ${colors.white};
  text-align: center;
`;
