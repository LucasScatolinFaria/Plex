import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Phase = styled.View`
  align-self: center;
  width: 100%;
  max-width: 600px;
  gap: 12px;
`;

export const RoundTag = styled.Text`
  align-self: center;
  padding: 4px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
  background-color: rgba(255, 255, 255, 0.16);
`;

export const QuestionCard = styled.View`
  align-items: center;
  gap: 10px;
  padding: 20px 18px;
  border-radius: 26px;
  background-color: ${colors.white};
`;

export const QuestionText = styled.Text`
  font-family: ${fonts.title};
  font-size: 24px;
  line-height: 31px;
  text-align: center;
  color: ${colors.ink};
`;

export const Hint = styled.Text`
  font-family: ${fonts.text};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${({ $dark }) => ($dark ? colors.inkSoft : colors.textSoft)};
`;

export const GuessRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  align-self: stretch;
`;

export const GuessInput = styled.TextInput`
  flex: 1;
  min-width: 0;
  height: 62px;
  padding: 0 16px;
  border-radius: 20px;
  border-width: 3px;
  border-color: ${colors.violet};
  background-color: ${colors.cloud};
  font-family: ${fonts.title};
  font-size: 30px;
  text-align: center;
  color: ${colors.ink};
`;

export const Faces = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

export const Face = styled.View`
  align-items: center;
  width: 70px;
  opacity: ${({ $dim }) => ($dim ? 0.45 : 1)};
`;

export const FaceName = styled.Text`
  max-width: 70px;
  margin-top: 2px;
  font-family: ${fonts.heading};
  font-size: 12px;
  text-align: center;
  color: ${colors.white};
`;

export const Check = styled.Text`
  position: absolute;
  top: -4px;
  right: 6px;
  font-size: 18px;
  line-height: 22px;
`;

export const RightAnswer = styled.View`
  align-items: center;
  padding: 12px 18px;
  border-radius: 22px;
  background-color: ${colors.green};
`;

export const RightLabel = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: #ecfdf5;
`;

export const RightValue = styled.Text`
  font-family: ${fonts.title};
  font-size: 40px;
  color: ${colors.white};
`;

export const Rows = styled.View`
  gap: 8px;
`;

// um chute na lista: amarelo para o mais longe; $mine marca o meu
export const GuessCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 18px;
  border-width: 2.5px;
  border-color: ${({ $far, $mine }) => ($far ? colors.yellow : $mine ? colors.lilac : "transparent")};
  background-color: ${({ $far }) => ($far ? "rgba(255,210,63,0.2)" : colors.glass)};
`;

export const GuessValue = styled.Text`
  min-width: 90px;
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const GuessInfo = styled.Text`
  flex: 1;
  font-family: ${fonts.text};
  font-size: 14px;
  color: ${colors.textSoft};
`;

export const Gain = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.yellow};
`;

export const Choices = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

export const Choice = styled.View`
  align-items: center;
  gap: 4px;
  width: 104px;
  padding: 10px 6px;
  border-radius: 20px;
  border-width: 3px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : "transparent")};
  background-color: ${({ $selected }) => ($selected ? "rgba(255,210,63,0.22)" : colors.glassStrong)};
`;

export const ChoiceName = styled.Text`
  max-width: 96px;
  font-family: ${fonts.heading};
  font-size: 14px;
  text-align: center;
  color: ${colors.white};
`;

export const Secret = styled.Text`
  padding: 10px 14px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: #3b2300;
  background-color: ${colors.yellow};
`;

export const Verdict = styled.View`
  align-items: center;
  gap: 6px;
  padding: 16px;
  border-radius: 24px;
  background-color: ${colors.white};
`;

export const VerdictTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  text-align: center;
  color: ${colors.ink};
`;

export const Fact = styled.Text`
  padding: 10px 14px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.text};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${colors.ink};
  background-color: #e0f2fe;
`;

export const ScoreRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${({ $me }) => ($me ? "rgba(255,210,63,0.18)" : "rgba(255,255,255,0.08)")};
`;

export const ScorePlace = styled.Text`
  width: 26px;
  font-family: ${fonts.title};
  font-size: 17px;
  text-align: center;
  color: ${colors.white};
`;

export const ScoreName = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.white};
`;

export const ScorePoints = styled.Text`
  font-family: ${fonts.title};
  font-size: 17px;
  color: ${colors.yellow};
`;
