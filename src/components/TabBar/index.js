import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import Avatar from "../Avatar";
import Bouncy from "../Bouncy";
import Float from "../Float";
import JesLogo from "../JesLogo";
import Logo from "../Logo";
import Shine from "../Shine";
import { AuthContext } from "../../contexts/auth";
import { ModeContext } from "../../contexts/mode";
import { ProgressContext } from "../../contexts/progress";
import useLayout from "../../hooks/useLayout";
import { colors, jes, jesGradients, nativeDriver, shadow } from "../../theme";
import { firstName } from "../../utils/helpers";
import { totalStars } from "../../utils/progress";
import {
  BallBadge,
  BottomPill,
  BottomWrap,
  Brand,
  BrandRow,
  Bubble,
  CenterCircle,
  CenterSlot,
  IconButton,
  ItemLabel,
  ModeLabel,
  ModePill,
  RightRow,
  SignInChip,
  SignInText,
  TopBar,
  TopItem,
  TopItems,
  TopPill,
  UserChip,
  UserName,
  UserStars,
} from "./style";

const ICONS = {
  Home: "game-controller",
  Achievements: "trophy",
  Ranking: "podium",
  Profile: "person",
  JesLive: "radio",
  JesSchedule: "calendar",
  JesStandings: "trophy",
  JesSports: "basketball",
};

const LOGO_BIP = require("../../../assets/logo-bip.png");
const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

function BottomItem({ icon, label, focused, onPress }) {
  const active = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(active, {
      toValue: focused ? 1 : 0,
      friction: 5,
      tension: 140,
      useNativeDriver: nativeDriver,
    }).start();
  }, [active, focused]);

  const lift = active.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  return (
    <Bouncy
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={{ flex: 1 }}
      contentStyle={{ alignItems: "center" }}
    >
      <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ translateY: lift }] }}>
        <Bubble style={{ opacity: active, transform: [{ scale: active }] }} />
        <Ionicons name={icon} size={24} color={focused ? "#4A2500" : colors.lilac} />
      </Animated.View>
      <ItemLabel $focused={focused} numberOfLines={1}>
        {label}
      </ItemLabel>
    </Bouncy>
  );
}

// Menu do topo: a pílula amarela desliza até a aba escolhida.
function TopTabs({ tabs, compact }) {
  const [frames, setFrames] = useState({});
  const [hovered, setHovered] = useState(null);
  const left = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  const focused = tabs.find((tab) => tab.focused);
  const frame = focused ? frames[focused.key] : null;

  useEffect(() => {
    if (!frame) return undefined;
    // na primeira vez a pílula já nasce no lugar certo
    if (!placed.current) {
      placed.current = true;
      left.setValue(frame.x);
      width.setValue(frame.width);
      return undefined;
    }
    const spring = (value, toValue) =>
      Animated.spring(value, { toValue, friction: 8, tension: 80, useNativeDriver: false });
    const animation = Animated.parallel([spring(left, frame.x), spring(width, frame.width)]);
    animation.start();
    return () => animation.stop();
  }, [frame, left, width]);

  function measure(key, event) {
    const { x, width: itemWidth } = event.nativeEvent.layout;
    setFrames((current) =>
      current[key]?.x === x && current[key]?.width === itemWidth ? current : { ...current, [key]: { x, width: itemWidth } }
    );
  }

  return (
    <TopItems accessibilityRole="tablist">
      {frame ? <TopPill style={[{ width, left }, shadow(4, 14, "rgba(255,210,63,0.35)")]} /> : null}
      {tabs.map((tab) => (
        <Bouncy
          key={tab.key}
          onPress={tab.onPress}
          onLayout={(event) => measure(tab.key, event)}
          onHoverChange={(inside) => setHovered((current) => (inside ? tab.key : current === tab.key ? null : current))}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: tab.focused }}
        >
          <TopItem $hovered={hovered === tab.key && !tab.focused} $compact={compact}>
            <Ionicons name={tab.icon} size={20} color={tab.focused ? "#4A2500" : colors.white} />
            <ItemLabel $focused={tab.focused} $top>
              {tab.label}
            </ItemLabel>
          </TopItem>
        </Bouncy>
      ))}
    </TopItems>
  );
}

// A "aba" ao lado do logo que troca o site inteiro: no SESI Kids leva para o JES Kids (esportes) e lá traz de volta.
function ModeTab({ toJes, onPress }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Bouncy
      onPress={onPress}
      onHoverChange={setHovered}
      sound={null}
      hoverScale={1.06}
      accessibilityLabel={
        toJes ? "Abrir o JES Kids: placar e ranking dos jogos esportivos" : "Voltar para os jogos do SESI Kids"
      }
    >
      <ModePill
        colors={toJes ? jesGradients.ball : jesGradients.sesi}
        {...DIAGONAL}
        style={shadow(4, 14, "rgba(0,0,0,0.3)")}
      >
        <Shine every={4200} />
        {toJes ? (
          <Float kind="bob" duration={700} enabled={hovered}>
            <Text style={{ fontSize: 20, lineHeight: 26 }}>⚽</Text>
          </Float>
        ) : (
          <Image source={LOGO_BIP} style={{ width: 26, height: 26, borderRadius: 8 }} />
        )}
        <ModeLabel>{toJes ? "JES Kids" : "SESI Kids"}</ModeLabel>
      </ModePill>
    </Bouncy>
  );
}

// No celular a troca de site é o botão redondo do meio da barra, mais alto que os outros.
function CenterSwitch({ toJes, onPress }) {
  return (
    <CenterSlot>
      <Bouncy
        onPress={onPress}
        sound={null}
        accessibilityLabel={
          toJes ? "Abrir o JES Kids: placar e ranking dos jogos esportivos" : "Voltar para os jogos do SESI Kids"
        }
        contentStyle={{ alignItems: "center" }}
      >
        <CenterCircle
          colors={toJes ? jesGradients.ball : jesGradients.sesi}
          {...DIAGONAL}
          $jes={!toJes}
          style={shadow(8, 18, "rgba(0,0,0,0.45)")}
        >
          {toJes ? (
            <Float kind="bob" duration={1100}>
              <Text style={{ fontSize: 30, lineHeight: 38 }}>⚽</Text>
            </Float>
          ) : (
            <Image source={LOGO_BIP} style={{ width: 36, height: 36, borderRadius: 10 }} />
          )}
        </CenterCircle>
        <ItemLabel numberOfLines={1} style={{ color: toJes ? jes.lime : colors.lilac, marginTop: 4 }}>
          {toJes ? "JES Kids" : "SESI Kids"}
        </ItemLabel>
      </Bouncy>
    </CenterSlot>
  );
}

// Barra de abas: flutua embaixo no celular e vira um menu no topo em telas largas.
// variant = "sesi" (jogos) ou "jes" (esportes): muda o logo, as cores e para onde o botão de troca leva.
export default function TabBar({ state, descriptors, navigation, variant = "sesi" }) {
  const insets = useSafeAreaInsets();
  const { width, isWide } = useLayout();
  const { user } = useContext(AuthContext);
  const { progress } = useContext(ProgressContext);
  const { switchMode } = useContext(ModeContext);
  const isJes = variant === "jes";
  // telas médias: abas mais justas e o chip sem o nome; mais estreitas ainda, o logo fica só com o selo
  const compact = width < 1180;
  const tight = width < 1040;

  const tabs = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    return {
      key: route.key,
      name: route.name,
      icon: ICONS[route.name],
      label: options.tabBarLabel ?? options.title ?? route.name,
      focused: state.index === index,
      onPress: () => {
        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
        if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name);
      },
    };
  });

  // sem ninguém conectado (placar aberto pelo link) a volta é para a tela de entrar
  const toggleMode = () =>
    isJes
      ? switchMode("sesi", () => navigation.navigate(user ? "Tabs" : "SignIn"))
      : switchMode("jes", () => navigation.navigate("Jes"));

  if (isWide) {
    return (
      <TopBar $jes={isJes} style={{ paddingTop: insets.top + 10 }}>
        <BrandRow>
          <Bouncy
            onPress={() => navigation.navigate(isJes ? "JesLive" : "Home")}
            accessibilityLabel={isJes ? "JES Kids: ir para o placar ao vivo" : "SESI Kids: ir para os jogos"}
          >
            <Brand>
              {isJes ? (
                <BallBadge colors={jesGradients.ball} {...DIAGONAL}>
                  <Text style={{ fontSize: 24, lineHeight: 30 }}>🏆</Text>
                </BallBadge>
              ) : (
                <Image source={LOGO_BIP} style={{ width: 38, height: 38, borderRadius: 11 }} />
              )}
              {tight ? null : isJes ? <JesLogo size={30} animated={false} /> : <Logo size={30} animated={false} />}
            </Brand>
          </Bouncy>
          <ModeTab toJes={!isJes} onPress={toggleMode} />
        </BrandRow>

        <TopTabs tabs={tabs} compact={compact} />

        <RightRow>
          {isJes && user && !user.guest ? (
            <Bouncy onPress={() => navigation.navigate("JesOrganizer")} accessibilityLabel="Área do organizador">
              <IconButton>
                <Ionicons name="clipboard" size={20} color={colors.white} />
              </IconButton>
            </Bouncy>
          ) : null}
          {user ? (
            <Bouncy
              onPress={
                isJes
                  ? () => switchMode("sesi", () => navigation.navigate("Tabs", { screen: "Profile" }))
                  : () => navigation.navigate("Profile")
              }
              accessibilityLabel="Abrir meu perfil"
            >
              <UserChip>
                <Avatar id={user.avatar} size={36} />
                {compact ? null : <UserName numberOfLines={1}>{firstName(user.name)}</UserName>}
                <UserStars>⭐ {totalStars(progress)}</UserStars>
              </UserChip>
            </Bouncy>
          ) : (
            <Bouncy
              onPress={() => switchMode("sesi", () => navigation.navigate("SignIn"))}
              accessibilityLabel="Entrar no SESI Kids"
            >
              <SignInChip>
                <Ionicons name="log-in-outline" size={20} color="#4A2500" />
                <SignInText>Entrar</SignInText>
              </SignInChip>
            </Bouncy>
          )}
        </RightRow>
      </TopBar>
    );
  }

  const half = Math.ceil(tabs.length / 2);

  return (
    <BottomWrap style={{ paddingBottom: Math.max(insets.bottom, 12), pointerEvents: "box-none" }}>
      <BottomPill $jes={isJes} accessibilityRole="tablist" style={shadow(10, 24, "rgba(10,3,40,0.55)")}>
        {tabs.slice(0, half).map(({ key, ...tab }) => (
          <BottomItem key={key} {...tab} />
        ))}
        <CenterSwitch toJes={!isJes} onPress={toggleMode} />
        {tabs.slice(half).map(({ key, ...tab }) => (
          <BottomItem key={key} {...tab} />
        ))}
      </BottomPill>
    </BottomWrap>
  );
}
