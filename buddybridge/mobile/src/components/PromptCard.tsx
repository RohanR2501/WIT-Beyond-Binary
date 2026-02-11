import React from "react";
import { View, Text, Pressable } from "react-native";

export function PromptCard({ text, onUse }: { text: string; onUse: () => void }) {
  return (
    <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 }}>
      <Text style={{ marginBottom: 8 }}>{text}</Text>
      <Pressable onPress={onUse} style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignSelf: "flex-start" }}>
        <Text>Use this</Text>
      </Pressable>
    </View>
  );
}
