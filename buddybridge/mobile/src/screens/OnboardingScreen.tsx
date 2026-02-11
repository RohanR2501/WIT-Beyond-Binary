import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { upsertUser } from "../api/client";
import { User } from "../types";
import { TagPill } from "../components/TagPill";

const SUGGESTED_TAGS = ["climbing", "cafes", "anime", "coding", "music", "gym", "photography", "volunteering"];

export function OnboardingScreen({ onDone }: { onDone: (u: User) => void }) {
  const [id, setId] = useState("user_" + Math.floor(Math.random() * 10000));
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState<User["vibe"]>("gentle");
  const [prefersGroup, setPrefersGroup] = useState(40);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);

  function toggle(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function submit() {
    const payload = {
      id,
      name: name.trim() || "Anonymous",
      interests,
      vibe,
      prefers_group: prefersGroup,
      ai_enabled: aiEnabled,
    };
    const u = await upsertUser(payload);
    onDone(u);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 10 }}>BuddyBridge</Text>
      <Text style={{ marginBottom: 18 }}>Make nearby friends with an AI “wingman” that helps conversations flow.</Text>

      <Text style={{ fontWeight: "700" }}>Your Name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g., Manasi" style={{ borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 14 }} />

      <Text style={{ fontWeight: "700" }}>Pick your vibe</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8, marginBottom: 14 }}>
        {(["gentle", "fun", "deep", "minimal"] as const).map((v) => (
          <Pressable key={v} onPress={() => setVibe(v)} style={{ padding: 10, borderWidth: 1, borderRadius: 999, marginRight: 8, marginBottom: 8, opacity: vibe === v ? 1 : 0.5 }}>
            <Text>{v}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontWeight: "700" }}>Interests</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {SUGGESTED_TAGS.map((t) => (
          <Pressable key={t} onPress={() => toggle(t)} style={{ opacity: interests.includes(t) ? 1 : 0.5 }}>
            <TagPill label={t} />
          </Pressable>
        ))}
      </View>

      <View style={{ height: 16 }} />

      <Text style={{ fontWeight: "700" }}>AI Wingman</Text>
      <Pressable onPress={() => setAiEnabled((x) => !x)} style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginTop: 8 }}>
        <Text>{aiEnabled ? "ON (tap to disable)" : "OFF (tap to enable)"}</Text>
      </Pressable>

      <View style={{ height: 18 }} />

      <Pressable onPress={submit} style={{ padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" }}>
        <Text style={{ fontWeight: "700" }}>Continue</Text>
      </Pressable>

      <Text style={{ marginTop: 10, opacity: 0.7 }}>User ID: {id}</Text>
    </ScrollView>
  );
}
