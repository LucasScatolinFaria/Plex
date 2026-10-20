import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Guest from "../pages/Guest";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SingUp";
import JesMatch from "../pages/jes/Match";
import { colors, jes } from "../theme";
import JesRoutes from "./jes.routes";

const AuthStack = createNativeStackNavigator();

function AuthRoutes() {
  return (
    <AuthStack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.space },
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignIn} options={{ title: "Entrar" }} />
      <AuthStack.Screen name="SignUp" component={SignUp} options={{ title: "Criar conta" }} />
      <AuthStack.Screen name="Guest" component={Guest} options={{ title: "Visitante" }} />
      {/* o placar do JES Kids abre sem conta: a família acompanha pelo link */}
      <AuthStack.Screen
        name="Jes"
        component={JesRoutes}
        options={{ title: "JES Kids", animation: "none", contentStyle: { backgroundColor: jes.night } }}
      />
      <AuthStack.Screen
        name="JesMatch"
        component={JesMatch}
        options={{ title: "Placar", contentStyle: { backgroundColor: jes.night } }}
      />
    </AuthStack.Navigator>
  );
}

export default AuthRoutes;
