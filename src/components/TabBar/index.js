import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import Avatar from "../Avatar";
import Bouncy from "../Bouncy";
import Logo from "../Logo";
import { AuthContext } from "../../contexts/auth";
import { ProgressContext } from "../../contexts/progress";
import useLayout from "../../hooks/useLayout";
import { colors, nativeDriver, shadow } from "../../theme";
import { firstName } from "../../utils/helpers";
import { totalStars } from "../../utils/progress";
import {
  BottomPill,
  BottomWrap,
  Brand,
  Bubble,
  ItemLabel,
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
};

const LOGO_BIP = require("../../../assets/logo-bip.png");

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
      <ItemLabel $focused={focused}>{label}</ItemLabel>
    </Bouncy>
  );
}

// Menu do topo: a pílula amarela desliza até a aba escolhida.
function TopTabs({ tabs }) {
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
          <TopItem $hovered={hovered === tab.key && !tab.focused}>
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

// Barra de abas: flutua embaixo no celular e vira um menu no topo em telas largas.
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const { user } = useContext(AuthContext);
  const { progress } = useContext(ProgressContext);

  const tabs = state.routes.map((route, index) => ({
    key: route.key,
    name: route.name,
    icon: ICONS[route.name],
    label: descriptors[route.key].options.title ?? route.name,
    focused: state.index === index,
    onPress: () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name);
    },
  }));

  if (isWide) {
    return (
      <TopBar style={{ paddingTop: insets.top + 10 }}>
        <Bouncy onPress={() => navigation.navigate("Home")} accessibilityLabel="SESI Kids: ir para os jogos">
          <Brand>
            <Image source={LOGO_BIP} style={{ width: 38, height: 38, borderRadius: 11 }} />
            <Logo size={30} animated={false} />
          </Brand>
        </Bouncy>
        <TopTabs tabs={tabs} />
        <Bouncy onPress={() => navigation.navigate("Profile")} accessibilityLabel="Abrir meu perfil">
          <UserChip>
            <Avatar id={user?.avatar} size={36} />
            <UserName numberOfLines={1}>{firstName(user?.name)}</UserName>
            <UserStars>⭐ {totalStars(progress)}</UserStars>
          </UserChip>
        </Bouncy>
      </TopBar>
    );
  }

  return (
    <BottomWrap style={{ paddingBottom: Math.max(insets.bottom, 12), pointerEvents: "box-none" }}>
      <BottomPill accessibilityRole="tablist" style={shadow(10, 24, "rgba(10,3,40,0.55)")}>
        {tabs.map(({ key, ...tab }) => (
          <BottomItem key={key} {...tab} />
        ))}
      </BottomPill>
    </BottomWrap>
  );
}
