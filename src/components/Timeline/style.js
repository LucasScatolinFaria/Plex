import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 16px;
  border-left-width: 5px;
  background-color: ${({ $score }) => ($score ? "rgba(255,210,63,0.12)" : jes.card)};
`;

export const Minute = styled.Text`
  min-width: 38px;
  padding: 2px 6px;
  border-radius: 8px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 13px;
  text-align: center;
  color: ${colors.yellow};
  background-color: #020805;
`;

export const Emoji = styled.Text`
  font-size: 20px;
  line-height: 26px;
`;

export const Line = styled.Text`
  flex: 1;
  font-family: ${({ $score }) => ($score ? fonts.heading : fonts.body)};
  font-size: 15px;
  line-height: 20px;
  color: ${colors.white};
`;

export const Empty = styled.Text`
  padding: 14px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 14px;
  text-align: center;
  color: ${jes.textSoft};
  background-color: ${jes.card};
`;
