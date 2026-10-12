import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { getTodaysMeals, getTodaysTotals, getGoals, deleteMeal, getWeeklyTotals } from '../../lib/database';


function ProgressBar({ value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

function MacroCard({ label, value, goal, color }) {
  return (
    <View style={styles.macroCard}>
      <Text style={[styles.macroVal, { color }]}>{Math.round(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <ProgressBar value={value} goal={goal} color={color} />
      <Text style={styles.macroGoal}>goal: {goal}g</Text>
    </View>
  );
}

function CalorieRing({ consumed, goal }) {
  const pct = Math.min(consumed / goal, 1);
  const remaining = Math.max(goal - consumed, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;
  const strokeGap = circumference - strokeDash;

  return (
    <View style={styles.calCard}>
      <View style={styles.calRingWrap}>
<Svg width="100" height="100" viewBox="0 0 100 100">
  <Circle cx="50" cy="50" r={radius} fill="none" stroke="#DBEAFE" strokeWidth="8" />
  <Circle
    cx="50" cy="50" r={radius} fill="none"
    stroke="#1E3A8A" strokeWidth="8"
    strokeDasharray={`${strokeDash} ${strokeGap}`}
    strokeLinecap="round"
    transform="rotate(-90 50 50)"
  />
</Svg>
        <View style={styles.calCenter}>
          <Text style={styles.calNum}>{Math.round(consumed)}</Text>
          <Text style={styles.calDen}>/ {goal}</Text>
        </View>
      </View>
      <View style={styles.calInfo}>
        <Text style={styles.calTitle}>{Math.round(consumed)} kcal consumed</Text>
        <Text style={styles.calRemain}>{Math.round(remaining)} kcal remaining</Text>
      </View>
    </View>
  );
}

export default function TodayScreen() {
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [goals, setGoals] = useState({ calories: 2000, protein_g: 125, carbs_g: 200, fat_g: 50 });
  const [editing, setEditing] = useState(false);
  const [weekly, setWeekly] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, days_tracked: 0 });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

async function loadData() {
  const [m, t, g, w] = await Promise.all([
    getTodaysMeals(),
    getTodaysTotals(),
    getGoals(),
    getWeeklyTotals(),
  ]);
  setMeals(m);
  setTotals(t);
  setGoals(g);
  setWeekly(w);
}

  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.greeting}>{getGreeting()} </Text>
        <Text style={styles.sub}>
          {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        <CalorieRing consumed={totals.calories} goal={goals.calories} />

        <View style={styles.macroRow}>
          <MacroCard label="Protein" value={totals.protein_g} goal={goals.protein_g} color="#3B82F6" />
          <MacroCard label="Carbs" value={totals.carbs_g} goal={goals.carbs_g} color="#EF9F27" />
          <MacroCard label="Fats" value={totals.fat_g} goal={goals.fat_g} color="#D85A30" />
        </View>


<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>TODAY'S MEALS</Text>
  {meals.length > 0 && (
    <TouchableOpacity onPress={() => setEditing(e => !e)}>
      <Text style={styles.editToggle}>{editing ? 'Done' : 'Edit'}</Text>
    </TouchableOpacity>
  )}
</View>

{meals.length === 0 ? (
  <Text style={styles.empty}>No meals logged yet. Tap Log Meal to start!</Text>
) : (
  meals.map((meal) => (
    <View key={meal.id} style={styles.mealItem}>
      {editing && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            Alert.alert(
              'Delete meal',
              `Remove "${meal.meal_name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', style: 'destructive',
                  onPress: async () => {
                    await deleteMeal(meal.id);
                    loadData();
                  }
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteBtnText}>－</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.mealName}>{meal.meal_name}</Text>
        <Text style={styles.mealTime}>{formatTime(meal.logged_at)}</Text>
      </View>
      <Text style={styles.mealCal}>{meal.calories} kcal</Text>
    </View>
  ))
)}
<View style={styles.weeklySection}>
  <Text style={styles.sectionTitle}>THIS WEEK</Text>
  <Text style={styles.weeklyDays}>{weekly.days_tracked} of 7 days tracked</Text>

  <View style={styles.calCard}>
    <View style={styles.calRingWrap}>
      <Svg width="100" height="100" viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r={40} fill="none" stroke="#DBEAFE" strokeWidth="8" />
        <Circle
          cx="50" cy="50" r={40} fill="none"
          stroke="#1E3A8A" strokeWidth="8"
          strokeDasharray={`${Math.min(weekly.calories / (goals.calories * 7), 1) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </Svg>
      <View style={styles.calCenter}>
        <Text style={styles.calNum}>{Math.round(weekly.calories)}</Text>
        <Text style={styles.calDen}>/ {goals.calories * 7}</Text>
      </View>
    </View>
    <View style={styles.calInfo}>
      <Text style={styles.calTitle}>{Math.round(weekly.calories)} kcal this week</Text>
      <Text style={styles.calRemain}>
        {Math.max((goals.calories * 7) - Math.round(weekly.calories), 0)} kcal remaining
      </Text>
    </View>
  </View>

  <View style={styles.macroRow}>
    <MacroCard
      label="Protein"
      value={weekly.protein_g}
      goal={goals.protein_g * 7}
      color="#3B82F6"
    />
    <MacroCard
      label="Carbs"
      value={weekly.carbs_g}
      goal={goals.carbs_g * 7}
      color="#EF9F27"
    />
    <MacroCard
      label="Fats"
      value={weekly.fat_g}
      goal={goals.fat_g * 7}
      color="#D85A30"
    />
  </View>
</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 20 },

  calCard: {
    backgroundColor: '#EFF6FF', borderRadius: 16,
    padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  calRingWrap: { width: 100, height: 100, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  calCenter: { position: 'absolute', alignItems: 'center' },
  calNum: { fontSize: 16, fontWeight: '600', color: '#1E40AF' },
  calDen: { fontSize: 11, color: '#3B82F6' },
  calInfo: { flex: 1 },
  calTitle: { fontSize: 15, fontWeight: '600', color: '#1E40AF' },
  calRemain: { fontSize: 13, color: '#3B82F6', marginTop: 4 },

  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  macroCard: {
    flex: 1, backgroundColor: '#f5f5f5',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  macroVal: { fontSize: 17, fontWeight: '600' },
  macroLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  barBg: {
    width: '100%', height: 3, backgroundColor: '#e0e0e0',
    borderRadius: 2, marginTop: 6, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
  macroGoal: { fontSize: 10, color: '#aaa', marginTop: 4 },

  sectionTitle: {
    fontSize: 11, fontWeight: '600', color: '#aaa',
    letterSpacing: 1, marginBottom: 10,
  },
  empty: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 20 },
  mealItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  mealName: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  mealTime: { fontSize: 12, color: '#aaa', marginTop: 2 },
  mealCal: { fontSize: 14, fontWeight: '600', color: '#555' },

  sectionHeader: {
  flexDirection: 'row', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: 10,
},
editToggle: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },
deleteBtn: {
  width: 24, height: 24, borderRadius: 12,
  backgroundColor: '#2563EB', alignItems: 'center',
  justifyContent: 'center', marginRight: 10,
},
deleteBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', lineHeight: 20 },
weeklySection: { marginTop: 24 },
weeklyHeader: {
  flexDirection: 'row', justifyContent: 'space-between',
  alignItems: 'center', marginBottom: 10,
},
weeklyDays: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
weeklyCard: {
  backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16,
},
weeklyRow: {
  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  paddingVertical: 8,
},
weeklyLabel: { fontSize: 13, color: '#888' },
weeklyVal: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
weeklyDivider: { height: 0.5, backgroundColor: '#e0e0e0' },
weeklyMacroRow: {
  flexDirection: 'row', justifyContent: 'space-between',
  marginTop: 12,
},
weeklyMacroItem: { flex: 1, alignItems: 'center' },
weeklyMacroVal: { fontSize: 18, fontWeight: '600' },
weeklyMacroLabel: { fontSize: 11, color: '#888', marginTop: 2 },
weeklyMacroAvg: { fontSize: 11, color: '#aaa', marginTop: 2 },
weeklySection: { marginTop: 24, marginBottom: 8 },
weeklyDays: { fontSize: 12, color: '#3B82F6', fontWeight: '500', marginBottom: 12 },
});