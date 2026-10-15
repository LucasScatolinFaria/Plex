import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  justify-content: center;
  gap: 16px;
`;

export const Slate = styled.View`
  align-items: center;
  justify-content: center;
  padding: 18px;
  border-radius: 30px;
  background-color: ${colors.white};
`;

export const SlateHint = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colors.muted};
`;

export const Equation = styled.Text`
  font-family: ${fonts.title};
  text-align: center;
  color: ${colors.ink};
`;

export const Options = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

export const Option = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  border-bottom-width: 6px;
  opacity: ${({ $dim }) => ($dim ? 0.45 : 1)};
  background-color: ${({ $face }) => $face};
  border-bottom-color: ${({ $edge }) => $edge};
`;

export const OptionText = styled.Text`
  font-family: ${fonts.title};
  color: ${colors.white};
`;
