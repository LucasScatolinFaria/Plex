import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../contexts/auth";
import Splash from "../pages/Splash";
import AppRoutes from "./app.routes";
import AuthRoutes from "./auth.routes";

const SPLASH_TIME = 1600;

function Routes() {
  const { signed, loading } = useContext(AuthContext);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), SPLASH_TIME);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !splashDone) return <Splash />;

  return signed ? <AppRoutes /> : <AuthRoutes />;
}

export default Routes;
