import { View } from "react-native";

import Appear from "../../components/Appear";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Mascot from "../../components/Mascot";

// Abertura mostrada enquanto o app carrega a sessão salva.
export default function Splash() {
  return (
    <Background>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28 }}>
        <Appear from="scale">
          <Mascot size={130} mood="excited" />
        </Appear>
        <Logo size={58} />
      </View>
    </Background>
  );
}
