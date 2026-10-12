import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { extractMacros } from '../../lib/openai';
import { logMeal } from '../../lib/database';

export default function LogScreen() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Enter your meal." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMacros, setPendingMacros] = useState(null);
  const scrollRef = useRef(null);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);
    setPendingMacros(null);

    try {
      const macros = await extractMacros(trimmed);
      setMessages(prev => [...prev, { role: 'ai', text: null, macros }]);
      setPendingMacros(macros);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: "Sorry, I couldn't analyse that meal. Please try again." }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

async function handleLog() {
  if (!pendingMacros) return;
  try {
    await logMeal(pendingMacros);
    setMessages(prev => [
      ...prev,
      { role: 'ai', text: `✓ Logged ${pendingMacros.meal_name}! Tell me your next meal.` }
    ]);
    setPendingMacros(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  } catch (e) {
    console.log('Save error:', e.message);
    setMessages(prev => [
      ...prev,
      { role: 'ai', text: 'Failed to save meal. Please try again.' }
    ]);
  }
}

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Log a meal</Text>

          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <View key={i} style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                );
              }
              if (msg.macros) {
                return (
                  <View key={i} style={styles.aiBubble}>
                    <Text style={styles.aiText}>Here's the breakdown for your meal:</Text>
                    <View style={styles.pillRow}>
                      <View style={styles.pill}><Text style={styles.pillText}> {msg.macros.calories} kcal</Text></View>
                      <View style={styles.pill}><Text style={styles.pillText}> {msg.macros.protein_g}g protein</Text></View>
                      <View style={styles.pill}><Text style={styles.pillText}> {msg.macros.carbs_g}g carbs</Text></View>
                      <View style={styles.pill}><Text style={styles.pillText}> {msg.macros.fat_g}g fat</Text></View>
                    </View>
                    <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
                      <Text style={styles.logBtnText}>+ Log this meal</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <View key={i} style={styles.aiBubble}>
                  <Text style={styles.aiText}>{msg.text}</Text>
                </View>
              );
            })}
            {loading && (
              <View style={styles.aiBubble}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Describe your meal…"
              placeholderTextColor="#aaa"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a', marginBottom: 16 },
  chatArea: { flex: 1 },
  userBubble: {
    backgroundColor: '#3B82F6', borderRadius: 16,
    borderTopRightRadius: 4, padding: 12,
    alignSelf: 'flex-end', maxWidth: '80%',
  },
  userText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  aiBubble: {
    backgroundColor: '#f0f0f0', borderRadius: 16,
    borderTopLeftRadius: 4, padding: 14,
    alignSelf: 'flex-start', maxWidth: '88%',
  },
  aiText: { fontSize: 14, color: '#1a1a1a', lineHeight: 20 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  pill: {
    backgroundColor: '#DBEAFE', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 12, color: '#1E40AF', fontWeight: '500' },
  logBtn: {
    backgroundColor: '#3B82F6', borderRadius: 8,
    padding: 10, marginTop: 10, alignItems: 'center',
  },
  logBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', gap: 10,
    borderTopWidth: 0.5, borderTopColor: '#e0e0e0', paddingTop: 12,
  },
  input: {
    flex: 1, borderWidth: 0.5, borderColor: '#ddd',
    borderRadius: 10, padding: 10, fontSize: 14, color: '#1a1a1a',
  },
  sendBtn: {
    backgroundColor: '#3B82F6', borderRadius: 10,
    width: 44, alignItems: 'center', justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 20 },
});