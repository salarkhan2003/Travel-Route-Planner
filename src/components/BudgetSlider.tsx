import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTripStore } from '../store/tripStore';
import type { TripState } from '../types/trip';

const MAX_BUDGET = 2000;
const MIN_BUDGET = 100;

export function BudgetSlider() {
  const globalBudget = useTripStore((s: TripState) => s.globalBudget);
  const spentBudget = useTripStore((s: TripState) => s.spentBudget);
  const setBudget = useTripStore((s: TripState) => s.setBudget);

  const remaining = globalBudget - spentBudget;
  const usedPercent = Math.min((spentBudget / globalBudget) * 100, 100);
  const isOverBudget = spentBudget > globalBudget;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Budget</Text>
        <Text style={[styles.budgetValue, isOverBudget && styles.overBudget]}>
          ${globalBudget}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${usedPercent}%` as any,
              backgroundColor: isOverBudget ? '#FF4444' : '#39FF14',
            },
          ]}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.spentText}>Spent: ${spentBudget.toFixed(0)}</Text>
        <Text style={[styles.remainingText, isOverBudget && styles.overBudget]}>
          {isOverBudget ? `Over by $${(spentBudget - globalBudget).toFixed(0)}` : `Left: $${remaining.toFixed(0)}`}
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={MIN_BUDGET}
        maximumValue={MAX_BUDGET}
        step={50}
        value={globalBudget}
        onValueChange={setBudget}
        minimumTrackTintColor="#39FF14"
        maximumTrackTintColor="rgba(255,255,255,0.15)"
        thumbTintColor="#39FF14"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
  },
  budgetValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  overBudget: {
    color: '#FF4444',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  spentText: {
    color: '#888',
    fontSize: 11,
  },
  remainingText: {
    color: '#39FF14',
    fontSize: 11,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 32,
    marginTop: 2,
  },
});
