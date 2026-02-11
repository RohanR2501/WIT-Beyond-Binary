import React, { useState } from "react";
import { SafeAreaView } from "react-native";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { User } from "./src/types";

type Screen =
  | { name: "onboarding" }
  | { name: "discover" }
  | { name: "chat"; other: User };

export default function App() {
  const [me, setMe] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "onboarding" });

  if (!me) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <OnboardingScreen
          onDone={(u) => {
            setMe(u);
            setScreen({ name: "discover" });
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen.name === "discover" && (
        <DiscoverScreen
          me={me}
          onChatWith={(other) => setScreen({ name: "chat", other })}
        />
      )}

      {screen.name === "chat" && (
        <ChatScreen
          me={me}
          other={screen.other}
          onBack={() => setScreen({ name: "discover" })}
        />
      )}
    </SafeAreaView>
  );
}
