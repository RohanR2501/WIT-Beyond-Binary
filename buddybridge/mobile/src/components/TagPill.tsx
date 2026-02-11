import React from "react";
import { View, Text } from "react-native";

export function TagPill({ label }: { label: string }) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8 }}>
      <Text>{label}</Text>
    </View>
  );
}
