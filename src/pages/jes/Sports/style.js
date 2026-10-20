import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

export const Layout = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: flex-start;
  gap: 18px;
  margin-top: 18px;
`;

export const Menu = styled.View`
  width: 260px;
  padding: 10px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.card};
`;

export const MenuLabel = styled.Text`
  margin: 6px 8px 8px;
  font-family: ${fonts.title};
  font-size: 12px;
  letter-spacing: 1.2px;
  color: ${jes.muted};
`;

export const MenuItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: 16px;
  background-color: ${({ $selected }) => ($selected ? "rgba(255,210,63,0.16)" : "transparent")};
  border-width: 1.5px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : "transparent")};
`;

export const MenuBadge = styled(LinearGradient)`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

export const MenuText = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.white};
`;

export const Detail = styled.View`
  flex: 1;
  width: 100%;
`;

export const Header = styled(LinearGradient)`
  padding: 22px;
  border-radius: 28px;
  overflow: hidden;
`;

export const HeaderTop = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const BigEmoji = styled.Text`
  font-size: ${({ $compact }) => ($compact ? 54 : 72)}px;
  line-height: ${({ $compact }) => ($compact ? 66 : 88)}px;
`;

export const SportName = styled.Text`
  font-family: ${fonts.title};
  font-size: ${({ $compact }) => ($compact ? 28 : 36)}px;
  color: ${colors.white};
`;

export const Who = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

export const WhoChip = styled.Text`
  padding: 3px 10px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 13px;
  color: ${colors.white};
  background-color: rgba(0, 0, 0, 0.25);
`;

export const About = styled.Text`
  margin-top: 14px;
  font-family: ${fonts.heading};
  font-size: 17px;
  line-height: 24px;
  color: ${colors.white};
`;

export const RuleGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

export const RuleCard = styled.View`
  flex-direction: row;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border-left-width: 5px;
  background-color: ${jes.card};
`;

export const RuleEmoji = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
`;

export const RuleTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const RuleText = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.body};
  font-size: 14px;
  line-height: 20px;
  color: ${jes.textSoft};
`;

export const Fact = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 16px;
  border-radius: 22px;
  background-color: ${colors.yellow};
`;

export const FactLabel = styled.Text`
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1px;
  color: #7a4a00;
`;

export const FactText = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.heading};
  font-size: 16px;
  line-height: 22px;
  color: #3b2300;
`;
