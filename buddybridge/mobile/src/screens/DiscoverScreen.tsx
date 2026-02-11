import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { getMatches, upsertUser } from "../api/client";
import { Match, User } from "../types";
import { TagPill } from "../components/TagPill";

export function DiscoverScreen({
  me,
  onChatWith,
}: {
  me: User;
  onChatWith: (other: User) => void;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      const data = await getMatches(me.id);
      setMatches(data);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAi() {
    const updated = await upsertUser({ ...me, ai_enabled: !me.ai_enabled, prefers_group: me.prefers_group });
    // quick hack: reload screen by hard refresh in parent if needed
    // in MVP we just tell user to re-open; or manage state in parent
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Discover</Text>
        <Pressable onPress={load} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text>Refresh</Text>
        </Pressable>
      </View>

      <Text style={{ marginBottom: 10 }}>Hi {me.name}! AI Wingman is currently: {me.ai_enabled ? "ON" : "OFF"}</Text>

      {err && <Text style={{ color: "red" }}>{err}</Text>}

      {matches.map((m) => (
        <View key={m.user.id} style={{ borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{m.user.name}</Text>
          <Text style={{ opacity: 0.75, marginBottom: 8 }}>Score: {m.score}</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
            {m.user.interests.slice(0, 6).map((t) => <TagPill key={t} label={t} />)}
          </View>

          {m.why.map((w, idx) => (
            <Text key={idx} style={{ opacity: 0.8 }}>• {w}</Text>
          ))}

          <View style={{ height: 10 }} />

          <Pressable onPress={() => onChatWith(m.user)} style={{ padding: 12, borderWidth: 1, borderRadius: 12, alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Chat</Text>
          </Pressable>
        </View>
      ))}

      <Text style={{ marginTop: 10, opacity: 0.7 }}>
        Tip: If you’re alone in DB, open the app again with a second “user” to create another profile.
      </Text>
    </ScrollView>
  );
}
