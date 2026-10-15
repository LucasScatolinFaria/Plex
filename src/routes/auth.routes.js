import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Guest from "../pages/Guest";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SingUp";
import { colors } from "../theme";

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
    </AuthStack.Navigator>
  );
}

export default AuthRoutes;
