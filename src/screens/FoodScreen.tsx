// src/screens/FoodScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, FlatList, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useAppStore, FoodLog } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { COLORS, FONT, SPACING, RADIUS, MEAL_CONFIG } from '../constants/theme';

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.macroPill, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
      <Text style={[styles.macroPillVal, { color }]}>{Math.round(value)}g</Text>
      <Text style={styles.macroPillLabel}>{label}</Text>
    </View>
  );
}

export default function FoodScreen() {
  const {
    foodLogs, todayCalories, todayProtein, todayCarbs, todayFats,
    addFoodLog, removeFoodLog, foodDatabase, user,
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [search, setSearch] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [form, setForm] = useState({
    foodName: '', calories: '', protein: '', carbs: '', fats: '', fiber: '',
    calcium: '', iron: '', magnesium: '',
  });

  const calorieGoal = user?.calorieGoal || 2000;
  const calPct = Math.min(Math.round((todayCalories / calorieGoal) * 100), 100);

  const filteredDB = (foodDatabase || []).filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFromDB = (food: typeof foodDatabase[0]) => {
    const now = new Date();
    addFoodLog({
      mealType: selectedMeal,
      foodName: food.name,
      calories: food.calories,
      protein:  food.protein,
      carbs:    food.carbs,
      fats:     food.fats,
      fiber:    food.fiber,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
    setShowAddModal(false);
    setSearch('');
  };

  const handleManualAdd = () => {
    if (!form.foodName || !form.calories) {
      Alert.alert('Missing info', 'Food name and calories are required');
      return;
    }
    const now = new Date();
    addFoodLog({
      mealType:  selectedMeal,
      foodName:  form.foodName,
      calories:  parseFloat(form.calories) || 0,
      protein:   parseFloat(form.protein)  || 0,
      carbs:     parseFloat(form.carbs)    || 0,
      fats:      parseFloat(form.fats)     || 0,
      fiber:     parseFloat(form.fiber)    || 0,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      calcium:   parseFloat(form.calcium)   || undefined,
      iron:      parseFloat(form.iron)      || undefined,
      magnesium: parseFloat(form.magnesium) || undefined,
    });
    setForm({ foodName:'', calories:'', protein:'', carbs:'', fats:'', fiber:'', calcium:'', iron:'', magnesium:'' });
    setShowAddModal(false);
  };

  const mealGroups = MEAL_TYPES.map((type) => ({
    type,
    config: MEAL_CONFIG[type],
    logs:  foodLogs.filter((l) => l.mealType === type),
    total: foodLogs.filter((l) => l.mealType === type).reduce((s, l) => s + l.calories, 0),
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Food Tracker 🍽️</Text>
            <Text style={styles.subtitle}>Track your daily nutrition</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.addBtnGrad}>
              <Text style={styles.addBtnText}>+ Log</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard} elevated>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryCalValue}>{todayCalories.toLocaleString()}</Text>
              <Text style={styles.summaryCalLabel}>/ {calorieGoal.toLocaleString()} kcal today</Text>
            </View>
            <View style={styles.summaryPillsCol}>
              <MacroPill label="Protein" value={todayProtein} color={COLORS.primary} />
              <MacroPill label="Carbs"   value={todayCarbs}   color={COLORS.orange} />
              <MacroPill label="Fats"    value={todayFats}    color={COLORS.red} />
            </View>
          </View>
          <ProgressBar
            value={todayCalories} max={calorieGoal}
            color={calPct > 100 ? COLORS.red : calPct > 80 ? COLORS.orange : COLORS.green}
            height={10} style={{ marginTop: SPACING.md }}
          />
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryFooterText}>0 kcal</Text>
            <Text style={[styles.summaryFooterText, { color: COLORS.primary }]}>{calPct}%</Text>
            <Text style={styles.summaryFooterText}>{calorieGoal.toLocaleString()} goal</Text>
          </View>
        </Card>

        {mealGroups.map(({ type, config, logs, total }) => (
          <Card key={type} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={[styles.mealIcon, { backgroundColor: `${config.color}20` }]}>
                <Text style={styles.mealIconText}>{config.emoji}</Text>
              </View>
              <View style={styles.mealTitleBlock}>
                <Text style={styles.mealTitle}>{config.label}</Text>
                {total > 0 && <Text style={[styles.mealTotal, { color: config.color }]}>{Math.round(total)} kcal</Text>}
              </View>
              <TouchableOpacity
                onPress={() => { setSelectedMeal(type); setShowAddModal(true); }}
                style={[styles.mealAddBtn, { borderColor: config.color }]}
              >
                <Text style={[styles.mealAddBtnText, { color: config.color }]}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {logs.length > 0 ? logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logInfo}>
                  <Text style={styles.logName}>{log.foodName}</Text>
                  <Text style={styles.logMacros}>
                    P:{Math.round(log.protein)}g · C:{Math.round(log.carbs)}g · F:{Math.round(log.fats)}g
                    {user?.isPremium && log.calcium ? `  |  Ca:${log.calcium}mg` : ''}
                  </Text>
                </View>
                <Text style={[styles.logCal, { color: config.color }]}>{Math.round(log.calories)}</Text>
                <TouchableOpacity onPress={() => removeFoodLog(log.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={styles.emptyMeal}>Tap + Add to log {config.label.toLowerCase()}</Text>
            )}
          </Card>
        ))}

        {user?.isPremium && (
          <Card style={styles.microCard}>
            <View style={styles.microHeader}>
              <Text style={styles.microTitle}>💎 Micronutrients</Text>
              <Badge label="PREMIUM" color={COLORS.yellow} />
            </View>
            {[
              { label: 'Calcium',   emoji: '🦴', value: foodLogs.reduce((s, l) => s + (l.calcium   || 0), 0), goal: 1000, unit: 'mg' },
              { label: 'Iron',      emoji: '⚡', value: foodLogs.reduce((s, l) => s + (l.iron      || 0), 0), goal: 18,   unit: 'mg' },
              { label: 'Magnesium', emoji: '🌿', value: foodLogs.reduce((s, l) => s + (l.magnesium || 0), 0), goal: 400,  unit: 'mg' },
            ].map((m) => (
              <View key={m.label} style={styles.microRow}>
                <Text style={styles.microEmoji}>{m.emoji}</Text>
                <View style={styles.microInfo}>
                  <View style={styles.microTopRow}>
                    <Text style={styles.microLabel}>{m.label}</Text>
                    <Text style={styles.microValue}>{Math.round(m.value)}/{m.goal}{m.unit}</Text>
                  </View>
                  <ProgressBar
                    value={m.value} max={m.goal}
                    color={m.value < m.goal * 0.5 ? COLORS.red : m.value < m.goal * 0.8 ? COLORS.orange : COLORS.green}
                    height={5}
                  />
                  {m.value < m.goal * 0.5 && (
                    <Text style={styles.microAlert}>⚠️ Low — consider {m.label === 'Calcium' ? 'dairy or leafy greens' : m.label === 'Iron' ? 'lean meats or legumes' : 'nuts or seeds'}</Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Food</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); setSearch(''); setManualMode(false); }} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealSelector}>
            {MEAL_TYPES.map((type) => {
              const cfg = MEAL_CONFIG[type];
              const active = selectedMeal === type;
              return (
                <TouchableOpacity key={type} onPress={() => setSelectedMeal(type)}
                  style={[styles.mealChip, active && { backgroundColor: `${cfg.color}20`, borderColor: cfg.color }]}>
                  <Text style={styles.mealChipEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.mealChipLabel, active && { color: cfg.color }]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.modeToggle}>
            <TouchableOpacity style={[styles.modeBtn, !manualMode && styles.modeBtnActive]} onPress={() => setManualMode(false)}>
              <Text style={[styles.modeBtnText, !manualMode && styles.modeBtnTextActive]}>🔍 Search Foods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeBtn, manualMode && styles.modeBtnActive]} onPress={() => setManualMode(true)}>
              <Text style={[styles.modeBtnText, manualMode && styles.modeBtnTextActive]}>✏️ Manual Entry</Text>
            </TouchableOpacity>
          </View>
          {!manualMode ? (
            <>
              <TextInput
                style={styles.searchInput} placeholder="Search food database..."
                placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch}
              />
              <FlatList
                data={filteredDB} keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.dbItem} onPress={() => handleAddFromDB(item)}>
                    <View style={styles.dbItemInfo}>
                      <Text style={styles.dbItemName}>{item.name}</Text>
                      <Text style={styles.dbItemMacros}>P:{item.protein}g · C:{item.carbs}g · F:{item.fats}g · {item.servingUnit}</Text>
                    </View>
                    <Text style={styles.dbItemCal}>{item.calories} kcal</Text>
                  </TouchableOpacity>
                )}
                style={styles.dbList}
              />
            </>
          ) : (
            <ScrollView style={styles.manualScroll} keyboardShouldPersistTaps="handled">
              {[
                { key: 'foodName', label: 'Food Name *',     placeholder: 'e.g. Chicken Breast', keyboard: 'default' },
                { key: 'calories', label: 'Calories (kcal) *', placeholder: '0',                  keyboard: 'numeric' },
                { key: 'protein',  label: 'Protein (g)',      placeholder: '0',                  keyboard: 'numeric' },
                { key: 'carbs',    label: 'Carbs (g)',        placeholder: '0',                  keyboard: 'numeric' },
                { key: 'fats',     label: 'Fats (g)',         placeholder: '0',                  keyboard: 'numeric' },
                { key: 'fiber',    label: 'Fiber (g)',        placeholder: '0',                  keyboard: 'numeric' },
              ].map((field) => (
                <View key={field.key} style={styles.formField}>
                  <Text style={styles.formLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.formInput} placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType={field.keyboard as any}
                    value={form[field.key as keyof typeof form]}
                    onChangeText={(v) => setForm((prev) => ({ ...prev, [field.key]: v }))}
                  />
                </View>
              ))}
              {user?.isPremium && (
                <>
                  <Text style={[styles.formLabel, { color: COLORS.yellow, marginTop: SPACING.lg }]}>💎 Micronutrients (Premium)</Text>
                  {[
                    { key: 'calcium',   label: 'Calcium (mg)' },
                    { key: 'iron',      label: 'Iron (mg)' },
                    { key: 'magnesium', label: 'Magnesium (mg)' },
                  ].map((field) => (
                    <View key={field.key} style={styles.formField}>
                      <Text style={styles.formLabel}>{field.label}</Text>
                      <TextInput
                        style={styles.formInput} placeholder="0"
                        placeholderTextColor={COLORS.textMuted} keyboardType="numeric"
                        value={form[field.key as keyof typeof form]}
                        onChangeText={(v) => setForm((prev) => ({ ...prev, [field.key]: v }))}
                      />
                    </View>
                  ))}
                </>
              )}
              <TouchableOpacity style={styles.saveBtn} onPress={handleManualAdd}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.saveBtnGrad}>
                  <Text style={styles.saveBtnText}>Log Food 🍎</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingBottom: 32, gap: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 2 },
  addBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  addBtnGrad: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  addBtnText: { fontSize: FONT.sm, fontWeight: '800', color: 'white' },
  summaryCard: { gap: SPACING.sm },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryCalValue: { fontSize: FONT.xxxl, fontWeight: '900', color: COLORS.textPrimary },
  summaryCalLabel: { fontSize: FONT.xs, color: COLORS.textMuted },
  summaryPillsCol: { gap: SPACING.sm },
  macroPill: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, borderWidth: 1, alignItems: 'center', flexDirection: 'row', gap: 4 },
  macroPillVal: { fontSize: FONT.sm, fontWeight: '800' },
  macroPillLabel: { fontSize: FONT.xs, color: COLORS.textMuted },
  summaryFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  summaryFooterText: { fontSize: FONT.xs, color: COLORS.textMuted },
  mealCard: { gap: SPACING.sm },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  mealIcon: { width: 36, height: 36, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  mealIconText: { fontSize: 18 },
  mealTitleBlock: { flex: 1 },
  mealTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  mealTotal: { fontSize: FONT.sm, fontWeight: '700' },
  mealAddBtn: { borderWidth: 1.5, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  mealAddBtnText: { fontSize: FONT.xs, fontWeight: '800' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle },
  logInfo: { flex: 1 },
  logName: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  logMacros: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2 },
  logCal: { fontSize: FONT.md, fontWeight: '800' },
  deleteBtn: { padding: SPACING.xs },
  deleteBtnText: { fontSize: FONT.sm, color: COLORS.textMuted },
  emptyMeal: { fontSize: FONT.sm, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.md },
  microCard: { gap: SPACING.md },
  microHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  microTitle: { fontSize: FONT.md, fontWeight: '800', color: COLORS.textPrimary },
  microRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  microEmoji: { fontSize: 22, marginTop: 2 },
  microInfo: { flex: 1, gap: SPACING.xs },
  microTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  microLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textPrimary },
  microValue: { fontSize: FONT.xs, color: COLORS.textMuted },
  microAlert: { fontSize: FONT.xs, color: COLORS.orange, marginTop: 2 },
  modal: { flex: 1, backgroundColor: COLORS.bg, paddingTop: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONT.xl, fontWeight: '900', color: COLORS.textPrimary },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  mealSelector: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg, flexGrow: 0 },
  mealChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, marginRight: SPACING.sm },
  mealChipEmoji: { fontSize: 16 },
  mealChipLabel: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textSecondary },
  modeToggle: { flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 4, gap: 4 },
  modeBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { fontSize: FONT.sm, fontWeight: '700', color: COLORS.textMuted },
  modeBtnTextActive: { color: 'white' },
  searchInput: { marginHorizontal: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  dbList: { flex: 1, paddingHorizontal: SPACING.lg },
  dbItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  dbItemInfo: { flex: 1 },
  dbItemName: { fontSize: FONT.md, fontWeight: '700', color: COLORS.textPrimary },
  dbItemMacros: { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2 },
  dbItemCal: { fontSize: FONT.sm, fontWeight: '800', color: COLORS.primary },
  manualScroll: { flex: 1, paddingHorizontal: SPACING.lg },
  formField: { marginBottom: SPACING.md },
  formLabel: { fontSize: FONT.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.xs },
  formInput: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, fontSize: FONT.md, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.lg, marginBottom: SPACING.xxl },
  saveBtnGrad: { paddingVertical: SPACING.lg, alignItems: 'center' },
  saveBtnText: { fontSize: FONT.lg, fontWeight: '800', color: 'white' },
});
