import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const Clue = styled.View`
  flex: 1;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  max-height: 190px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const ClueTag = styled.Text`
  position: absolute;
  top: 10px;
  left: 12px;
  padding: 3px 12px;
  border-radius: 12px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 13px;
  color: ${colors.white};
  background-color: #0fa37f;
`;

export const Hearts = styled.View`
  flex-direction: row;
  gap: 4px;
`;

export const Heart = styled.Text`
  font-size: 22px;
  line-height: 28px;
  opacity: ${({ $lost }) => ($lost ? 0.22 : 1)};
`;

export const Slots = styled.View`
  flex-direction: row;
  justify-content: center;
`;

export const Slot = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border-bottom-width: 4px;
  border-bottom-color: ${({ $missed }) => ($missed ? colors.coral : colors.yellow)};
  background-color: rgba(255, 255, 255, 0.16);
`;

export const SlotLetter = styled.Text`
  font-family: ${fonts.title};
  color: ${({ $missed }) => ($missed ? "#FFB4B4" : colors.white)};
`;

export const Status = styled.Text`
  height: 26px;
  font-family: ${fonts.heading};
  font-size: 18px;
  text-align: center;
  color: ${colors.white};
`;

export const Keyboard = styled.View`
  align-items: center;
`;

export const KeyRow = styled.View`
  flex-direction: row;
`;

export const Key = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border-bottom-width: 4px;
  background-color: ${({ $state }) =>
    $state === "hit" ? colors.green : $state === "miss" ? "rgba(255,255,255,0.14)" : colors.white};
  border-bottom-color: ${({ $state }) =>
    $state === "hit" ? "#15803D" : $state === "miss" ? "transparent" : "#CFC6F2"};
`;

export const KeyText = styled.Text`
  font-family: ${fonts.title};
  color: ${({ $state }) =>
    $state === "hit" ? colors.white : $state === "miss" ? "rgba(255,255,255,0.4)" : colors.ink};
`;
