import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

export const Frame = styled(LinearGradient)`
  padding: ${({ $compact }) => ($compact ? "14px 12px 12px" : "18px 22px 16px")};
  border-radius: 30px;
  border-width: 3px;
  border-color: rgba(255, 210, 63, 0.55);
  overflow: hidden;
`;

// fileira de lâmpadas no alto do placar, como nos estádios
export const Bulbs = styled.View`
  position: absolute;
  top: 7px;
  left: 26px;
  right: 26px;
  flex-direction: row;
  justify-content: space-between;
`;

export const Bulb = styled.View`
  width: 5px;
  height: 5px;
  border-radius: 3px;
  background-color: ${({ $on }) => ($on ? colors.yellow : "rgba(255,255,255,0.22)")};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;

export const SportChip = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 8px;
  border-radius: 14px;
`;

export const SportText = styled.Text`
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1px;
  color: ${colors.white};
`;

export const DivisionText = styled.Text`
  flex: 1;
  min-width: 80px;
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const ClockBox = styled.View`
  padding: 3px 12px;
  border-radius: 12px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
  background-color: #020805;
`;

export const ClockText = styled.Text`
  font-family: ${fonts.title};
  letter-spacing: 2px;
  color: ${colors.yellow};
`;

export const Body = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-top: 18px;
`;

export const TeamColumn = styled.View`
  flex: 1;
  align-items: center;
  gap: 4px;
`;

export const TeamLabel = styled.Text`
  margin-top: 4px;
  font-family: ${fonts.title};
  color: ${colors.white};
  text-align: center;
`;

export const TeamName = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${jes.textSoft};
  text-align: center;
`;

export const Digits = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const DigitBox = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.08);
  background-color: #020805;
`;

export const Separator = styled.Text`
  font-family: ${fonts.title};
  color: ${jes.muted};
`;

export const Footer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 16px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: rgba(255, 255, 255, 0.08);
`;

export const FooterText = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;
