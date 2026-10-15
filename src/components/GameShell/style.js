import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Root = styled.View`
  flex: 1;
  user-select: none;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 0 14px 10px;
`;

export const IconCircle = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colors.glassStrong};
  border-width: 1.5px;
  border-color: ${colors.glassLine};
`;

export const TitleWrap = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const TitleEmoji = styled.Text`
  font-size: 24px;
  line-height: 32px;
`;

export const Title = styled.Text`
  flex-shrink: 1;
  font-family: ${fonts.title};
  font-size: ${({ $compact }) => ($compact ? 19 : 22)}px;
  color: ${colors.white};
`;

export const Stage = styled.View`
  flex: 1;
  align-items: center;
`;

/* ---------- tela de início do jogo ---------- */

export const Card = styled.View`
  align-items: center;
  padding: 22px;
  border-radius: 32px;
  background-color: ${colors.white};
`;

export const IconBubble = styled(LinearGradient)`
  width: 96px;
  height: 96px;
  border-radius: 32px;
  align-items: center;
  justify-content: center;
  margin-top: -64px;
  border-width: 5px;
  border-color: ${colors.white};
`;

export const BigEmoji = styled.Text`
  font-size: 46px;
  line-height: 58px;
`;

export const CardTitle = styled.Text`
  margin-top: 10px;
  font-family: ${fonts.title};
  font-size: 28px;
  text-align: center;
  color: ${colors.ink};
`;

export const CardText = styled.Text`
  margin-top: 4px;
  font-family: ${fonts.text};
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: ${colors.inkSoft};
`;

export const Steps = styled.View`
  align-self: stretch;
  gap: 8px;
  margin-top: 16px;
  padding: 14px;
  border-radius: 20px;
  background-color: ${colors.cloud};
`;

export const Step = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const StepNumber = styled.Text`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 15px;
  line-height: 28px;
  text-align: center;
  color: ${colors.white};
  background-color: ${({ $color }) => $color};
`;

export const StepText = styled.Text`
  flex: 1;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 20px;
  color: ${colors.ink};
`;

export const SectionLabel = styled.Text`
  align-self: flex-start;
  margin-top: 18px;
  margin-bottom: 8px;
  font-family: ${fonts.heading};
  font-size: 17px;
  color: ${colors.ink};
`;

export const Modes = styled.View`
  align-self: stretch;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ModeChip = styled.View`
  align-items: center;
  min-width: 96px;
  padding: 8px 12px;
  border-radius: 18px;
  border-width: 2.5px;
  border-color: ${({ $selected, $color }) => ($selected ? $color : colors.line)};
  background-color: ${({ $selected }) => ($selected ? colors.cloud : colors.white)};
`;

export const ModeEmoji = styled.Text`
  font-size: 22px;
  line-height: 28px;
`;

export const ModeLabel = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.ink};
`;

export const BestText = styled.Text`
  margin: 14px 0;
  font-family: ${fonts.body};
  font-size: 15px;
  text-align: center;
  color: ${colors.inkSoft};
`;

/* ---------- tela de resultado ---------- */

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(16, 8, 50, 0.8);
`;

export const MascotSlot = styled.View`
  margin-top: -78px;
`;

export const ScoreBox = styled.View`
  align-items: center;
  margin-top: 6px;
`;

export const ScoreLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colors.muted};
`;

export const RecordBadge = styled.Text`
  margin-top: 4px;
  padding: 4px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: #4a2500;
  background-color: ${colors.yellow};
`;

export const Stats = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
`;

export const Stat = styled.View`
  align-items: center;
  min-width: 84px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: ${colors.cloud};
`;

export const StatValue = styled.Text`
  font-family: ${fonts.title};
  font-size: 19px;
  color: ${colors.ink};
`;

export const StatLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  color: ${colors.muted};
`;

export const XpBox = styled.View`
  align-self: stretch;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 18px;
  background-color: ${colors.ink};
`;

export const XpRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const XpGain = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.yellow};
`;

export const XpLevel = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const LevelUpText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  text-align: center;
  color: ${colors.lime};
`;

export const Unlocked = styled.View`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 18px;
  border-width: 2px;
  border-color: ${colors.yellow};
  background-color: #fff8dc;
`;

export const UnlockedEmoji = styled.Text`
  font-size: 30px;
  line-height: 38px;
`;

export const UnlockedLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #a16207;
`;

export const UnlockedTitle = styled.Text`
  font-family: ${fonts.heading};
  font-size: 17px;
  color: ${colors.ink};
`;

export const Actions = styled.View`
  align-self: stretch;
  gap: 10px;
  margin-top: 18px;
`;

export const ActionRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`;
