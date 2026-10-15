import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import Float from "../../components/Float";
import { colors, fonts } from "../../theme";

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const Greeting = styled.View`
  flex: 1;
`;

export const Hello = styled.Text`
  font-family: ${fonts.title};
  font-size: ${({ $compact }) => ($compact ? 21 : 26)}px;
  color: ${colors.white};
`;

export const LevelTitle = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${colors.textSoft};
`;

export const Chip = styled.Text`
  padding: 6px 12px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.white};
  background-color: ${colors.glassStrong};
`;

// no computador o destaque e o nível ficam lado a lado
export const TopRow = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column-reverse")};
  align-items: stretch;
  gap: 14px;
  margin-top: 18px;
`;

export const HeroCard = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  min-height: 150px;
  padding: 16px 18px;
  border-radius: 30px;
  overflow: hidden;
`;

export const HeroBody = styled.View`
  flex: 1;
  align-items: flex-start;
  gap: 12px;
`;

export const Bubble = styled.View`
  align-self: stretch;
  min-height: 62px;
  padding: 10px 14px;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  background-color: ${colors.white};
`;

export const HeroCta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 18px;
  background-color: ${colors.ink};
`;

export const HeroCtaText = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const HeroEmoji = styled.Text`
  position: absolute;
  right: -14px;
  bottom: -26px;
  font-size: 120px;
  line-height: 150px;
  opacity: 0.25;
  transform: rotate(-14deg);
`;

export const LevelCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 26px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: ${colors.glass};
`;

export const LevelBadge = styled(LinearGradient)`
  width: 58px;
  height: 58px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

export const LevelNumber = styled.Text`
  font-family: ${fonts.title};
  font-size: 28px;
  color: #4a2500;
`;

export const LevelInfo = styled.View`
  flex: 1;
  gap: 8px;
`;

export const LevelLine = styled.View`
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

export const LevelName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 18px;
  color: ${colors.white};
`;

export const LevelXp = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

// cartão do desafio do dia
export const DailyBox = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 26px;
  overflow: hidden;
`;

export const DailyIcon = styled.View`
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.25);
`;

export const DailyEmoji = styled.Text`
  font-size: 32px;
  line-height: 40px;
`;

export const DailyBody = styled.View`
  flex: 1;
  gap: 4px;
`;

export const DailyLabel = styled.Text`
  font-family: ${fonts.strong};
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.85);
`;

export const DailyText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 17px;
  line-height: 21px;
  color: ${colors.white};
`;

export const DailyBar = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

export const DailyCount = styled.Text`
  font-family: ${fonts.title};
  font-size: 14px;
  color: ${colors.white};
`;

export const DailyReward = styled.View`
  align-items: center;
  gap: 6px;
`;

export const DailyRewardText = styled.Text`
  padding: 4px 10px;
  border-radius: 12px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 15px;
  color: #4a2500;
  background-color: ${colors.yellow};
`;

export const DailyHint = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  text-align: center;
  color: ${colors.white};
`;

export const SectionTitle = styled.Text`
  margin-top: 26px;
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const CategoryChip = styled.View`
  padding: 8px 16px;
  border-radius: 18px;
  border-width: 1.5px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : colors.glassLine)};
  background-color: ${({ $selected }) => ($selected ? colors.yellow : colors.glass)};
`;

export const CategoryText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${({ $selected }) => ($selected ? "#4a2500" : colors.white)};
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 14px;
`;

export const GameCardBox = styled(LinearGradient)`
  height: 196px;
  padding: 14px;
  border-radius: 28px;
  overflow: hidden;
`;

// círculo claro no canto, só para dar volume ao cartão
export const CardGlow = styled.View`
  position: absolute;
  top: -40px;
  right: -40px;
  width: 130px;
  height: 130px;
  border-radius: 65px;
  background-color: rgba(255, 255, 255, 0.2);
`;

// selo dos jogos que a criança ainda não experimentou
export const NewBadge = styled(Float)`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 9px;
  border-radius: 10px;
  background-color: ${colors.yellow};
`;

export const NewBadgeText = styled.Text`
  font-family: ${fonts.title};
  font-size: 11px;
  letter-spacing: 0.6px;
  color: #4a2500;
`;

export const CardEmoji = styled.Text`
  font-size: 46px;
  line-height: 58px;
`;

export const CardTitle = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.title};
  font-size: 19px;
  line-height: 22px;
  color: ${({ $color }) => $color};
`;

export const CardCategory = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  opacity: 0.85;
  color: ${({ $color }) => $color};
`;

export const CardFooter = styled.View`
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const StarsPill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  background-color: rgba(20, 10, 60, 0.45);
`;

export const StarsText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
`;

export const PlayCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  padding-left: 3px;
  background-color: ${colors.white};
`;

export const Footer = styled.Text`
  margin-top: 28px;
  font-family: ${fonts.body};
  font-size: 13px;
  text-align: center;
  color: ${colors.textSoft};
`;
