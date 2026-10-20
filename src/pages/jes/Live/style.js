import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

export const LiveTitle = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const LiveDot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${jes.live};
`;

export const Picker = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 16px;
  border-width: 1.5px;
  border-color: ${({ $selected }) => ($selected ? jes.live : jes.line)};
  background-color: ${({ $selected }) => ($selected ? "rgba(255,59,78,0.22)" : jes.card)};
`;

export const PickerText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
`;

// palco do placar: o Bip Craque narrando ao lado (computador) ou em cima (celular) do placar
export const Stage = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: ${({ $wide }) => ($wide ? "center" : "stretch")};
  gap: 14px;
`;

export const Narrator = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "column" : "row")};
  align-items: center;
  gap: 10px;
  width: ${({ $wide }) => ($wide ? "250px" : "100%")};
`;

export const Bubble = styled.View`
  flex-grow: ${({ $wide }) => ($wide ? 0 : 1)};
  flex-shrink: 1;
  align-self: stretch;
  min-height: 64px;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 22px;
  background-color: ${colors.white};
`;

export const BubbleLabel = styled.Text`
  font-family: ${fonts.title};
  font-size: 11px;
  letter-spacing: 1px;
  color: #16a34a;
`;

export const NextLabel = styled.Text`
  align-self: flex-start;
  margin-bottom: 8px;
  padding: 3px 12px;
  border-radius: 12px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1px;
  color: #3b2300;
  background-color: ${colors.yellow};
`;

export const EmptyBoard = styled(LinearGradient)`
  align-items: center;
  gap: 10px;
  padding: 22px 18px;
  border-radius: 30px;
  border-width: 3px;
  border-color: rgba(255, 210, 63, 0.55);
`;

export const EmptyDigits = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const EmptyDigit = styled.Text`
  min-width: 70px;
  padding: 4px 12px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 56px;
  line-height: 68px;
  text-align: center;
  color: rgba(255, 210, 63, 0.4);
  background-color: #020805;
`;

export const EmptyTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 20px;
  letter-spacing: 1px;
  color: ${colors.yellow};
  text-align: center;
`;

export const EmptyText = styled.Text`
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  color: ${jes.textSoft};
  text-align: center;
`;

export const RankingGrid = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: stretch;
  gap: 14px;
`;

export const DivisionCard = styled.View`
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.cardStrong};
`;

export const DivisionHead = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
`;

export const DivisionTitle = styled.Text`
  flex: 1;
  font-family: ${fonts.title};
  font-size: 17px;
  color: #1a1203;
`;

export const DivisionNick = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  color: rgba(26, 18, 3, 0.75);
`;

export const MiniRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-top-width: ${({ $first }) => ($first ? 0 : 1)}px;
  border-top-color: rgba(255, 255, 255, 0.07);
  background-color: ${({ $mine }) => ($mine ? "rgba(255,210,63,0.14)" : "transparent")};
`;

export const MiniPosition = styled.Text`
  width: 28px;
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${({ $leader }) => ($leader ? colors.yellow : jes.textSoft)};
`;

export const MiniName = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const MiniPoints = styled.Text`
  min-width: 58px;
  padding: 3px 8px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 15px;
  text-align: center;
  color: ${({ $zero }) => ($zero ? jes.textSoft : "#3b2300")};
  background-color: ${({ $zero }) => ($zero ? "rgba(255,255,255,0.08)" : colors.yellow)};
`;

export const MineTag = styled.Text`
  padding: 1px 7px;
  border-radius: 8px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 11px;
  color: #3b2300;
  background-color: ${colors.yellow};
`;

export const CardFoot = styled.Text`
  padding: 8px 14px 12px;
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.muted};
  text-align: center;
`;

export const OrganizerLink = styled.Text`
  margin-top: 26px;
  font-family: ${fonts.heading};
  font-size: 14px;
  text-align: center;
  color: ${jes.lime};
`;
