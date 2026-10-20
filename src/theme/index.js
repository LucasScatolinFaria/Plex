import { Platform } from "react-native";

export const colors = {
  space: "#160B40",
  night: "#24126A",
  indigo: "#3B1FA8",
  purple: "#6D28D9",
  violet: "#8B5CF6",
  lilac: "#C4B5FD",
  pink: "#FF5FA2",
  coral: "#FF6B6B",
  orange: "#FF9F43",
  yellow: "#FFD23F",
  lime: "#A3E635",
  green: "#22C55E",
  mint: "#2ED8A7",
  cyan: "#22D3EE",
  sky: "#38BDF8",
  blue: "#3B82F6",
  white: "#FFFFFF",
  ink: "#1E1B4B",
  inkSoft: "#4C4A73",
  muted: "#8E8CB0",
  cloud: "#F4F1FF",
  line: "#E6E0FA",
  danger: "#EF4444",
  success: "#16A34A",
  glass: "rgba(255,255,255,0.12)",
  glassStrong: "rgba(255,255,255,0.2)",
  glassLine: "rgba(255,255,255,0.28)",
  textSoft: "#DAD2F6",
};

export const gradients = {
  space: ["#1B0E52", "#3A1C9C", "#6D28D9"],
  sunset: ["#FF5FA2", "#FF9F43"],
  candy: ["#8B5CF6", "#FF5FA2"],
  ocean: ["#38BDF8", "#3B82F6"],
  forest: ["#2ED8A7", "#16A34A"],
  gold: ["#FFE27A", "#FFB020"],
};

// JES Kids (modo esportes): gramado à noite, placar de estádio e muito amarelo e laranja
export const jes = {
  night: "#03140B",
  bar: "#05190F",
  field: "#0B3D22",
  grass: "#16A34A",
  lime: "#A3E635",
  orange: "#FF7A1A",
  live: "#FF3B4E",
  board: "#07120C",
  card: "rgba(4, 28, 16, 0.72)",
  cardStrong: "rgba(4, 28, 16, 0.9)",
  line: "rgba(255,255,255,0.16)",
  textSoft: "#C9E8D3",
  muted: "#8DB59C",
};

export const jesGradients = {
  hero: ["#0B4A27", "#138A43", "#3DBB5C"],
  board: ["#0D1B14", "#050C08"],
  sesi: ["#8B5CF6", "#5B21B6"],
  ball: ["#4ADE80", "#15803D"],
};

export const fonts = {
  title: "Fredoka_700Bold",
  heading: "Fredoka_600SemiBold",
  medium: "Fredoka_500Medium",
  text: "Nunito_600SemiBold",
  body: "Nunito_700Bold",
  strong: "Nunito_800ExtraBold",
};

// face = frente do botão, edge = a "lateral" 3D que aparece embaixo
export const buttonTones = {
  yellow: { face: "#FFD23F", edge: "#D99A00", text: "#4A2500" },
  purple: { face: "#8B5CF6", edge: "#5B21B6", text: "#FFFFFF" },
  pink: { face: "#FF5FA2", edge: "#C9306F", text: "#FFFFFF" },
  green: { face: "#34D399", edge: "#0E9F6E", text: "#06402B" },
  blue: { face: "#38BDF8", edge: "#0B7FC2", text: "#06304A" },
  red: { face: "#FF6B6B", edge: "#C93A3A", text: "#FFFFFF" },
  white: { face: "#FFFFFF", edge: "#CFC6F2", text: "#3B1FA8" },
  soft: { face: "#EDE9FE", edge: "#C4B5FD", text: "#5B21B6" },
  ghost: { face: "rgba(255,255,255,0.16)", edge: "rgba(0,0,0,0.25)", text: "#FFFFFF" },
};

export const nativeDriver = Platform.OS !== "web";

export const shadow = (y = 8, blur = 20, color = "rgba(15,5,60,0.35)") => ({
  boxShadow: `0px ${y}px ${blur}px ${color}`,
});

export const glow = (color, blur = 18) => ({
  boxShadow: `0px 0px ${blur}px ${color}`,
});

export const textShadow = (color = "rgba(15,5,60,0.35)", y = 2, blur = 4) =>
  Platform.OS === "web"
    ? { textShadow: `0px ${y}px ${blur}px ${color}` }
    : {
        textShadowColor: color,
        textShadowOffset: { width: 0, height: y },
        textShadowRadius: blur,
      };
