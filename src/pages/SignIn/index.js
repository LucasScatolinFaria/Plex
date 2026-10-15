import { useContext, useState } from "react";
import { Animated, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Appear from "../../components/Appear";
import Background from "../../components/Background";
import Button from "../../components/Button";
import Field from "../../components/Field";
import Logo from "../../components/Logo";
import Mascot from "../../components/Mascot";
import { AuthContext } from "../../contexts/auth";
import { GAMES } from "../../data/games";
import useLayout from "../../hooks/useLayout";
import useShake from "../../hooks/useShake";
import { fx } from "../../services/feedback";
import { shadow } from "../../theme";
import {
  Card,
  CardHint,
  CardTitle,
  Container,
  Content,
  Divider,
  ErrorText,
  Feature,
  Features,
  Hero,
  Link,
  LinkStrong,
  LinkText,
  Tagline,
} from "./style";

export default function SignIn() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeStyle, shake] = useShake();

  function fail(message) {
    setError(message);
    shake();
    fx("wrong");
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      fail("Preencha o e-mail e a senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      fx("correct");
    } catch (failure) {
      setLoading(false);
      fail(failure.message);
    }
  }

  return (
    <Background>
      <Container behavior={Platform.OS === "ios" ? "padding" : undefined} enabled>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Content $wide={isWide}>
            <Hero $wide={isWide}>
              <Logo size={isWide ? 68 : 46} />
              <Tagline $wide={isWide}>Aprender brincando é muito mais legal!</Tagline>
              {isWide ? (
                <Features>
                  <Feature>🎮 {GAMES.length} jogos de matemática, palavras, lógica, música e mais</Feature>
                  <Feature>⭐ Ganhe estrelas, suba de nível e libere conquistas</Feature>
                  <Feature>🤖 Jogue com o Bip, o robozinho da turma</Feature>
                </Features>
              ) : null}
              <Mascot size={isWide ? 150 : 88} mood={error ? "sad" : "happy"} />
            </Hero>

            <Appear style={{ width: "100%", maxWidth: 420 }}>
              <Animated.View style={shakeStyle}>
                <Card style={shadow(16, 40)}>
                  <CardTitle>Que bom te ver! 👋</CardTitle>
                  <CardHint>Entre para continuar a sua aventura.</CardHint>

                  <Field
                    icon="mail-outline"
                    placeholder="Seu email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                  <Field
                    icon="lock-closed-outline"
                    placeholder="Sua senha"
                    secure
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    returnKeyType="go"
                    onSubmitEditing={handleSignIn}
                  />

                  {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}

                  <Button title="Acessar" icon="rocket" size="lg" full disabled={loading} onPress={handleSignIn} />
                  <Divider>ou</Divider>
                  <Button
                    title="Jogar como visitante"
                    icon="game-controller"
                    tone="purple"
                    full
                    onPress={() => navigation.navigate("Guest")}
                  />

                  <Link onPress={() => navigation.navigate("SignUp")}>
                    <LinkText>
                      Ainda não tem conta? <LinkStrong>Criar uma conta!</LinkStrong>
                    </LinkText>
                  </Link>
                </Card>
              </Animated.View>
            </Appear>
          </Content>
        </ScrollView>
      </Container>
    </Background>
  );
}
