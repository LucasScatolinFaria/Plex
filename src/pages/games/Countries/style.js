import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";
import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

/* ---------- peças comuns ---------- */

export const Panel = styled.View`
  padding: 14px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: rgba(10, 20, 60, 0.55);
`;

export const MapBox = styled.View`
  padding: 6px;
  border-radius: 22px;
  overflow: hidden;
  background-color: #0b2d5c;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.25);
`;

export const InputRow = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const InputBox = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 16px;
  border-radius: 20px;
  border-width: 3px;
  border-color: ${({ $active }) => ($active ? colors.yellow : "rgba(255,255,255,0.4)")};
  background-color: ${({ $disabled }) => ($disabled ? "rgba(255,255,255,0.55)" : colors.white)};
`;

export const Input = styled.TextInput`
  flex: 1;
  height: 100%;
  min-width: 0;
  font-family: ${fonts.heading};
  font-size: 21px;
  color: ${colors.ink};
`;

export const SendButton = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $disabled }) => ($disabled ? "rgba(255,255,255,0.25)" : colors.green)};
`;

export const FeedbackChip = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 18px;
  background-color: ${({ $color }) => $color};
`;

export const FeedbackText = styled.Text`
  flex-shrink: 1;
  font-family: ${fonts.title};
  font-size: 17px;
  color: ${({ $dark }) => ($dark ? "#3b2300" : colors.white)};
`;

export const Continents = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const ContinentChip = styled.View`
  flex-grow: 1;
  min-width: 150px;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.1);
`;

export const ContinentName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
`;

export const ChipsWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

export const CountryChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 5px;
  border-radius: 14px;
  background-color: ${({ $color }) => $color || "rgba(255,255,255,0.14)"};
`;

export const CountryName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
`;

export const SectionLabel = styled.Text`
  margin: 14px 0 8px;
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const Muted = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  line-height: 20px;
  color: ${colors.textSoft};
`;

/* ---------- treino ---------- */

export const TopBar = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
`;

export const Pill = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 46px;
  padding: 0 14px;
  border-radius: 18px;
  border-width: 1.5px;
  border-color: ${({ $alert }) => ($alert ? colors.coral : colors.glassLine)};
  background-color: ${({ $alert }) => ($alert ? "rgba(255,107,107,0.3)" : colors.glassStrong)};
`;

export const PillText = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.white};
`;

export const HintCard = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 18px;
  background-color: ${colors.yellow};
`;

export const HintText = styled.Text`
  flex: 1;
  font-family: ${fonts.heading};
  font-size: 15px;
  line-height: 20px;
  color: #3b2300;
`;

/* ---------- online ---------- */

export const Card = styled.View`
  align-self: center;
  width: 100%;
  max-width: 560px;
  align-items: center;
  gap: 12px;
  padding: 22px 18px;
  border-radius: 30px;
  background-color: ${colors.white};
`;

export const CardTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 26px;
  text-align: center;
  color: ${colors.ink};
`;

export const CardText = styled.Text`
  font-family: ${fonts.text};
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: ${colors.inkSoft};
`;

export const Divider = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${colors.muted};
`;

export const CodeRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 8px;
`;

export const CodeTile = styled(LinearGradient)`
  width: 58px;
  height: 68px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

export const CodeLetter = styled.Text`
  font-family: ${fonts.title};
  font-size: 38px;
  color: ${colors.white};
`;

export const CodeInput = styled.TextInput`
  width: 220px;
  height: 60px;
  border-radius: 18px;
  border-width: 3px;
  border-color: ${colors.violet};
  background-color: ${colors.cloud};
  font-family: ${fonts.title};
  font-size: 30px;
  letter-spacing: 10px;
  text-align: center;
  color: ${colors.ink};
`;

export const ErrorText = styled.Text`
  align-self: stretch;
  padding: 10px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  text-align: center;
  color: #b91c1c;
  background-color: #fee2e2;
`;

export const Players = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

export const PlayerCard = styled.View`
  align-items: center;
  gap: 4px;
  width: 92px;
  padding: 10px 4px;
  border-radius: 18px;
  background-color: ${({ $me }) => ($me ? "#fff8dc" : colors.cloud)};
  border-width: 2px;
  border-color: ${({ $me }) => ($me ? colors.yellow : "transparent")};
`;

export const PlayerName = styled.Text`
  font-family: ${fonts.heading};
  font-size: 13px;
  text-align: center;
  color: ${colors.ink};
`;

export const Speeds = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

export const SpeedChip = styled.View`
  align-items: center;
  min-width: 96px;
  padding: 8px 12px;
  border-radius: 16px;
  border-width: 2.5px;
  border-color: ${({ $selected }) => ($selected ? colors.violet : colors.line)};
  background-color: ${({ $selected }) => ($selected ? colors.cloud : colors.white)};
`;

export const SpeedLabel = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.ink};
`;

// roda de jogadores com a batata no meio
export const Ring = styled.View`
  align-self: center;
`;

export const Seat = styled.View`
  position: absolute;
  align-items: center;
  width: 96px;
`;

export const SeatName = styled.Text`
  max-width: 96px;
  margin-top: 2px;
  padding: 1px 8px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 13px;
  text-align: center;
  color: ${({ $turn }) => ($turn ? "#3b2300" : colors.white)};
  background-color: ${({ $turn }) => ($turn ? colors.yellow : "rgba(0,0,0,0.35)")};
`;

export const Hearts = styled.Text`
  font-size: 12px;
  line-height: 16px;
`;

export const Center = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
`;

export const Seconds = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${({ $hot }) => ($hot ? "#FF6B6B" : colors.white)};
`;

export const TurnBanner = styled.Text`
  align-self: center;
  margin: 6px 0 10px;
  padding: 6px 16px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 18px;
  text-align: center;
  color: ${({ $mine }) => ($mine ? "#3b2300" : colors.white)};
  background-color: ${({ $mine }) => ($mine ? colors.yellow : "rgba(255,255,255,0.16)")};
`;

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  background-color: rgba(16, 8, 50, 0.72);
`;

export const BigText = styled.Text`
  font-family: ${fonts.title};
  font-size: 40px;
  text-align: center;
  color: ${colors.yellow};
`;

export const OverlayText = styled.Text`
  margin-top: 6px;
  font-family: ${fonts.heading};
  font-size: 20px;
  text-align: center;
  color: ${colors.white};
`;
