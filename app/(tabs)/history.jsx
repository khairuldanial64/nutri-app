import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getAllMealDays, getMealsByDay, getGoals } from '../../lib/database';

function DaySection({ day, goals }) {
  const [meals, setMeals] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [totals, setTotals] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  useCallback(() => {}, []);

  useState(() => {
    getMealsByDay(day).then(m => {
      setMeals(m);
      setTotals({
        calories: m.reduce((s, x) => s + x.calories, 0),
        protein_g: m.reduce((s, x) => s + x.protein_g, 0),
        carbs_g: m.reduce((s, x) => s + x.carbs_g, 0),
        fat_g: m.reduce((s, x) => s + x.fat_g, 0),
      });
    });
  }, [day]);

  function formatDay(dateStr) {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function MacroChip({ label, value, color }) {
    return (
      <View style={[styles.chip, { backgroundColor: color + '22' }]}>
        <Text style={[styles.chipText, { color }]}>{Math.round(value)}g {label}</Text>
      </View>
    );
  }

  const calPct = Math.min((totals.calories / goals.calories) * 100, 100);

  return (
    <View style={styles.daySection}>
      <TouchableOpacity style={styles.dayHeader} onPress={() => setExpanded(e => !e)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayLabel}>{formatDay(day)}</Text>
            <View style={styles.dayMacroRow}>
            <MacroChip label="P" value={totals.protein_g} color="#3B82F6" />
            <MacroChip label="C" value={totals.carbs_g} color="#EF9F27" />
            <MacroChip label="F" value={totals.fat_g} color="#D85A30" />
          </View>
        </View>
        <View style={styles.dayCalWrap}>
          <Text style={styles.dayCalText}>{Math.round(totals.calories)}</Text>
          <Text style={styles.dayCalUnit}>kcal</Text>
          <View style={styles.dayBarBg}>
            <View style={[styles.dayBarFill, { width: `${calPct}%` }]} />
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.mealList}>
          {meals.map(meal => (
            <View key={meal.id} style={styles.mealRow}>
              <View style={styles.mealDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
                <Text style={styles.mealTime}>{formatTime(meal.logged_at)}</Text>
              </View>
              <Text style={styles.mealCal}>{meal.calories} kcal</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const [days, setDays] = useState([]);
  const [goals, setGoals] = useState({ calories: 2000, protein_g: 125, carbs_g: 200, fat_g: 50 });

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const [d, g] = await Promise.all([getAllMealDays(), getGoals()]);
    setDays(d);
    setGoals(g);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.sub}>All your logged meals</Text>

        {days.length === 0 ? (
          <Text style={styles.empty}>No meals logged yet. Start by logging a meal!</Text>
        ) : (
          days.map(day => (
            <DaySection key={day} day={day} goals={goals} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 24 },
  empty: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 40 },

  daySection: {
    borderRadius: 12, borderWidth: 0.5,
    borderColor: '#e0e0e0', marginBottom: 12, overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, backgroundColor: '#fafafa', gap: 10,
  },
  dayLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  dayMacroRow: { flexDirection: 'row', gap: 6 },
  chip: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: '500' },
  dayCalWrap: { alignItems: 'flex-end', minWidth: 60 },
  dayCalText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  dayCalUnit: { fontSize: 11, color: '#aaa' },
  dayBarBg: {
    width: 60, height: 3, backgroundColor: '#e0e0e0',
    borderRadius: 2, marginTop: 4, overflow: 'hidden',
  },
  dayBarFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 2 },
  chevron: { fontSize: 10, color: '#aaa', marginLeft: 4 },

  mealList: { paddingHorizontal: 14, paddingBottom: 10 },
  mealRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#f0f0f0', gap: 10,
  },
  mealDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6',
  },
  mealName: { fontSize: 13, color: '#1a1a1a', fontWeight: '500' },
  mealTime: { fontSize: 11, color: '#aaa', marginTop: 2 },
  mealCal: { fontSize: 13, fontWeight: '600', color: '#555' },
});