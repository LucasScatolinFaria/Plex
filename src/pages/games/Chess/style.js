import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const Banner = styled.View`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 70px;
`;

export const Speech = styled.Text`
  flex-shrink: 1;
  padding: 9px 15px;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 16px;
  line-height: 21px;
  color: ${colors.ink};
  background-color: ${colors.white};
`;

// moldura de madeira roxa em volta das casas
export const Frame = styled.View`
  padding: 8px;
  border-radius: 22px;
  background-color: #2e1a78;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.25);
`;

export const Squares = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 12px;
  overflow: hidden;
`;

export const Coordinate = styled.Text`
  position: absolute;
  font-family: ${fonts.strong};
  font-size: 10px;
  color: ${({ $light }) => ($light ? "#6D5BD0" : "#F3EEFF")};
`;

export const Captured = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: stretch;
  justify-content: center;
  gap: 2px;
  height: 26px;
`;

export const CapturedLead = styled.Text`
  margin-left: 6px;
  font-family: ${fonts.title};
  font-size: 14px;
  color: ${colors.yellow};
`;

export const PromotionOverlay = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background-color: rgba(20, 8, 70, 0.72);
`;

export const PromotionCard = styled.View`
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 24px;
  background-color: ${colors.white};
`;

export const PromotionTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.ink};
`;

export const PromotionChoices = styled.View`
  flex-direction: row;
  gap: 8px;
`;

export const PromotionChoice = styled.View`
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 70px;
  border-radius: 16px;
  background-color: #ede7ff;
`;

export const ChoiceLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 11px;
  color: ${colors.inkSoft};
`;
