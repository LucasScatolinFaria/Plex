import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  margin-bottom: 12px;
`;

export const Pill = styled.View`
  flex: 1;
  max-width: 170px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  padding: 0 10px;
  border-radius: 18px;
  background-color: ${colors.glassStrong};
  border-width: 1.5px;
  border-color: ${colors.glassLine};
`;

export const PillIcon = styled.Text`
  font-size: 20px;
  line-height: 26px;
`;

export const PillValue = styled.Text`
  font-family: ${fonts.title};
  font-size: 19px;
  line-height: 22px;
  color: ${colors.white};
`;

export const PillLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 11px;
  line-height: 13px;
  color: ${colors.textSoft};
`;
