import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FullCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  primaryColor: string;
  textColor: string;
  subTextColor: string;
  cardColor: string;
  borderColor: string;
  surfaceColor: string;
  minDate?: Date;
  /** Optional availability map: 'available' | 'limited' | 'unavailable' */
  availability?: Record<string, 'available' | 'limited' | 'unavailable'>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function FullCalendar({
  selectedDate, onDateSelect, primaryColor, textColor, subTextColor,
  cardColor, borderColor, surfaceColor, minDate, availability,
}: FullCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const min = minDate ?? today;

  return (
    <View style={[cal.root, { backgroundColor: cardColor, borderColor }]}>
      {/* Month navigation */}
      <View style={cal.header}>
        <TouchableOpacity onPress={prevMonth} style={[cal.navBtn, { borderColor }]}>
          <Ionicons name="chevron-back" size={18} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[cal.monthTitle, { color: textColor }]}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={[cal.navBtn, { borderColor }]}>
          <Ionicons name="chevron-forward" size={18} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={cal.weekRow}>
        {WEEKDAYS.map(d => (
          <Text key={d} style={[cal.weekLabel, { color: subTextColor }]}>{d}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={cal.grid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`e-${idx}`} style={cal.cell} />;
          }
          const thisDate = new Date(viewYear, viewMonth, day);
          const key = dateKey(thisDate);
          const isPast = thisDate < new Date(min.getFullYear(), min.getMonth(), min.getDate());
          const isToday = dateKey(thisDate) === dateKey(today);
          const isSelected = selectedDate ? dateKey(selectedDate) === key : false;
          const avail = availability?.[key];

          let dotColor: string | null = null;
          if (avail === 'available') dotColor = '#10B981';
          else if (avail === 'limited') dotColor = '#F59E0B';
          else if (avail === 'unavailable') dotColor = '#EF4444';

          return (
            <TouchableOpacity
              key={key}
              style={[
                cal.cell,
                isSelected && { backgroundColor: primaryColor, borderRadius: 12 },
                isToday && !isSelected && { borderWidth: 1.5, borderColor: primaryColor, borderRadius: 12 },
                isPast && { opacity: 0.3 },
              ]}
              onPress={() => {
                if (!isPast) onDateSelect(thisDate);
              }}
              disabled={isPast || avail === 'unavailable'}
              activeOpacity={0.75}
            >
              <Text style={[
                cal.dayTxt,
                { color: isSelected ? '#FFF' : isPast ? subTextColor : textColor },
                isToday && !isSelected && { color: primaryColor, fontWeight: '900' },
              ]}>
                {day}
              </Text>
              {dotColor && !isSelected && (
                <View style={[cal.dot, { backgroundColor: dotColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      {availability && (
        <View style={cal.legend}>
          {[
            { color: '#10B981', label: 'Available' },
            { color: '#F59E0B', label: 'Limited' },
            { color: '#EF4444', label: 'Full' },
          ].map(l => (
            <View key={l.label} style={cal.legendItem}>
              <View style={[cal.legendDot, { backgroundColor: l.color }]} />
              <Text style={[cal.legendTxt, { color: subTextColor }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** Modal wrapper for inline toggle */
interface CalendarPickerProps extends FullCalendarProps {
  label?: string;
}

export function CalendarPicker({ label = 'Select Date', ...rest }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const { selectedDate, primaryColor, textColor, subTextColor, cardColor, borderColor } = rest;

  const display = selectedDate
    ? `${MONTHS[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
    : 'Tap to select date';

  return (
    <>
      <TouchableOpacity
        style={[cpk.trigger, { backgroundColor: cardColor, borderColor }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar-outline" size={18} color={primaryColor} />
        <View style={{ flex: 1 }}>
          <Text style={[cpk.label, { color: subTextColor }]}>{label.toUpperCase()}</Text>
          <Text style={[cpk.value, { color: selectedDate ? textColor : subTextColor }]}>{display}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={primaryColor} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={cpk.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setOpen(false)} />
          <View style={[cpk.sheet, { backgroundColor: rest.surfaceColor }]}>
            <View style={[cpk.drag, { backgroundColor: borderColor }]} />
            <Text style={[cpk.sheetTitle, { color: textColor }]}>Choose Travel Date</Text>
            <FullCalendar {...rest} onDateSelect={(d) => { rest.onDateSelect(d); setOpen(false); }} />
            <TouchableOpacity
              style={[cpk.closeBtn, { borderColor }]}
              onPress={() => setOpen(false)}
            >
              <Text style={[cpk.closeTxt, { color: textColor }]}>Done</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const cal = StyleSheet.create({
  root: { borderRadius: 20, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayTxt: { fontSize: 14, fontWeight: '700' },
  dot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10, paddingTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendTxt: { fontSize: 10, fontWeight: '700' },
});

const cpk = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingTop: 14 },
  drag: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  closeBtn: { height: 52, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  closeTxt: { fontSize: 14, fontWeight: '800' },
});
