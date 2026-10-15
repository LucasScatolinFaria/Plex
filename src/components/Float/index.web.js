// Movimento que se repete para sempre, feito com animação de CSS (no celular o arquivo é o index.js).
// kind = "bob" (balança e sobe), "float" (sobe e desce), "pulse" (cresce e encolhe), "beat" (pisca de tamanho)
// Para quando os efeitos animados estão desligados em Perfil → Configurações.
import { StyleSheet, View } from "react-native";

import useMotion from "../../hooks/useMotion";

export default function Float({ kind = "float", duration = 1500, delay = 0, enabled = true, style, children }) {
  const motion = useMotion() && enabled;

  return (
    <View
      style={[
        style,
        motion ? styles[kind] : null,
        motion ? { animationDuration: `${duration}ms`, animationDelay: `${delay}ms` } : null,
      ]}
    >
      {children}
    </View>
  );
}

const loop = {
  animationIterationCount: "infinite",
  animationDirection: "alternate",
  animationTimingFunction: "ease-in-out",
  animationFillMode: "both",
};

const styles = StyleSheet.create({
  bob: {
    ...loop,
    animationKeyframes: {
      "0%": { transform: [{ translateY: 2 }, { rotate: "-5deg" }] },
      "100%": { transform: [{ translateY: -6 }, { rotate: "5deg" }] },
    },
  },
  float: {
    ...loop,
    animationKeyframes: {
      "0%": { transform: [{ translateY: 0 }] },
      "100%": { transform: [{ translateY: -6 }] },
    },
  },
  pulse: {
    ...loop,
    animationKeyframes: {
      "0%": { transform: [{ scale: 1 }] },
      "100%": { transform: [{ scale: 1.12 }] },
    },
  },
  beat: {
    ...loop,
    animationKeyframes: {
      "0%": { transform: [{ scale: 0.85 }] },
      "100%": { transform: [{ scale: 1.15 }] },
    },
  },
});
