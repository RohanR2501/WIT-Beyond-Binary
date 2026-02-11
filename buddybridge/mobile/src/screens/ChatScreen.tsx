import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { chatWsUrl, getWingman } from "../api/client";
import { ChatMsg, User, Wingman } from "../types";
import { PromptCard } from "../components/PromptCard";

export function ChatScreen({
  me,
  other,
  onBack,
}: {
  me: User;
  other: User;
  onBack: () => void;
}) {
  const roomId = useMemo(() => [me.id, other.id].sort().join("__"), [me.id, other.id]);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [wingman, setWingman] = useState<Wingman | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

    useEffect(() => {
    const wsUrl = chatWsUrl(roomId);  // Get the WebSocket URL
    console.log("WebSocket URL:", wsUrl);  // Log to verify the URL

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);  // Make sure the URL is a string
    wsRef.current = ws;

    // WebSocket message handler
    ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.type === "msg") {
        setMsgs((prev) => [...prev, { sender_id: data.sender_id, text: data.text, ts: data.ts }]);
        }
    };

    // WebSocket error handler
    ws.onerror = () => {};

    // Clean up WebSocket connection on unmount
    return () => {
        ws.close();
    };
    }, [roomId]);

  // Autoscroll when new messages arrive
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [msgs.length]);

  // Refresh Wingman suggestions
  async function refreshWingman() {
    const w = await getWingman(roomId, me.id, other.id);
    setWingman(w);
  }

  // Function to send messages
  function send(msgText?: string) {
    const t = (msgText ?? text).trim();
    if (!t) return;
    wsRef.current?.send(JSON.stringify({ sender_id: me.id, text: t }));
    setText("");
    // Update wingman after sending a message
    setTimeout(refreshWingman, 200);
  }

  // Initial wingman suggestions
  useEffect(() => {
    refreshWingman();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Pressable onPress={onBack} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text>Back</Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>{other.name}</Text>
        <Pressable onPress={refreshWingman} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text>Wingman</Text>
        </Pressable>
      </View>

      {wingman?.enabled ? (
        <View style={{ borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Conversation Sparks</Text>
          {wingman.suggestions.map((s, i) => (
            <PromptCard key={i} text={s} onUse={() => send(s)} />
          ))}
          {wingman.wingman_in_chat && (
            <Text style={{ opacity: 0.7 }}>Wingman note: {wingman.wingman_in_chat}</Text>
          )}
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 10 }}>
          <Text style={{ fontWeight: "700" }}>Wingman disabled</Text>
          <Text style={{ opacity: 0.7 }}>One of you turned off AI assistance in settings (privacy-first).</Text>
        </View>
      )}

      <ScrollView ref={scrollRef} style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 }}>
        {msgs.map((m, idx) => {
          const mine = m.sender_id === me.id;
          return (
            <View key={idx} style={{ marginBottom: 10, alignItems: mine ? "flex-end" : "flex-start" }}>
              <View style={{ borderWidth: 1, borderRadius: 12, padding: 10, maxWidth: "85%" }}>
                <Text style={{ fontWeight: "700", marginBottom: 4 }}>{mine ? "You" : other.name}</Text>
                <Text>{m.text}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          style={{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, marginRight: 8 }}
        />
        <Pressable onPress={() => send()} style={{ paddingHorizontal: 14, justifyContent: "center", borderWidth: 1, borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
