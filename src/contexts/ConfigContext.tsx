import { createContext, useContext, useEffect, useState } from "react";

interface Config {
  assets: {
    logo: {
      light: string;
      dark: string;
    };
  };
}

const ConfigContext = createContext<Config | null>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) {
    return <div>Loading...</div>; // Or a proper loader
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
