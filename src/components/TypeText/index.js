import { useEffect, useState } from "react";
import { Text } from "react-native";

// Escreve o texto letra por letra, como se alguém estivesse digitando.
export default function TypeText({ text, speed = 26, style }) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    setLength(0);
    const timer = setInterval(() => {
      setLength((current) => Math.min(current + 1, text.length));
    }, speed);
    const stop = setTimeout(() => clearInterval(timer), speed * (text.length + 2));
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [text, speed]);

  return (
    <Text accessibilityLabel={text} style={style}>
      {text.slice(0, length)}
    </Text>
  );
}
