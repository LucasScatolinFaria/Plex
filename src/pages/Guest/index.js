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
import { AVATARS, GUEST_AVATAR } from "../../data/avatars";
import useShake from "../../hooks/useShake";
import { fx } from "../../services/feedback";
import { shadow } from "../../theme";
import { Card, CardHint, CardTitle, Container, ErrorText, Link, LinkStrong, LinkText } from "../SignIn/style";
import { Label, Note } from "../SingUp/style";

// o visitante pode ficar com o alienígena de sempre ou escolher um dos avatares das contas
const GUEST_AVATARS = [GUEST_AVATAR, ...AVATARS];

export default function Guest() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { signInAsGuest } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(GUEST_AVATAR.id);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeStyle, shake] = useShake();

  function fail(message) {
    setError(message);
    shake();
    fx("wrong");
  }

  async function handleStart() {
    if (name.trim().length < 2) return fail("Digite o seu nome (pelo menos 2 letras).");

    setLoading(true);
    try {
      await signInAsGuest({ name, avatar });
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
                <CardTitle>Jogar como visitante 👽</CardTitle>
                <CardHint>Diga o seu nome para aparecer no ranking dos visitantes.</CardHint>

                <Label>Escolha o seu avatar</Label>
                <AvatarPicker avatars={GUEST_AVATARS} value={avatar} onChange={setAvatar} />

                <Field
                  icon="person-outline"
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  maxLength={30}
                  returnKeyType="go"
                  onSubmitEditing={handleStart}
                />

                {error ? <ErrorText accessibilityRole="alert">{error}</ErrorText> : null}

                <Button
                  title="Começar a jogar"
                  icon="game-controller"
                  tone="purple"
                  size="lg"
                  full
                  disabled={loading}
                  onPress={handleStart}
                />

                <Note>👽 O visitante joga só neste aparelho. Com uma conta, você entra de qualquer lugar.</Note>

                <Link onPress={goToSignIn}>
                  <LinkText>
                    Já tem uma conta? <LinkStrong>Entrar</LinkStrong>
                  </LinkText>
                </Link>
              </Card>
            </Animated.View>
          </Appear>
        </ScrollView>
      </Container>
    </Background>
  );
}
