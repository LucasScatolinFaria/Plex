import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  justify-content: space-between;
  gap: 12px;
`;

export const Shelf = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const ItemName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 19px;
  color: ${colors.ink};
`;

export const PriceTag = styled.Text`
  align-self: flex-start;
  margin-top: 4px;
  padding: 4px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 26px;
  color: #451a03;
  background-color: ${colors.yellow};
`;

export const Tray = styled.View`
  flex: 1;
  min-height: 110px;
  padding: 12px;
  border-radius: 26px;
  border-width: 3px;
  border-style: dashed;
  border-color: ${({ $state }) =>
    $state === "paid" ? colors.lime : $state === "over" ? colors.coral : "rgba(255,255,255,0.6)"};
  background-color: rgba(255, 255, 255, 0.12);
`;

export const TrayTitle = styled.Text`
  font-family: ${fonts.heading};
  font-size: 16px;
  text-align: center;
  color: ${colors.white};
`;

export const Coins = styled.View`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
  gap: 8px;
  margin-top: 8px;
`;

export const Total = styled.Text`
  font-family: ${fonts.title};
  font-size: 24px;
  text-align: center;
  color: ${({ $state }) => ($state === "paid" ? colors.lime : $state === "over" ? "#FFB4B4" : colors.white)};
`;

export const Wallet = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

export const CoinFace = styled.View`
  align-items: center;
  justify-content: center;
  border-width: 3px;
  background-color: ${({ $face }) => $face};
  border-color: ${({ $edge }) => $edge};
`;

export const CoinValue = styled.Text`
  font-family: ${fonts.title};
  color: ${({ $color }) => $color};
`;

export const CoinUnit = styled.Text`
  margin-top: -3px;
  font-family: ${fonts.body};
  color: ${({ $color }) => $color};
`;
