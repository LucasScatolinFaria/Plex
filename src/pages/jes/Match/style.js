import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

export const Columns = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: flex-start;
  gap: 18px;
`;

export const SideTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.white};
`;

export const SideText = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  color: ${jes.textSoft};
`;

export const TeamRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

export const TeamInfo = styled.View`
  flex: 1;
`;

export const TeamLabel = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const TeamStat = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const Toast = styled.Text`
  position: absolute;
  bottom: 28px;
  align-self: center;
  padding: 10px 18px;
  border-radius: 18px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: #3b2300;
  background-color: ${colors.yellow};
`;
