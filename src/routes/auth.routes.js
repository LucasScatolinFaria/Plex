import { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../contexts/auth";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SingUp";
import { colors } from "../theme";

const AuthStack = createNativeStackNavigator();

function AuthRoutes() {
  const { guestUpgrade } = useContext(AuthContext);

  return (
    <AuthStack.Navigator
      // o visitante que pediu para criar conta já cai direto no cadastro
      initialRouteName={guestUpgrade ? "SignUp" : "SignIn"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.space },
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignIn} options={{ title: "Entrar" }} />
      <AuthStack.Screen name="SignUp" component={SignUp} options={{ title: "Criar conta" }} />
    </AuthStack.Navigator>
  );
}

export default AuthRoutes;
