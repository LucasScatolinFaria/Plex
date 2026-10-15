import { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import Appear from "../../components/Appear";
import Avatar from "../../components/Avatar";
import Screen from "../../components/Screen";
import { AuthContext } from "../../contexts/auth";
import { ProgressContext } from "../../contexts/progress";
import { RANKING_SIZE, fetchRanking } from "../../services/players";
import { firstName } from "../../utils/helpers";
import { levelInfo, totalStars } from "../../utils/progress";
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

// Ranking online: quem tem conta disputa com quem tem conta, e visitante com visitante.
export default function Ranking() {
  const { user } = useContext(AuthContext);
  const { progress } = useContext(ProgressContext);
  const [others, setOthers] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "offline"
  const userId = user?.id;
  const guest = !!user?.guest;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (userId) {
        fetchRanking(guest).then(
          (entries) => {
            if (!active) return;
            setOthers(entries.filter((entry) => entry.id !== userId));
            setStatus("ready");
          },
          () => {
            if (active) setStatus("offline");
          }
        );
      }
      return () => {
        active = false;
      };
    }, [userId, guest])
  );

  // o jogador atual vem do contexto, sempre atualizado (a partida que acabou de jogar já conta)
  const players = useMemo(() => {
    if (!user) return [];
    const me = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      stars: totalStars(progress),
      xp: progress.xp,
      me: true,
    };
    return [...others, me]
      .map((player) => ({ ...player, level: levelInfo(player.xp).level }))
      .sort((a, b) => b.stars - a.stars || b.xp - a.xp);
  }, [others, user, progress]);

  // quem ficou fora dos primeiros colocados aparece no fim, sem a posição exata
  const outsideTop = others.length >= RANKING_SIZE && players[players.length - 1]?.me;

  return (
    <Screen maxWidth={720}>
      <PageTitle accessibilityRole="header">{guest ? "Ranking dos visitantes 🏅" : "Ranking 🏅"}</PageTitle>
      <PageHint>
        {guest ? "Quem tem mais estrelas entre os visitantes?" : "Quem tem mais estrelas entre os jogadores com conta?"}
      </PageHint>

      {status === "loading" ? null : (
        <>
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
            {players.map((player, index) => {
              const position = player.me && outsideTop ? `${RANKING_SIZE}+` : index + 1;
              return (
                <Appear key={player.id} from="left" delay={500 + Math.min(index, 12) * 70}>
                  <Row
                    $me={player.me}
                    accessibilityLabel={`${position}º lugar: ${player.name}, ${player.stars} estrelas`}
                  >
                    <Position>{position}</Position>
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
              );
            })}
          </List>
        </>
      )}

      {status === "offline" ? (
        <Hint>Sem internet agora: o ranking completo aparece quando a conexão voltar. 📡</Hint>
      ) : status === "ready" && players.length < 2 ? (
        <Hint>Por enquanto só você está por aqui! Chame os amigos para jogar e disputar o ranking com você. 🚀</Hint>
      ) : null}
    </Screen>
  );
}
