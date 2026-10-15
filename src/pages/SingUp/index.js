import { useContext, useState } from "react";
import { Animated, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Appear from "../../components/Appear";
import AvatarPicker from "../../components/AvatarPicker";
import Background from "../../components/Background";
import Button from "../../components/Button";
import Field from "../../components/Field";
import Logo from "../../components/Logo";
import { AuthContext } from "../../contexts/auth";
import { AVATARS } from "../../data/avatars";
import useShake from "../../hooks/useShake";
import { fx } from "../../services/feedback";
import { shadow } from "../../theme";
import { Card, CardHint, CardTitle, Container, ErrorText, Link, LinkStrong, LinkText } from "../SignIn/style";
import { Label, Note } from "./style";

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, signUp } = useContext(AuthContext);
  // o visitante que cria a conta (pelo "Guardar meu progresso") leva o progresso junto
  const upgrading = !!user?.guest;

  const [name, setName] = useState(upgrading ? user.name : "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(
    upgrading && AVATARS.some((item) => item.id === user.avatar) ? user.avatar : AVATARS[0].id
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeStyle, shake] = useShake();

  function fail(message) {
    setError(message);
    shake();
    fx("wrong");
  }

  async function handleSignUp() {
    if (name.trim().length < 2) return fail("Digite o seu nome (pelo menos 2 letras).");
    if (!EMAIL_FORMAT.test(email.trim())) return fail("Digite um e-mail válido.");
    if (password.length < 6) return fail("A senha precisa ter pelo menos 6 caracteres.");

    setLoading(true);
    try {
      await signUp({ name, email, password, avatar });
      fx("win");
    } catch (failure) {
      setLoading(false);
      fail(failure.message);
    }
    return undefined;
  }

  function goToSignIn() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("SignIn");
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
            gap: 18,
            paddingHorizontal: 20,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Logo size={40} />

          <Appear style={{ width: "100%", maxWidth: 440 }}>
            <Animated.View style={shakeStyle}>
              <Card style={shadow(16, 40)}>
                <CardTitle>Criar conta 🚀</CardTitle>
                <CardHint>É rapidinho: escolha um avatar e comece a jogar.</CardHint>

                {upgrading ? (
                  <Note $highlight>✨ Seu progresso de visitante vai junto com a conta nova!</Note>
                ) : null}

                <Label>Escolha o seu avatar</Label>
                <AvatarPicker avatars={AVATARS} value={avatar} onChange={setAvatar} />

                <Field
                  icon="person-outline"
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  maxLength={30}
                  returnKeyType="next"
                />
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
                  placeholder="Senha (mínimo 6)"
                  secure
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignUp}
                />

                {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}

                <Button title="Cadastrar" icon="sparkles" size="lg" full disabled={loading} onPress={handleSignUp} />

                <Note>🔒 Sua conta fica guardada com segurança na nuvem.</Note>

                {upgrading ? (
                  <Link onPress={() => navigation.goBack()}>
                    <LinkText>
                      <LinkStrong>Agora não</LinkStrong>
                    </LinkText>
                  </Link>
                ) : (
                  <Link onPress={goToSignIn}>
                    <LinkText>
                      Já tem uma conta? <LinkStrong>Entrar</LinkStrong>
                    </LinkText>
                  </Link>
                )}
              </Card>
            </Animated.View>
          </Appear>
        </ScrollView>
      </Container>
    </Background>
  );
}
