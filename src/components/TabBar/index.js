import { useContext, useEffect, useRef } from "react";
import { Animated } from "react-native";
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
  Bubble,
  ItemLabel,
  TopBar,
  TopItem,
  TopItems,
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
        <Logo size={30} animated={false} />
        <TopItems accessibilityRole="tablist">
          {tabs.map((tab) => (
            <Bouncy
              key={tab.key}
              onPress={tab.onPress}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: tab.focused }}
            >
              <TopItem $focused={tab.focused}>
                <Ionicons name={tab.icon} size={20} color={tab.focused ? "#4A2500" : colors.white} />
                <ItemLabel $focused={tab.focused} $top>
                  {tab.label}
                </ItemLabel>
              </TopItem>
            </Bouncy>
          ))}
        </TopItems>
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
