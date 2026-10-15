import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const QuestionCard = styled.View`
  padding: 20px 18px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const QuestionTag = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colors.muted};
`;

export const QuestionText = styled.Text`
  margin-top: 4px;
  font-family: ${fonts.title};
  font-size: 23px;
  line-height: 29px;
  color: ${colors.ink};
`;

export const Options = styled.View`
  gap: 10px;
  margin-top: 14px;
`;

export const Option = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 8px 14px;
  border-radius: 20px;
  border-width: 2.5px;
  opacity: ${({ $state }) => ($state === "dim" ? 0.55 : 1)};
  border-color: ${({ $state }) =>
    $state === "right" ? colors.green : $state === "wrong" ? colors.danger : "transparent"};
  background-color: ${({ $state }) =>
    $state === "right" ? "#DCFCE7" : $state === "wrong" ? "#FEE2E2" : colors.white};
`;

export const OptionLetter = styled.Text`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 17px;
  line-height: 34px;
  text-align: center;
  color: ${colors.white};
  background-color: ${({ $color }) => $color};
`;

export const OptionText = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 18px;
  line-height: 23px;
  color: ${colors.ink};
`;

export const Fact = styled.View`
  gap: 4px;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 22px;
  background-color: #fff3c4;
`;

export const FactTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: #8a4b00;
`;

export const FactText = styled.Text`
  font-family: ${fonts.body};
  font-size: 16px;
  line-height: 22px;
  color: #4a2500;
`;
