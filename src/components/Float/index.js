// Movimento que se repete para sempre (no celular, com o Animated; no navegador o arquivo é o index.web.js).
// kind = "bob" (balança e sobe), "float" (sobe e desce), "pulse" (cresce e encolhe), "beat" (pisca de tamanho)
// Para quando os efeitos animados estão desligados em Perfil → Configurações.
import { Animated } from "react-native";

import useLoop from "../../hooks/useLoop";
import useMotion from "../../hooks/useMotion";

export default function Float({ kind = "float", duration = 1500, delay = 0, enabled = true, style, children }) {
  const motion = useMotion() && enabled;
  const loop = useLoop(duration, { delay, enabled: motion });

  const transforms = {
    bob: [
      { translateY: loop.interpolate({ inputRange: [0, 1], outputRange: [2, -6] }) },
      { rotate: loop.interpolate({ inputRange: [0, 1], outputRange: ["-5deg", "5deg"] }) },
    ],
    float: [{ translateY: loop.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
    pulse: [{ scale: loop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
    beat: [{ scale: loop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
  };

  return <Animated.View style={[style, motion ? { transform: transforms[kind] } : null]}>{children}</Animated.View>;
}
