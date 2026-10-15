import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Clue = styled.View`
  flex: 1;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  max-height: 200px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Slot = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border-width: 3px;
  border-style: ${({ $filled }) => ($filled ? "solid" : "dashed")};
  border-color: ${({ $state }) =>
    $state === "right" ? colors.green : $state === "wrong" ? colors.coral : "rgba(255,255,255,0.7)"};
  background-color: ${({ $filled, $state }) =>
    $state === "right" ? "#DCFCE7" : $filled ? colors.white : "rgba(255,255,255,0.14)"};
`;

export const Piece = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border-bottom-width: 5px;
  opacity: ${({ $used }) => ($used ? 0.25 : 1)};
  background-color: ${colors.yellow};
  border-bottom-color: #d99a00;
`;

export const PieceText = styled.Text`
  font-family: ${fonts.title};
  color: ${colors.ink};
`;

export const Status = styled.Text`
  min-height: 26px;
  font-family: ${fonts.heading};
  font-size: 18px;
  text-align: center;
  color: ${colors.white};
`;
