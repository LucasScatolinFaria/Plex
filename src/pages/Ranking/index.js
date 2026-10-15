import { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Appear from "../../components/Appear";
import Avatar from "../../components/Avatar";
import Screen from "../../components/Screen";
import { AuthContext } from "../../contexts/auth";
import { ProgressContext } from "../../contexts/progress";
import { GUEST_AVATAR } from "../../data/avatars";
import { loadJSON } from "../../services/storage";
import { firstName } from "../../utils/helpers";
import { levelInfo, normalizeProgress, totalStars } from "../../utils/progress";
import { PageHint, PageTitle } from "../Achievements/style";
import {
  Crown,
  Hint,
  List,
  Pedestal,
  PedestalNumber,
  PlayerInfo,
  PlayerLevel,
  PlayerName,
  PlayerStars,
  Podium,
  PodiumName,
  PodiumSpot,
  PodiumStars,
  Position,
  Row,
} from "./style";

// ordem em que os três primeiros aparecem no pódio: 2º, 1º, 3º
const PODIUM = [
  { place: 2, height: 78, avatar: 58, colors: ["#E2E8F0", "#94A3B8"] },
  { place: 1, height: 108, avatar: 74, colors: ["#FFE27A", "#FFB020"] },
  { place: 3, height: 58, avatar: 52, colors: ["#FDBA74", "#C2703A"] },
];

// Os outros perfis salvos neste aparelho (o jogador atual vem do contexto, sempre atualizado).
async function loadOtherPlayers(user) {
  const users = await loadJSON("users", {});
  const accounts = Object.values(users).filter((account) => account.id !== user.id);
  const players = await Promise.all(
    accounts.map(async ({ id, name, avatar }) => ({
      id,
      name,
      avatar,
      progress: normalizeProgress(await loadJSON(`progress:${id}`)),
    }))
  );

  if (!user.guest) {
    const guestProgress = await loadJSON("progress:guest");
    if (guestProgress?.plays > 0) {
      players.push({
        id: "guest",
        name: "Visitante",
        avatar: GUEST_AVATAR.id,
        progress: normalizeProgress(guestProgress),
      });
    }
  }
  return players;
}

export default function Ranking() {
  const { user } = useContext(AuthContext);
  const { progress } = useContext(ProgressContext);
  const [others, setOthers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (user) {
        loadOtherPlayers(user).then((players) => {
          if (active) setOthers(players);
        });
      }
      return () => {
        active = false;
      };
    }, [user])
  );

  const players = useMemo(() => {
    if (!user) return [];
    const me = { id: user.id, name: user.name, avatar: user.avatar, progress, me: true };
    return [...others, me]
      .map((player) => ({
        ...player,
        stars: totalStars(player.progress),
        xp: player.progress.xp,
        level: levelInfo(player.progress.xp).level,
      }))
      .sort((a, b) => b.stars - a.stars || b.xp - a.xp);
  }, [others, user, progress]);

  return (
    <Screen maxWidth={720}>
      <PageTitle accessibilityRole="header">Ranking 🏅</PageTitle>
      <PageHint>Quem tem mais estrelas neste aparelho?</PageHint>

      <Podium>
        {PODIUM.map((spot, index) => {
          const player = players[spot.place - 1];
          return (
            <PodiumSpot key={spot.place}>
              {player ? (
                <Appear from="bottom" delay={250 + index * 150} style={{ alignItems: "center" }}>
                  {spot.place === 1 ? <Crown>👑</Crown> : null}
                  <Avatar id={player.avatar} size={spot.avatar} />
                  <PodiumName numberOfLines={1}>{player.me ? "Você" : firstName(player.name)}</PodiumName>
                  <PodiumStars>⭐ {player.stars}</PodiumStars>
                </Appear>
              ) : null}
              <Pedestal colors={spot.colors} style={{ height: spot.height, opacity: player ? 1 : 0.35 }}>
                <PedestalNumber>{spot.place}</PedestalNumber>
              </Pedestal>
            </PodiumSpot>
          );
        })}
      </Podium>

      <List>
        {players.map((player, index) => (
          <Appear key={player.id} from="left" delay={500 + index * 70}>
            <Row
              $me={player.me}
              accessibilityLabel={`${index + 1}º lugar: ${player.name}, ${player.stars} estrelas`}
            >
              <Position>{index + 1}</Position>
              <Avatar id={player.avatar} size={42} />
              <PlayerInfo>
                <PlayerName numberOfLines={1}>
                  {player.name}
                  {player.me ? " (você)" : ""}
                </PlayerName>
                <PlayerLevel>
                  Nível {player.level} · {player.xp} XP
                </PlayerLevel>
              </PlayerInfo>
              <PlayerStars>⭐ {player.stars}</PlayerStars>
            </Row>
          </Appear>
        ))}
      </List>

      {players.length < 2 ? (
        <Hint>
          Por enquanto só você está por aqui! Chame os amigos para criarem um perfil neste aparelho e
          disputarem o ranking com você. 🚀
        </Hint>
      ) : null}
    </Screen>
  );
}
