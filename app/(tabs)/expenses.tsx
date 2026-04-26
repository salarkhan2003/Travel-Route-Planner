/**
 * Roamio Wallet & Expenses — Mint Liquid Clay v2
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  PermissionsAndroid, Platform, Animated, Modal, Dimensions, TextInput, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { parseTransactionalSMS } from '../../src/utils/smsParser';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../../src/store/toastStore';
import { useTripStore } from '../../src/store/tripStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useSettingsStore } from '../../src/store/settingsStore';
import { MINT, CLAY_CARD_V2, CLAY_BTN_V2, FONTS, ACCENTS } from '../../src/constants/theme';

let SmsListener: any = null;
try { if (Platform.OS === 'android') { SmsListener = require('react-native-android-sms-listener').default || require('react-native-android-sms-listener'); } } catch {}

const { width } = Dimensions.get('window');

const DonutChart = ({ data, size = 180, txt1, txt2 }: { data: any[]; size?: number; txt1: string; txt2: string }) => {
  const total = data.reduce((a, d) => a + d.amount, 0);
  if (total === 0) return null;
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 28;
  let cum = 0;
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {data.map((d, i) => {
              const pct = d.amount / total;
              const dash = circumference * pct;
              const gap = circumference - dash;
              const offset = circumference * cum;
              cum += pct;
              return <Circle key={i} cx={size/2} cy={size/2} r={radius} stroke={d.color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} strokeLinecap="round"/>;
            })}
          </G>
        </Svg>
        <Text style={{ fontSize: 26, fontFamily: FONTS.display, fontWeight: '900', color: txt1 }}>
          ₹{total >= 1000 ? `${(total/1000).toFixed(1)}k` : total}
        </Text>
        <Text style={{ fontSize: 9, fontFamily: FONTS.display, color: txt2, fontWeight: '900', letterSpacing: 1.5 }}>SPENT</Text>
      </View>
    </View>
  );
};

export default function ExpensesScreen() {
  const darkMode = useSettingsStore(s => s.darkMode);
  const bg      = darkMode ? '#020F08' : MINT[50];
  const card    = darkMode ? '#0A1A12' : '#FFFFFF';
  const border  = darkMode ? '#163322' : 'rgba(167,243,208,0.4)';
  const primary = darkMode ? '#00F59B' : MINT[500];
  const txt1    = darkMode ? '#F0FDF4' : MINT[900];
  const txt2    = darkMode ? '#6EE7B7' : MINT[700];
  const surf    = darkMode ? '#0E291B' : MINT[100];
  const err     = darkMode ? '#FF453A' : '#EF4444';

  const { t } = useTranslation();
  const extraExpenses = useTripStore(s => s.extraExpenses);
  const addExtraExpense = useTripStore(s => s.addExtraExpense);
  const setExtraExpenses = useTripStore(s => s.setExtraExpenses);
  const showToast = useToastStore(s => s.showToast);

  const [filter, setFilter] = useState('All Time');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const PIE_COLORS = [primary, ACCENTS.budget.fg, '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6'];
  const FILTERS = ['All Time', 'This Month', 'This Week'];
  const CATEGORIES = ['Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Other'];

  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(); }, []);

  const deleteTransaction = (id: string) => { setExtraExpenses(extraExpenses.filter(t => t.id !== id)); showToast('Deleted', 'warning'); };
  const updateTransaction = (tx: any) => { setExtraExpenses(extraExpenses.map(t => t.id === tx.id ? tx : t)); showToast('Updated', 'construct'); };

  const handleSaveManual = () => {
    const amt = parseFloat(addAmount);
    if (!amt || !addMerchant.trim()) return;
    if (editingTx) {
      updateTransaction({ ...editingTx, amount: amt, merchant: addMerchant.trim(), category: addCategory, type: addType });
    } else {
      addExtraExpense({ amount: amt, text: addMerchant.trim(), category: addCategory, type: addType, account: 'Manual Entry', merchant: addMerchant.trim() });
    }
    setAddAmount(''); setAddMerchant(''); setShowAdd(false); setEditingTx(null);
    showToast(editingTx ? 'Updated!' : 'Expense added!', 'construct');
  };

  const openEdit = (tx: any) => {
    setEditingTx(tx); setAddAmount(String(tx.amount)); setAddMerchant(tx.merchant || tx.text); setAddCategory(tx.category || 'Other');
    setAddType(tx.type as any || 'debit'); setShowAdd(true);
  };

  const simulateIncomingSMS = () => {
    const msgs = ["Rs 550.00 debited from a/c **4930. Info: Zomato/Mumbai", "INR 1,200.00 spent on Uber Ride via UPI. Acct 4321.", "Rs. 299 paid to Netflix via Card ending 1234."];
    const parsed = parseTransactionalSMS(msgs[Math.floor(Math.random() * msgs.length)]);
    if (parsed) {
      addExtraExpense({ amount: parsed.amount, text: parsed.merchant, category: parsed.category, type: parsed.type, merchant: parsed.merchant });
      showToast(`Tracked ₹${parsed.amount}`, 'cash-outline');
    }
  };

  const filteredTx = useMemo(() => {
    const now = new Date();
    return (extraExpenses as any[]).slice().reverse().filter(t => {
      if (filter === 'All Time') return true;
      const td = new Date(t.date);
      if (filter === 'This Month') return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
      if (filter === 'This Week') return (now.getTime() - td.getTime()) / 86400000 <= 7;
      return true;
    });
  }, [extraExpenses, filter]);

  const totalSpent = filteredTx.filter(t => (t.type || 'debit') === 'debit').reduce((a, t) => a + t.amount, 0);
  const totalCredit = filteredTx.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);

  const grouped = filteredTx.filter(t => (t.type || 'debit') === 'debit').reduce((a, t) => { 
    const cat = t.category || 'Other'; a[cat] = (a[cat] || 0) + t.amount; return a; 
  }, {} as Record<string, number>);
  const pieData = Object.keys(grouped).map((k, i) => ({ name: k, amount: grouped[k], color: PIE_COLORS[i % PIE_COLORS.length] })).sort((a, b) => b.amount - a.amount);
  const topCats = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]).slice(0, 4);

  const catIcon = (c: string) => {
    if (c.includes('Food')) return 'fast-food'; if (c.includes('Travel')) return 'car-sport';
    if (c.includes('Shop')) return 'bag-handle'; if (c.includes('Entertain')) return 'film';
    if (c.includes('Bill')) return 'flash'; if (c.includes('Health')) return 'medkit'; return 'receipt';
  };

  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMerchant, setAddMerchant] = useState('');
  const [addCategory, setAddCategory] = useState('Food & Dining');
  const [addType, setAddType] = useState<'debit' | 'credit'>('debit');
  const [editingTx, setEditingTx] = useState<any | null>(null);

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: bg }}>
        <Animated.View style={[s.header, { opacity: fadeAnim }]}>
          <View style={s.headerRow}>
            <View>
              <Text style={[s.headerSup, { color: primary }]}>AI WALLET</Text>
              <Text style={[s.headerTitle, { color: txt1 }]}>{t('wallet_insights') || 'Expenses'}</Text>
            </View>
            <TouchableOpacity onPress={() => { setEditingTx(null); setAddAmount(''); setAddMerchant(''); setShowAdd(true); }} activeOpacity={0.8}>
              <View style={[s.addBtn, { backgroundColor: primary, shadowColor: primary }]}>
                 <Ionicons name="add" size={24} color="#FFF"/>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
        <View style={s.filterWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.8}
                style={[s.filterPill, filter === f ? { backgroundColor: txt1 } : { backgroundColor: card, borderColor: border }]}>
                <Text style={{ fontFamily: FONTS.display, fontSize: 13, fontWeight: '800', color: filter === f ? bg : txt2 }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      <FlatList data={filteredTx} keyExtractor={(item, index) => item.id || `idx-${index}`} showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <View style={s.statsRow}>
              <View style={[s.statCard, { backgroundColor: card, borderColor: border }]}>
                <Text style={[s.statAmt, { color: txt1 }]}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                <Text style={[s.statDesc, { color: txt2 }]}>SPENT</Text>
              </View>
              <View style={[s.statCard, { backgroundColor: darkMode ? primary + '25' : primary + '15', borderColor: border }]}>
                <Text style={[s.statAmt, { color: primary }]}>+₹{totalCredit.toLocaleString('en-IN')}</Text>
                <Text style={[s.statDesc, { color: primary }]}>CREDIT</Text>
              </View>
            </View>

            {pieData.length > 0 && (
              <View style={[s.chartCard, { backgroundColor: card, borderColor: border }]}>
                <Text style={[s.chartTitle, { color: txt2 }]}>SPENDING BREAKDOWN</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: width * 0.4 }}>
                    <DonutChart data={pieData} size={width * 0.38} txt1={txt1} txt2={txt2}/>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 16 }}>
                    {topCats.map(cat => (
                      <View key={cat} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <View style={[s.chartLegendDot, { backgroundColor: PIE_COLORS[topCats.indexOf(cat) % PIE_COLORS.length] }]} />
                          <Text style={[s.chartLegendTxt, { color: txt1 }]} numberOfLines={1}>{cat}</Text>
                        </View>
                        <Text style={[s.chartLegendAmt, { color: txt2 }]}>₹{grouped[cat].toLocaleString('en-IN')}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={s.actionRow}>
              <TouchableOpacity style={[s.simBtn, { backgroundColor: card, borderColor: border }]} onPress={simulateIncomingSMS}>
                <Ionicons name="flash" size={16} color={txt1} style={{marginRight:6}}/>
                <Text style={[s.simBtnText, { color: txt1 }]}>Simulate SMS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.simBtn, { backgroundColor: darkMode ? err + '25' : err + '15', borderColor: border }]} onPress={() => { setExtraExpenses([]); showToast('All cleared', 'warning'); }}>
                <Ionicons name="trash" size={16} color={err} style={{marginRight:4}}/>
                <Text style={[s.simBtnText, { color: err }]}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <Text style={[s.listTitle, { color: txt2 }]}>RECENT TRANSACTIONS</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedTx(item)} onLongPress={() => openEdit(item)}
              style={[s.glassCard, { backgroundColor: card, borderColor: border }]}>
            <View style={s.txIconBox}>
              <Ionicons name={catIcon(item.category) as any} size={22} color={item.type==='credit'? primary : txt1}/>
            </View>
            <View style={{flex:1, marginLeft: 14}}>
              <Text style={[s.txMerchant, { color: txt1 }]} numberOfLines={1}>{item.merchant || item.text}</Text>
              <Text style={[s.txCategory, { color: txt2 }]}>{item.category || 'Other'} · {new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={[s.txAmount, { color: item.type==='credit' ? primary : txt1 }]}>
              {item.type==='credit'?'+':'-'}₹{item.amount.toLocaleString('en-IN')}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="wallet-outline" size={60} color={txt2} style={{marginBottom:16}}/>
            <Text style={[s.emptyText, { color: txt1 }]}>It's quiet here...</Text>
            <Text style={[s.emptyHint, { color: txt2 }]}>Tap + to log an expense or wait for SMS read</Text>
          </View>
        }
      />

      {selectedTx && (
        <Modal transparent animationType="slide">
          <View style={s.modalBg}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSelectedTx(null)} />
            <View style={[s.ticketSheet, { backgroundColor: card }]}>
              <View style={[s.txModalIconWrap, { backgroundColor: selectedTx.type==='credit' ? primary+'25': surf }]}>
                <Ionicons name={catIcon(selectedTx.category) as any} size={40} color={selectedTx.type==='credit'? primary: txt1}/>
              </View>
              <Text style={[s.modalAmount, { color: txt1 }]}>{selectedTx.type==='credit'?'+':'-'}₹{selectedTx.amount.toLocaleString('en-IN')}</Text>
              <Text style={[s.modalCat, { color: txt2 }]}>{selectedTx.merchant || selectedTx.text}</Text>
              <View style={{height: 1, backgroundColor: border, marginVertical: 24}}/>
              
              <View style={s.modalRow}><Text style={[s.mLabel, {color: txt2}]}>Category</Text><Text style={[s.mVal, {color: txt1}]}>{selectedTx.category || 'Other'}</Text></View>
              <View style={s.modalRow}><Text style={[s.mLabel, {color: txt2}]}>Account / Source</Text><Text style={[s.mVal, {color: txt1}]}>{selectedTx.account || 'N/A'}</Text></View>
              <View style={s.modalRow}><Text style={[s.mLabel, {color: txt2}]}>Date</Text><Text style={[s.mVal, {color: txt1}]}>{new Date(selectedTx.date).toLocaleString()}</Text></View>

              <View style={{flexDirection:'row',gap:12,marginTop:32}}>
                <TouchableOpacity style={[s.editBtn, { backgroundColor: surf }]} onPress={() => { setSelectedTx(null); openEdit(selectedTx); }}>
                  <Text style={{color:txt1,fontWeight:'900',fontFamily:FONTS.display,fontSize:14}}>Edit Transaction</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.editBtn, { backgroundColor: darkMode ? err+'20' : err+'15' }]} onPress={() => { deleteTransaction(selectedTx.id!); setSelectedTx(null); }}>
                  <Text style={{color:err,fontWeight:'900',fontFamily:FONTS.display,fontSize:14}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {showAdd && (
        <Modal transparent animationType="slide">
          <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={s.modalBg}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => { setShowAdd(false); setEditingTx(null); }} />
            <View style={[s.ticketSheet, { backgroundColor: card }]}>
              <Text style={[s.addTitle, { color: txt1 }]}>{editingTx ? 'Update Ledger' : 'New Transaction'}</Text>
              
              <View style={{flexDirection:'row',gap:12,marginBottom:24,marginTop:20}}>
                <TouchableOpacity style={[s.typeBtn, { backgroundColor: surf }, addType==='debit'&&{backgroundColor: err, borderColor: err}]} onPress={() => setAddType('debit')}>
                  <Text style={{fontFamily:FONTS.display, color:addType==='debit'?'#FFF':txt2,fontWeight:'800',fontSize:13}}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.typeBtn, { backgroundColor: surf }, addType==='credit'&&{backgroundColor: primary, borderColor: primary}]} onPress={() => setAddType('credit')}>
                  <Text style={{fontFamily:FONTS.display, color:addType==='credit'?'#FFF':txt2,fontWeight:'800',fontSize:13}}>Income</Text>
                </TouchableOpacity>
              </View>

              <TextInput style={[s.addInput, { backgroundColor: surf, color: txt1, borderColor: border, fontSize: 32 }]} placeholder="₹ 0" placeholderTextColor={txt2} value={addAmount} onChangeText={setAddAmount} keyboardType="numeric"/>
              <TextInput style={[s.addInput, { backgroundColor: surf, color: txt1, borderColor: border }]} placeholder="Merchant (e.g. Starbucks)" placeholderTextColor={txt2} value={addMerchant} onChangeText={setAddMerchant}/>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:24, marginTop:10}} contentContainerStyle={{paddingRight:24}}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} onPress={() => setAddCategory(c)} style={[s.catChip, { backgroundColor: surf, borderColor: border }, addCategory===c&&{backgroundColor: txt1, borderColor: txt1}]}>
                    <Ionicons name={catIcon(c) as any} size={14} color={addCategory===c ? card : txt2}/>
                    <Text style={{fontFamily:FONTS.display,fontSize:12,fontWeight:'800',color:addCategory===c ? card : txt2,marginLeft:6}}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[s.saveBtn, { backgroundColor: primary }]} onPress={handleSaveManual}>
                <Text style={{fontFamily:FONTS.display, color:onPri(primary),fontWeight:'900',fontSize:16}}>{editingTx ? 'Update Entry' : 'Save Transaction'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

function onPri(c: string) { return '#000'; }

const s = StyleSheet.create({
  root:{flex:1},
  header:{paddingHorizontal:24,paddingTop:12,paddingBottom:16},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  headerSup:{fontSize:10,fontFamily:FONTS.display,fontWeight:'900',letterSpacing:1.5,marginBottom:4},
  headerTitle:{fontSize:32,fontFamily:FONTS.display,fontWeight:'900',letterSpacing:-0.5},
  addBtn:{width:50,height:50,borderRadius:25,alignItems:'center',justifyContent:'center',elevation:6,shadowOpacity:0.3,shadowOffset:{width:0,height:4}},
  
  filterWrap:{marginBottom:16},
  filterPill:{paddingHorizontal:18,paddingVertical:12,borderRadius:24,marginRight:12,borderWidth:1.5},
  
  statsRow:{flexDirection:'row',gap:12,marginBottom:16},
  statCard: { ...CLAY_CARD_V2,flex:1,borderRadius:28,padding:20,borderWidth:1.5},
  statAmt:{fontSize:24,fontFamily:FONTS.display,fontWeight:'900'},
  statDesc:{fontSize:10,fontFamily:FONTS.display,fontWeight:'900',letterSpacing:1.5,marginTop:6},
  
  chartCard: { ...CLAY_CARD_V2,borderRadius:36,padding:24,borderWidth:1.5, marginBottom:16},
  chartTitle:{fontSize:10,fontFamily:FONTS.display,fontWeight:'900',letterSpacing:1.5},
  chartLegendDot:{width:10,height:10,borderRadius:5,marginRight:8},
  chartLegendTxt:{fontSize:12,fontFamily:FONTS.display,fontWeight:'800',flex:1},
  chartLegendAmt:{fontSize:14,fontFamily:FONTS.display,fontWeight:'900'},
  
  actionRow:{flexDirection:'row',gap:12,marginBottom:24},
  simBtn:{flex:1,flexDirection:'row',padding:16,borderRadius:20,alignItems:'center',justifyContent:'center',borderWidth:1.5},
  simBtnText:{fontFamily:FONTS.display,fontWeight:'900',fontSize:13},
  
  listTitle:{fontSize:10,fontFamily:FONTS.display,fontWeight:'900',marginBottom:12,letterSpacing:1.5,marginTop:10},
  glassCard: { ...CLAY_CARD_V2,borderRadius:24,padding:16,marginHorizontal:16,marginBottom:12,borderWidth:1.5, flexDirection:'row',alignItems:'center'},
  txIconBox:{width:46,height:46,borderRadius:20,backgroundColor:'rgba(0,0,0,0.04)',alignItems:'center',justifyContent:'center'},
  txMerchant:{fontSize:16,fontFamily:FONTS.display,fontWeight:'900'},
  txCategory:{fontSize:12,fontFamily:FONTS.body,fontWeight:'600',marginTop:2},
  txAmount:{fontSize:20,fontFamily:FONTS.display,fontWeight:'900',letterSpacing:-0.5},
  
  emptyState:{alignItems:'center',justifyContent:'center',paddingVertical:60},
  emptyText:{fontSize:18,fontFamily:FONTS.display,fontWeight:'900'},
  emptyHint:{fontSize:13,fontFamily:FONTS.body,marginTop:6},
  
  modalBg:{flex:1,backgroundColor:'rgba(0,0,0,0.85)',justifyContent:'flex-end'},
  ticketSheet:{borderTopLeftRadius:40,borderTopRightRadius:40,padding:30,paddingBottom:50},
  txModalIconWrap:{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center',alignSelf:'center',marginBottom:20},
  modalAmount:{fontSize:48,fontFamily:FONTS.display,fontWeight:'900',textAlign:'center'},
  modalCat:{fontSize:16,fontFamily:FONTS.body,fontWeight:'600',textAlign:'center',marginTop:4},
  modalRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:16},
  mLabel:{fontSize:13,fontFamily:FONTS.display,fontWeight:'800'},
  mVal:{fontSize:14,fontFamily:FONTS.display,fontWeight:'900'},
  editBtn:{flex:1,padding:18,borderRadius:22,alignItems:'center',justifyContent:'center'},
  
  addTitle:{fontSize:24,fontFamily:FONTS.display,fontWeight:'900'},
  typeBtn:{flex:1,padding:16,borderRadius:20,alignItems:'center',borderWidth:1.5},
  addInput:{borderRadius:24,padding:18,fontSize:18,fontFamily:FONTS.display,fontWeight:'900',marginBottom:16,borderWidth:1.5},
  catChip:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12,borderRadius:20,borderWidth:1.5},
  saveBtn: { ...CLAY_BTN_V2,padding:20,borderRadius:24,alignItems:'center',marginTop:10},
});
