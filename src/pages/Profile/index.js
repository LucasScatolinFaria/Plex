import { useContext, useState } from "react";
import { Platform, Pressable, Switch, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Appear from "../../components/Appear";
import Avatar from "../../components/Avatar";
import AvatarPicker from "../../components/AvatarPicker";
import Button from "../../components/Button";
import Field from "../../components/Field";
import ProgressBar from "../../components/ProgressBar";
import Screen from "../../components/Screen";
import { AuthContext } from "../../contexts/auth";
import { ProgressContext } from "../../contexts/progress";
import { SettingsContext } from "../../contexts/settings";
import { ACHIEVEMENTS } from "../../data/achievements";
import { AVATARS } from "../../data/avatars";
import { GAMES, TOTAL_STARS, maxStars } from "../../data/games";
import { fx } from "../../services/feedback";
import { colors } from "../../theme";
import { currentStreak, gameStars, levelInfo, playsOf, totalStars } from "../../utils/progress";
import { Label } from "../SingUp/style";
import {
  Danger,
  DangerLink,
  DangerText,
  Editor,
  Email,
  LevelBox,
  LevelName,
  LevelRow,
  LevelXp,
  Name,
  Panel,
  PanelRow,
  ProfileCard,
  RowEmoji,
  RowHint,
  RowInfo,
  RowTitle,
  RowValue,
  SectionTitle,
  StatEmoji,
  StatLabel,
  StatTile,
  StatValue,
  StatsGrid,
} from "./style";

const SWITCH_COLORS = { false: "rgba(255,255,255,0.25)", true: colors.mint };
// no navegador a bolinha do Switch precisa da cor também quando está ligado
const WEB_SWITCH = Platform.OS === "web" ? { activeThumbColor: colors.white } : null;

function bestScore(progress, game) {
  const scores = Object.values(progress.byGame[game.id]?.bests || {}).map((best) => best.score);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export default function Profile() {
  const navigation = useNavigation();
  const { user, signOut, updateProfile } = useContext(AuthContext);
  const { progress, resetProgress } = useContext(ProgressContext);
  const { sound, vibration, effects, toggleSetting } = useContext(SettingsContext);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);

  if (!user) return null;

  const level = levelInfo(progress.xp);
  const unlocked = ACHIEVEMENTS.filter((achievement) => progress.achievements[achievement.id]).length;
  const stats = [
    { emoji: "🎮", value: progress.plays, label: "Partidas" },
    { emoji: "⭐", value: `${totalStars(progress)}/${TOTAL_STARS}`, label: "Estrelas" },
    { emoji: "🏆", value: `${unlocked}/${ACHIEVEMENTS.length}`, label: "Conquistas" },
    { emoji: "🔥", value: currentStreak(progress), label: "Dias seguidos" },
  ];

  function openEditor() {
    setName(user.name);
    setAvatar(user.avatar);
    setEditing(true);
  }

  async function saveProfile() {
    if (name.trim().length < 2) return;
    await updateProfile({ name: name.trim(), avatar });
    setEditing(false);
    fx("correct");
  }

  async function handleReset() {
    await resetProgress();
    setConfirmingReset(false);
  }

  return (
    <Screen maxWidth={720}>
      <Appear from="scale">
        <ProfileCard>
          <Avatar id={editing ? avatar : user.avatar} size={96} />
          <Name numberOfLines={1}>{user.name}</Name>
          <Email>{user.guest ? "Jogando como visitante" : user.email}</Email>

          <LevelBox>
            <LevelRow>
              <LevelName numberOfLines={1}>
                Nível {level.level} · {level.title}
              </LevelName>
              <LevelXp>
                {level.current}/{level.need} XP
              </LevelXp>
            </LevelRow>
            <ProgressBar value={level.ratio} />
          </LevelBox>

          {user.guest ? (
            <Button
              title="Guardar meu progresso"
              icon="sparkles"
              full
              onPress={() => navigation.navigate("SignUp")}
            />
          ) : editing ? null : (
            <Button title="Editar perfil" icon="create-outline" tone="ghost" size="sm" onPress={openEditor} />
          )}

          {editing ? (
            <Editor>
              <Label>Seu avatar</Label>
              <AvatarPicker avatars={AVATARS} value={avatar} onChange={setAvatar} size={44} />
              <Label>Seu nome</Label>
              <Field
                icon="person-outline"
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                maxLength={30}
                invalid={name.trim().length < 2}
                onSubmitEditing={saveProfile}
              />
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
                <Button title="Cancelar" tone="soft" size="sm" onPress={() => setEditing(false)} />
                <Button title="Salvar" icon="checkmark" tone="green" size="sm" onPress={saveProfile} />
              </View>
            </Editor>
          ) : null}
        </ProfileCard>
      </Appear>

      <StatsGrid>
        {stats.map((stat, index) => (
          <Appear key={stat.label} from="scale" delay={120 + index * 70} style={{ flex: 1, minWidth: 140 }}>
            <StatTile accessibilityLabel={`${stat.label}: ${stat.value}`}>
              <StatEmoji>{stat.emoji}</StatEmoji>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatTile>
          </Appear>
        ))}
      </StatsGrid>

      <SectionTitle accessibilityRole="header">Meus recordes</SectionTitle>
      <Panel>
        {GAMES.map((game, index) => {
          const best = bestScore(progress, game);
          return (
            <Pressable
              key={game.id}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${game.title}`}
              onPress={() => navigation.navigate(game.route)}
            >
              <PanelRow $first={index === 0}>
                <RowEmoji>{game.emoji}</RowEmoji>
                <RowInfo>
                  <RowTitle>{game.title}</RowTitle>
                  <RowHint>
                    ⭐ {gameStars(progress, game)}/{maxStars(game)} · {playsOf(progress, game.id)} partidas
                  </RowHint>
                </RowInfo>
                <RowValue>{best === null ? "—" : `${best} pts`}</RowValue>
                <Ionicons name="chevron-forward" size={18} color={colors.lilac} />
              </PanelRow>
            </Pressable>
          );
        })}
      </Panel>

      <SectionTitle accessibilityRole="header">Configurações</SectionTitle>
      <Panel>
        <PanelRow $first>
          <RowEmoji>🔊</RowEmoji>
          <RowInfo>
            <RowTitle>Sons</RowTitle>
            <RowHint>Efeitos sonoros dos jogos</RowHint>
          </RowInfo>
          <Switch
            accessibilityLabel="Sons"
            value={sound}
            onValueChange={() => toggleSetting("sound")}
            trackColor={SWITCH_COLORS}
            thumbColor={colors.white}
            {...WEB_SWITCH}
          />
        </PanelRow>
        <PanelRow>
          <RowEmoji>✨</RowEmoji>
          <RowInfo>
            <RowTitle>Efeitos animados</RowTitle>
            <RowHint>Confete, estrelas piscando e brilhos</RowHint>
          </RowInfo>
          <Switch
            accessibilityLabel="Efeitos animados"
            value={effects}
            onValueChange={() => toggleSetting("effects")}
            trackColor={SWITCH_COLORS}
            thumbColor={colors.white}
            {...WEB_SWITCH}
          />
        </PanelRow>
        {Platform.OS === "web" ? null : (
          <PanelRow>
            <RowEmoji>📳</RowEmoji>
            <RowInfo>
              <RowTitle>Vibração</RowTitle>
              <RowHint>Vibra nos acertos e nos erros</RowHint>
            </RowInfo>
            <Switch
              accessibilityLabel="Vibração"
              value={vibration}
              onValueChange={() => toggleSetting("vibration")}
              trackColor={SWITCH_COLORS}
              thumbColor={colors.white}
            />
          </PanelRow>
        )}
      </Panel>

      <Danger>
        {confirmingExit ? (
          <>
            <DangerText>
              Quem sai do visitante não consegue voltar para ele depois: as estrelas ficam só no ranking. Para
              guardar o progresso, toque em "Guardar meu progresso".
            </DangerText>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Cancelar" tone="white" size="sm" onPress={() => setConfirmingExit(false)} />
              <Button title="Sair mesmo assim" icon="log-out-outline" tone="red" size="sm" onPress={signOut} />
            </View>
          </>
        ) : (
          <Button
            title="Sair da conta"
            icon="log-out-outline"
            tone="red"
            // o visitante não tem como entrar de novo, então ele confirma antes de sair
            onPress={user.guest ? () => setConfirmingExit(true) : signOut}
          />
        )}
        {confirmingReset ? (
          <>
            <DangerText>
              Tem certeza? Isso apaga suas estrelas, recordes e conquistas, e não dá para desfazer.
            </DangerText>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Cancelar" tone="white" size="sm" onPress={() => setConfirmingReset(false)} />
              <Button title="Sim, apagar" icon="trash-outline" tone="red" size="sm" onPress={handleReset} />
            </View>
          </>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setConfirmingReset(true)}>
            <DangerLink>Apagar meu progresso</DangerLink>
          </Pressable>
        )}
      </Danger>
    </Screen>
  );
}
