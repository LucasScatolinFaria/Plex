import { createContext, useEffect, useState } from "react";

import { preloadSounds, setSoundEnabled, setVibrationEnabled } from "../services/feedback";
import { loadJSON, saveJSON } from "../services/storage";

export const SettingsContext = createContext({});

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ sound: true, vibration: true, effects: true });

  useEffect(() => {
    preloadSounds();
    loadJSON("settings").then((saved) => {
      if (saved) setSettings((current) => ({ ...current, ...saved }));
    });
  }, []);

  useEffect(() => {
    setSoundEnabled(settings.sound);
    setVibrationEnabled(settings.vibration);
  }, [settings]);

  function toggleSetting(key) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveJSON("settings", next);
  }

  return (
    <SettingsContext.Provider value={{ ...settings, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;
