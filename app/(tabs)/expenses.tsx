import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  PermissionsAndroid, Platform, Animated, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { parseTransactionalSMS, ParsedTransaction } from '../../src/utils/smsParser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

let SmsListener: any = null;
try {
  if (Platform.OS === 'android') {
    SmsListener = require('react-native-android-sms-listener').default || require('react-native-android-sms-listener');
  }
} catch (e) {
  console.log('SMS Native module deferred.');
}

const TEST_MESSAGES = [
  "Rs 550.00 debited from a/c **4930. Info: Zomato/Mumbai/Ref#123",
  "INR 1,200.00 spent on Uber Ride via UPI. Acct 4321.",
  "Your a/c no. 8888 is credited by Rs. 15,000.00 on 10/11/2026. Info: Salary",
  "Rs. 299 paid to Netflix via Card ending 1234. Avail Lmt: 40k"
];

const FILTERS = ['All Time', 'This Month', 'This Week'];

export default function ExpensesScreen() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [listening, setListening] = useState(false);
  const [filter, setFilter] = useState('All Time');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedTx, setSelectedTx] = useState<ParsedTransaction | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const saveToStorage = async (newTx: ParsedTransaction) => {
    try {
      const existing = await AsyncStorage.getItem('ROAMIO_EXPENSES');
      const parsedExisting = existing ? JSON.parse(existing) : [];
      const updated = [newTx, ...parsedExisting];
      await AsyncStorage.setItem('ROAMIO_EXPENSES', JSON.stringify(updated));
    } catch (err) {}
  };

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem('ROAMIO_EXPENSES');
        if (stored) {
          setTransactions(JSON.parse(stored));
        }
      } catch (err) {}
    };
    loadTransactions();
  }, []);

  const requestRealPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          if (SmsListener) {
            setListening(true);
            SmsListener.addListener((message: any) => {
              const parsed = parseTransactionalSMS(message.body);
              if (parsed) {
                setTransactions(prev => [parsed, ...prev]);
                saveToStorage(parsed);
              }
            });
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const simulateIncomingSMS = () => {
    const randomMsg = TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)];
    const parsed = parseTransactionalSMS(randomMsg);
    if (parsed) {
      setTransactions(prev => [parsed, ...prev]);
      saveToStorage(parsed);
    }
  };

  const filteredTx = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if (filter === 'All Time') return true;
      const tdate = new Date(t.date);
      if (filter === 'This Month') return tdate.getMonth() === now.getMonth() && tdate.getFullYear() === now.getFullYear();
      if (filter === 'This Week') return (now.getTime() - tdate.getTime()) / (1000 * 3600 * 24) <= 7;
      return true;
    });
  }, [transactions, filter]);

  const totalSpent = filteredTx.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  
  // Custom Bar Chart calculations to replace PieChart which was error prone natively
  const grouped = filteredTx.filter(t => t.type === 'debit').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieColors = ['#FF1744', '#D50000', '#B71C1C', '#FF5252', '#FF8A80'];
  const pieData = Object.keys(grouped).map((k, i) => ({
    name: k,
    amount: grouped[k],
    color: pieColors[i % pieColors.length],
    legendFontColor: '#FFF',
    legendFontSize: 11
  })).sort((a,b) => b.amount - a.amount);

  const topCategories = Object.keys(grouped).sort((a,b) => grouped[b] - grouped[a]).slice(0,4);
  const maxCategory = topCategories.length ? grouped[topCategories[0]] : 1;

  const getCategoryIcon = (cat: string) => {
    if (cat === 'Food & Dining') return 'fast-food';
    if (cat === 'Travel & Transport') return 'car-sport';
    if (cat === 'Shopping') return 'bag-handle';
    if (cat === 'Entertainment') return 'film';
    return 'receipt';
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <Animated.View style={[st.header, { opacity: fadeAnim }]}>
        <View style={st.headerRow}>
          <Text style={st.title}>Wallet Insights</Text>
          <Ionicons name="finger-print" size={32} color="#FFF" />
        </View>
        <Text style={st.subtitle}>₹ {totalSpent.toLocaleString('en-IN')}</Text>
        <Text style={st.subtext}>Spent • {filter}</Text>
      </Animated.View>

      <FlatList
        data={filteredTx}
        keyExtractor={(item) => item.id!}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[st.filterPill, filter === f && st.filterPillActive]}>
                  <Text style={[st.filterPillText, filter === f && st.filterPillTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {topCategories.length > 0 && (
              <View style={st.chartCard}>
                <Text style={st.chartTitle}>Spending Analysis</Text>

                <PieChart
                  data={pieData}
                  width={Dimensions.get('window').width - 96}
                  height={150}
                  chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                  accessor={"amount"}
                  backgroundColor={"transparent"}
                  paddingLeft={"0"}
                  absolute
                  hasLegend={true}
                />

                {topCategories.map(cat => (
                  <View key={cat} style={st.barRow}>
                    <Text style={st.barLabel} numberOfLines={1}>{cat}</Text>
                    <View style={st.barTrack}>
                      <View style={[st.barFill, { width: `${(grouped[cat]/maxCategory)*100}%` }]} />
                    </View>
                    <Text style={st.barAmt}>₹{grouped[cat]}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={st.actionRow}>
              <TouchableOpacity style={st.syncBtn} onPress={requestRealPermissions}>
                <Ionicons name="sync" size={20} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={st.syncBtnText}>{listening ? 'Listening Live' : 'Enable Tracker'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.simBtn} onPress={simulateIncomingSMS}>
                <Text style={st.simBtnText}>Demo Catch</Text>
              </TouchableOpacity>
            </View>

            <Text style={st.listTitle}>Recent Activity</Text>
          </>
        }
        contentContainerStyle={st.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} style={st.glassCard} onPress={() => setSelectedTx(item)}>
            <View style={st.txRow}>
              <View style={st.txIconBox}>
                <Ionicons name={getCategoryIcon(item.category) as any} size={22} color={item.type === 'credit' ? '#00E676' : '#FF1744'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.txMerchant} numberOfLines={1}>{item.merchant}</Text>
                <Text style={st.txCategory}>{item.category}</Text>
              </View>
              <Text style={[st.txAmount, { color: item.type === 'credit' ? '#00E676' : '#FFF' }]}>
                {item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={st.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: 16 }} />
            <Text style={st.emptyText}>Standing by for Bank SMS...</Text>
          </View>
        }
      />

      {selectedTx && (
        <Modal transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>Transaction Details</Text>
                <TouchableOpacity onPress={() => setSelectedTx(null)}><Ionicons name="close" size={26} color="#FFF" /></TouchableOpacity>
              </View>
              <View style={st.modalBody}>
                <Text style={st.modalAmount}>₹{selectedTx.amount.toLocaleString('en-IN')}</Text>
                <Text style={st.modalStatus}>{selectedTx.type === 'credit' ? 'Successful Credit' : 'Successful Debit'}</Text>
                <View style={st.modalField}><Text style={st.modalLabel}>Merchant</Text><Text style={st.modalValue}>{selectedTx.merchant}</Text></View>
                <View style={st.modalField}><Text style={st.modalLabel}>Category</Text><Text style={st.modalValue}>{selectedTx.category}</Text></View>
                <View style={st.modalField}><Text style={st.modalLabel}>Account</Text><Text style={st.modalValue}>{selectedTx.account}</Text></View>
                <View style={st.modalField}><Text style={st.modalLabel}>Date</Text><Text style={st.modalValue}>{new Date(selectedTx.date).toLocaleString()}</Text></View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0F' }, 
  header: { padding: 24, paddingTop: 10, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 44, fontWeight: '900', color: '#00E676', marginTop: 12, letterSpacing: -1 },
  subtext: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  filterRow: { paddingHorizontal: 24, marginTop: 4, marginBottom: 20 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  filterPillActive: { backgroundColor: '#FFF', borderColor: '#FFF' },
  filterPillText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 13 },
  filterPillTextActive: { color: '#000', fontWeight: '900' },
  chartCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, padding: 24, marginHorizontal: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chartTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, width: 80, fontWeight: '600' },
  barTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginHorizontal: 10 },
  barFill: { height: '100%', backgroundColor: '#FF1744', borderRadius: 4 },
  barAmt: { color: '#FFF', fontSize: 12, fontWeight: '800', width: 50, textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 12, marginVertical: 20, paddingHorizontal: 24 },
  syncBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#00E676', padding: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  syncBtnText: { color: '#000', fontWeight: '900', fontSize: 13 },
  simBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  simBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  listContent: { paddingBottom: 140 },
  listTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 12, paddingHorizontal: 24 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 20, padding: 18, marginHorizontal: 24, marginBottom: 10 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  txIconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  txMerchant: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  txCategory: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', marginTop: 3 },
  txAmount: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#141518', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, paddingBottom: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  modalBody: { alignItems: 'center' },
  modalAmount: { color: '#FFF', fontSize: 46, fontWeight: '900', letterSpacing: -1 },
  modalStatus: { color: '#00E676', fontSize: 13, fontWeight: '800', marginTop: 8, marginBottom: 30 },
  modalField: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingVertical: 14 },
  modalLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  modalValue: { color: '#FFF', fontSize: 14, fontWeight: '800', textAlign: 'right', flex: 1 }
});
