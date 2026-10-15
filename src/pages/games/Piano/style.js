import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  justify-content: space-between;
  gap: 12px;
`;

// partitura: fica no meio, sem esticar demais no computador
export const Sheet = styled.View`
  flex: 1;
  align-self: center;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 820px;
  min-height: 150px;
  padding: 14px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const SongTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 20px;
  text-align: center;
  color: ${colors.ink};
`;

export const Hint = styled.Text`
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: ${colors.inkSoft};
`;

// as próximas notas, cada uma como a tecla do computador que toca ela
export const Caps = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  min-height: 74px;
`;

export const Cap = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border-width: 3px;
  border-bottom-width: 6px;
  border-color: ${({ $color }) => $color};
  background-color: ${({ $current, $color }) => ($current ? $color : colors.white)};
`;

export const CapLetter = styled.Text`
  font-family: ${fonts.title};
  color: ${({ $current }) => ($current ? colors.white : colors.ink)};
`;

export const CapName = styled.Text`
  margin-top: -2px;
  font-family: ${fonts.body};
  font-size: 11px;
  color: ${({ $current }) => ($current ? "rgba(255,255,255,0.9)" : colors.muted)};
`;

// a partitura inteira em letras, como nos pianos do Roblox
export const SheetLine = styled.Text`
  max-width: 760px;
  font-family: ${fonts.heading};
  font-size: 17px;
  line-height: 26px;
  letter-spacing: 1px;
  text-align: center;
  color: ${colors.ink};
`;

export const Buttons = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

export const Housing = styled(LinearGradient)`
  align-self: center;
  padding: 0 10px 12px;
  border-radius: 20px;
  border-width: 1.5px;
  border-color: rgba(255, 255, 255, 0.18);
`;

export const HousingBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 46px;
`;

export const HousingTitle = styled.Text`
  flex: 1;
  font-family: ${fonts.title};
  font-size: 15px;
  letter-spacing: 0.5px;
  text-align: center;
  color: ${colors.lilac};
`;

export const RangeText = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${colors.textSoft};
`;

export const Arrow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  background-color: ${({ $disabled }) => ($disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.16)")};
`;

export const ArrowText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 13px;
  color: ${colors.white};
`;

export const Keys = styled.View`
  user-select: none;
`;

const keyMotion = Platform.OS === "web" ? "transition-property: background-color, transform; transition-duration: 70ms;" : "";

export const WhiteKey = styled.View`
  position: absolute;
  top: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding-bottom: 8px;
  border-width: 1px;
  border-color: #b9b4d6;
  border-bottom-width: 5px;
  border-bottom-color: ${({ $down }) => ($down ? "#b9b4d6" : "#d8d3ee")};
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
  background-color: ${({ $down, $next, $wrong, $color }) =>
    $wrong ? "#FECACA" : $down ? $color : $next ? "#FEF3C7" : colors.white};
  ${keyMotion}
`;

export const BlackKey = styled.View`
  position: absolute;
  top: 0;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6px;
  border-width: 1.5px;
  border-top-width: 0;
  border-color: #0b0920;
  border-bottom-width: 6px;
  border-bottom-color: ${({ $down }) => ($down ? "#0b0920" : "#3a3470")};
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  background-color: ${({ $down, $next, $wrong, $color }) =>
    $wrong ? "#EF4444" : $down ? $color : $next ? "#F59E0B" : "#1E1B4B"};
  ${keyMotion}
`;

export const KeyTag = styled.Text`
  min-width: 24px;
  padding: 1px 3px;
  border-radius: 7px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 11px;
  text-align: center;
  color: ${colors.white};
  background-color: ${({ $color }) => $color};
`;

// a letra do teclado do computador, desenhada como uma teclinha
export const KeyLetter = styled.Text`
  min-width: 20px;
  padding: 1px 4px;
  border-radius: 6px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: ${({ $small }) => ($small ? 12 : 14)}px;
  text-align: center;
  color: ${({ $light }) => ($light ? "#E9E5FF" : colors.ink)};
  background-color: ${({ $light }) => ($light ? "rgba(255,255,255,0.14)" : "#EFEDF9")};
`;

export const Finger = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;
