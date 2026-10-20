import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

export const FilterLabel = styled.Text`
  margin: 12px 0 8px;
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1px;
  color: ${jes.muted};
`;

export const DayHeader = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: 10px;
  margin: 26px 0 12px;
  padding-bottom: 8px;
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.12);
`;

export const DayTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${({ $today }) => ($today ? colors.yellow : colors.white)};
`;

export const DayDate = styled.Text`
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${jes.muted};
`;

export const DayCount = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${jes.muted};
`;
