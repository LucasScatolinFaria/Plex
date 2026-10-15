import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  justify-content: space-between;
  gap: 12px;
`;

export const Sheet = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

export const Notes = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 64px;
`;

export const NoteBubble = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border-width: 3px;
  border-color: ${({ $color }) => $color};
  background-color: ${({ $far, $color }) => ($far ? colors.white : $color)};
`;

export const NoteName = styled.Text`
  font-family: ${fonts.title};
  color: ${({ $far }) => ($far ? colors.ink : colors.white)};
`;

export const Keyboard = styled.View`
  border-radius: 14px;
  background-color: #1e1b4b;
  user-select: none;
`;

export const WhiteKey = styled.View`
  position: absolute;
  top: 0;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 8px;
  border-width: 1.5px;
  border-color: #b9b4d6;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background-color: ${({ $down, $next, $wrong }) =>
    $wrong ? "#FECACA" : $down ? "#DDD6FE" : $next ? "#FEF3C7" : colors.white};
`;

export const BlackKey = styled.View`
  position: absolute;
  top: 0;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6px;
  border-bottom-left-radius: 7px;
  border-bottom-right-radius: 7px;
  background-color: ${({ $down, $next, $wrong }) =>
    $wrong ? "#EF4444" : $down ? "#6D28D9" : $next ? "#F59E0B" : "#1E1B4B"};
`;

export const KeyTag = styled.Text`
  min-width: 26px;
  padding: 2px 3px;
  border-radius: 8px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 12px;
  text-align: center;
  color: ${colors.white};
  background-color: ${({ $color }) => $color};
`;

export const KeyLetter = styled.Text`
  margin-top: 3px;
  font-family: ${fonts.body};
  font-size: 11px;
  color: ${({ $light }) => ($light ? "#C4B5FD" : colors.muted)};
`;

export const Finger = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;
