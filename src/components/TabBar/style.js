import { Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

// transições de CSS só existem no navegador
const webOnly = (css) => (Platform.OS === "web" ? css : "");

export const BottomWrap = styled.View`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  padding: 0 16px;
`;

export const BottomPill = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  max-width: 460px;
  height: 72px;
  padding: 0 8px;
  border-radius: 28px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: ${({ $jes }) => ($jes ? "rgba(5, 32, 18, 0.96)" : "rgba(30, 16, 92, 0.96)")};
`;

export const Bubble = styled(Animated.View)`
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background-color: ${colors.yellow};
`;

export const ItemLabel = styled.Text`
  margin-top: ${({ $top }) => ($top ? 0 : 8)}px;
  font-family: ${fonts.heading};
  font-size: ${({ $top }) => ($top ? 16 : 12)}px;
  color: ${({ $focused, $top }) => ($focused ? ($top ? "#4a2500" : colors.yellow) : colors.lilac)};
  ${webOnly("transition-property: color; transition-duration: 250ms;")}
`;

export const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 28px 10px;
  background-color: ${({ $jes }) => ($jes ? jes.bar : "#1b0e52")};
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.12);
`;

export const BrandRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

export const Brand = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

// selo do logo do JES Kids (no SESI Kids é a foto do Bip)
export const BallBadge = styled(LinearGradient)`
  width: 38px;
  height: 38px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
`;

// a aba que troca de site, ao lado do logo
export const ModePill = styled(LinearGradient)`
  flex-direction: row;
  align-items: center;
  gap: 7px;
  height: 40px;
  padding: 0 16px 0 10px;
  border-radius: 20px;
  border-width: 1.5px;
  border-color: rgba(255, 255, 255, 0.35);
  overflow: hidden;
`;

export const ModeLabel = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  letter-spacing: 0.3px;
  color: ${colors.white};
`;

export const RightRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const IconButton = styled.View`
  width: 42px;
  height: 42px;
  border-radius: 21px;
  align-items: center;
  justify-content: center;
  background-color: ${colors.glass};
  border-width: 1.5px;
  border-color: ${colors.glassLine};
`;

export const SignInChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 42px;
  padding: 0 18px;
  border-radius: 21px;
  background-color: ${colors.yellow};
`;

export const SignInText = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: #4a2500;
`;

// botão redondo do meio da barra do celular (troca de site); fica mais alto que os outros
export const CenterSlot = styled.View`
  width: 76px;
  align-items: center;
  margin-top: -30px;
`;

export const CenterCircle = styled(LinearGradient)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  border-width: 4px;
  border-color: ${({ $jes }) => ($jes ? "#052012" : "#1e105c")};
`;

export const TopItems = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

// pílula amarela que desliza até a aba escolhida (left e width são animados)
export const TopPill = styled(Animated.View)`
  position: absolute;
  top: 0;
  height: 42px;
  border-radius: 21px;
  background-color: ${colors.yellow};
`;

export const TopItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 ${({ $compact }) => ($compact ? 12 : 18)}px;
  border-radius: 21px;
  background-color: ${({ $hovered }) => ($hovered ? "rgba(255, 255, 255, 0.12)" : "transparent")};
  ${webOnly("transition-property: background-color; transition-duration: 200ms;")}
`;

export const UserChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 4px;
  border-radius: 24px;
  background-color: ${colors.glass};
  border-width: 1.5px;
  border-color: ${colors.glassLine};
`;

export const UserName = styled.Text`
  max-width: 120px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const UserStars = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.yellow};
`;
