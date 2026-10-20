import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

export const Tabs = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 18px;
`;

export const Tab = styled(LinearGradient)`
  align-items: center;
  padding: 12px 8px;
  border-radius: 22px;
  border-width: 2px;
  border-color: ${({ $selected }) => ($selected ? "rgba(255,255,255,0.85)" : jes.line)};
`;

export const TabEmoji = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;

export const TabTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: ${({ $compact }) => ($compact ? 15 : 18)}px;
  color: ${({ $selected }) => ($selected ? "#1a1203" : colors.white)};
  text-align: center;
`;

export const TabNick = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  color: ${({ $selected }) => ($selected ? "rgba(26,18,3,0.75)" : jes.muted)};
  text-align: center;
`;

export const Podium = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
`;

export const Spot = styled.View`
  flex: 1;
  max-width: 170px;
  align-items: center;
`;

export const SpotName = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.title};
  font-size: 17px;
  color: ${colors.white};
`;

export const SpotNick = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const SpotPoints = styled.Text`
  margin: 4px 0 8px;
  padding: 2px 10px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 15px;
  color: #3b2300;
  background-color: ${colors.yellow};
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
  font-size: 32px;
  color: rgba(40, 20, 0, 0.75);
`;

export const Table = styled.View`
  margin-top: 0;
  border-radius: 22px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.cardStrong};
  overflow: hidden;
`;

export const HeadRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.06);
`;

export const HeadCell = styled.Text`
  font-family: ${fonts.title};
  font-size: 11px;
  letter-spacing: 0.6px;
  text-align: center;
  color: ${jes.muted};
`;

export const HeadEmoji = styled.Text`
  font-size: 17px;
  line-height: 22px;
  text-align: center;
`;

export const BodyRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 12px;
  border-top-width: 1px;
  border-top-color: rgba(255, 255, 255, 0.07);
  border-left-width: 4px;
  border-left-color: ${({ $mine }) => ($mine ? colors.yellow : "transparent")};
  background-color: ${({ $leader, $mine }) =>
    $mine ? "rgba(255,210,63,0.16)" : $leader ? "rgba(255,210,63,0.08)" : "transparent"};
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

// antes de alguém pontuar: o Bip Craque explica que todo mundo começa zerado
export const StartCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding: 14px 18px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: rgba(255, 210, 63, 0.5);
  background-color: rgba(3, 14, 8, 0.85);
`;

export const StartText = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 16px;
  line-height: 22px;
  color: ${colors.white};
`;

export const Cell = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  text-align: center;
  color: ${jes.textSoft};
`;

export const PositionCell = styled.Text`
  font-family: ${fonts.title};
  font-size: 17px;
  text-align: center;
  color: ${({ $color }) => $color};
`;

export const TeamCell = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const TeamText = styled.Text`
  flex-shrink: 1;
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const TeamNick = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${jes.textSoft};
`;

export const PointsCell = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  text-align: center;
  color: ${colors.yellow};
`;

export const Dot = styled.View`
  width: 11px;
  height: 11px;
  border-radius: 6px;
`;

export const Legend = styled.Text`
  align-self: center;
  margin-top: 14px;
  padding: 6px 12px;
  border-radius: 14px;
  overflow: hidden;
  background-color: rgba(3, 14, 8, 0.75);
  font-family: ${fonts.body};
  font-size: 13px;
  line-height: 19px;
  text-align: center;
  color: ${jes.muted};
`;

export const Rules = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
`;

export const RuleChip = styled.Text`
  padding: 6px 12px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
  background-color: ${jes.card};
`;
