import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { getGoals, updateGoals } from '../../lib/database';

export default function GoalsScreen() {
  const [goals, setGoals] = useState({
    calories: '2000', protein_g: '125', carbs_g: '200', fat_g: '50'
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...goals });

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  async function loadGoals() {
    const g = await getGoals();
    const loaded = {
      calories: String(g.calories),
      protein_g: String(g.protein_g),
      carbs_g: String(g.carbs_g),
      fat_g: String(g.fat_g),
    };
    setGoals(loaded);
    setDraft(loaded);
  }

  async function handleSave() {
    const c = parseInt(draft.calories);
    const p = parseFloat(draft.protein_g);
    const carb = parseFloat(draft.carbs_g);
    const f = parseFloat(draft.fat_g);

    if ([c, p, carb, f].some(isNaN)) {
      Alert.alert('Invalid input', 'Please enter valid numbers for all goals.');
      return;
    }

    await updateGoals(c, p, carb, f);
    setGoals(draft);
    setEditing(false);
  }

  const rows = [
    { label: 'Calories', unit: 'kcal / day', key: 'calories' },
    { label: 'Protein', unit: 'grams / day', key: 'protein_g' },
    { label: 'Carbohydrates', unit: 'grams / day', key: 'carbs_g' },
    { label: 'Fats', unit: 'grams / day', key: 'fat_g' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Daily macro goals</Text>
            <Text style={styles.sub}>We'll use these to track your progress</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => editing ? handleSave() : setEditing(true)}
          >
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <View>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.unit}>{row.unit}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.valueInput}
                value={draft[row.key]}
                onChangeText={(val) => setDraft(prev => ({ ...prev, [row.key]: val }))}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{goals[row.key]}{row.key !== 'calories' ? 'g' : ' kcal'}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setDraft(goals); setEditing(false); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 13, color: '#888', marginTop: 2 },
  editBtn: { backgroundColor: '#3B82F6', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  label: { fontSize: 14, color: '#1a1a1a' },
  unit: { fontSize: 12, color: '#aaa', marginTop: 2 },
  value: { fontSize: 14, fontWeight: '600', color: '#555' },
  valueInput: {
    borderWidth: 0.5, borderColor: '#3B82F6', borderRadius: 8,
    padding: 8, fontSize: 14, color: '#1a1a1a', width: 90, textAlign: 'right',
  },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#aaa', fontSize: 14 },
});