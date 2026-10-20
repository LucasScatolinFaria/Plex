import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

export const Card = styled.View`
  padding: 14px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${({ $live }) => ($live ? "rgba(255,59,78,0.75)" : jes.line)};
  background-color: ${jes.card};
  overflow: hidden;
`;

export const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const SportChip = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 7px;
  border-radius: 12px;
`;

export const SportText = styled.Text`
  font-family: ${fonts.title};
  font-size: 12px;
  letter-spacing: 0.4px;
  color: ${colors.white};
`;

export const DivisionText = styled.Text`
  flex: 1;
  font-family: ${fonts.body};
  font-size: 12px;
  color: ${jes.textSoft};
`;

export const Teams = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-top: 14px;
`;

export const TeamSide = styled.View`
  flex: 1;
  align-items: center;
  gap: 6px;
`;

export const TeamName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
  text-align: center;
`;

// fica na altura do meio dos escudos
export const Middle = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 50px;
  padding: 0 4px;
`;

export const Score = styled.Text`
  min-width: 34px;
  font-family: ${fonts.title};
  font-size: 34px;
  line-height: 40px;
  text-align: center;
  color: ${({ $win }) => ($win ? colors.yellow : colors.white)};
`;

export const Versus = styled.Text`
  font-family: ${fonts.title};
  font-size: ${({ $big }) => ($big ? 22 : 16)}px;
  color: ${jes.muted};
`;

export const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: rgba(255, 255, 255, 0.1);
`;

export const FooterText = styled.Text`
  flex-shrink: 1;
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const Clock = styled.Text`
  font-family: ${fonts.title};
  font-size: 14px;
  color: ${colors.yellow};
`;
