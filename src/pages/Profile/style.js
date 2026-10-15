import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const ProfileCard = styled.View`
  align-items: center;
  gap: 6px;
  padding: 22px 18px;
  border-radius: 30px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: ${colors.glass};
`;

export const Name = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.title};
  font-size: 26px;
  text-align: center;
  color: ${colors.white};
`;

export const Email = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${colors.textSoft};
`;

export const LevelBox = styled.View`
  align-self: stretch;
  gap: 8px;
  margin: 10px 0;
`;

export const LevelRow = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

export const LevelName = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.white};
`;

export const LevelXp = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

export const Editor = styled.View`
  align-self: stretch;
  gap: 12px;
  margin-top: 10px;
  padding: 16px;
  border-radius: 24px;
  background-color: ${colors.white};
`;

export const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
`;

export const StatTile = styled.View`
  align-items: center;
  padding: 14px 8px;
  border-radius: 22px;
  background-color: ${colors.glass};
`;

export const StatEmoji = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;

export const StatValue = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const StatLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

export const SectionTitle = styled.Text`
  margin-top: 26px;
  margin-bottom: 10px;
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const Panel = styled.View`
  border-radius: 24px;
  overflow: hidden;
  background-color: ${colors.glass};
`;

export const PanelRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 8px 16px;
  border-top-width: ${({ $first }) => ($first ? 0 : 1)}px;
  border-top-color: rgba(255, 255, 255, 0.12);
`;

export const RowEmoji = styled.Text`
  width: 34px;
  font-size: 26px;
  line-height: 34px;
  text-align: center;
`;

export const RowInfo = styled.View`
  flex: 1;
`;

export const RowTitle = styled.Text`
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.white};
`;

export const RowHint = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

export const RowValue = styled.Text`
  font-family: ${fonts.title};
  font-size: 17px;
  color: ${colors.yellow};
`;

export const Danger = styled.View`
  align-items: center;
  gap: 12px;
  margin-top: 22px;
`;

export const DangerText = styled.Text`
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${colors.white};
`;

export const DangerLink = styled.Text`
  padding: 8px;
  font-family: ${fonts.body};
  font-size: 14px;
  text-decoration-line: underline;
  color: ${colors.textSoft};
`;
