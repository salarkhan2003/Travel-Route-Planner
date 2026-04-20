import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  PermissionsAndroid, Platform, Animated, Modal, Dimensions, TextInput, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { parseTransactionalSMS, ParsedTransaction } from '../../src/utils/smsParser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../../src/store/toastStore';

let SmsListener: any = null;
try { if (Platform.OS === 'android') { SmsListener = require('react-native-android-sms-listener').default || require('react-native-android-sms-listener'); } } catch {}

const FILTERS = ['All Time', 'This Month', 'This Week'];
const PIE_COLORS = ['#FF1744', '#D500F9', '#FF9100', '#00E5FF', '#76FF03', '#FFD600', '#E040FB'];
const CATEGORIES = ['Food & Dining', 'Travel & Transport', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Other'];
const STORE_KEY = 'ROAMIO_EXPENSES';

const DonutChart = ({ data, size = 170 }: { data: { name: string; amount: number; color: string }[]; size?: number }) => {
  const total = data.reduce((a, d) => a + d.amount, 0);
  if (total === 0) return null;
  const radius = size / 2 - 18;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 24;
  let cum = 0;
  return (
    <View style={{ alignItems: 'center', marginVertical: 14 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
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
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFF' }}>₹{total >= 1000 ? `${(total/1000).toFixed(1)}k` : total}</Text>
          <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '700' }}>TOTAL SPENT</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10, gap: 6 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color, marginRight: 4 }} />
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' }}>{d.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ExpensesScreen() {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [listening, setListening] = useState(false);
  const [filter, setFilter] = useState('All Time');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedTx, setSelectedTx] = useState<ParsedTransaction | null>(null);
  const showToast = useToastStore(s => s.showToast);

  // Manual add
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMerchant, setAddMerchant] = useState('');
  const [addCategory, setAddCategory] = useState('Food & Dining');
  const [addType, setAddType] = useState<'debit' | 'credit'>('debit');
  const [editingTx, setEditingTx] = useState<ParsedTransaction | null>(null);

  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(); }, []);

  const persistAll = async (txs: ParsedTransaction[]) => {
    try { await AsyncStorage.setItem(STORE_KEY, JSON.stringify(txs)); } catch {}
  };

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORE_KEY);
        if (stored) setTransactions(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  const addTransaction = (tx: ParsedTransaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    persistAll(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    persistAll(updated);
    showToast('Transaction deleted', 'warning');
  };

  const updateTransaction = (tx: ParsedTransaction) => {
    const updated = transactions.map(t => t.id === tx.id ? tx : t);
    setTransactions(updated);
    persistAll(updated);
    showToast('Transaction updated', 'construct');
  };

  const handleSaveManual = () => {
    const amt = parseFloat(addAmount);
    if (!amt || !addMerchant.trim()) return;
    if (editingTx) {
      updateTransaction({ ...editingTx, amount: amt, merchant: addMerchant.trim(), category: addCategory, type: addType });
    } else {
      addTransaction({
        id: `manual_${Date.now()}`, amount: amt, merchant: addMerchant.trim(), category: addCategory,
        type: addType, account: 'Manual Entry', date: new Date().toISOString(),
      });
    }
    setAddAmount(''); setAddMerchant(''); setShowAdd(false); setEditingTx(null);
    showToast(editingTx ? 'Updated!' : 'Expense added!', 'construct');
  };

  const openEdit = (tx: ParsedTransaction) => {
    setEditingTx(tx);
    setAddAmount(String(tx.amount));
    setAddMerchant(tx.merchant);
    setAddCategory(tx.category);
    setAddType(tx.type as any);
    setShowAdd(true);
  };

  const requestRealPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS, 
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);
        if (granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED) {
          setListening(true);
          showToast('SMS Tracker active', 'construct');
        } else {
          showToast('SMS permission denied', 'warning');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      showToast('SMS Tracking only on Android', 'warning');
    }
  };

  useEffect(() => {
    let subscription: any;
    if (listening && SmsListener) {
      subscription = SmsListener.addListener((msg: any) => {
        try {
          const parsed = parseTransactionalSMS(msg.body);
          if (parsed) {
            addTransaction(parsed);
            showToast(`New transaction: ₹${parsed.amount}`, 'construct');
          }
        } catch (e) {
          console.error('SMS Parse Error:', e);
        }
      });
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [listening]);

  const simulateIncomingSMS = () => {
    const msgs = [
      "Rs 550.00 debited from a/c **4930. Info: Zomato/Mumbai",
      "INR 1,200.00 spent on Uber Ride via UPI. Acct 4321.",
      "Rs. 299 paid to Netflix via Card ending 1234.",
      "Rs 2,500.00 debited for Amazon Shopping. UPI Ref 90123",
      "Rs 180.00 paid to Swiggy via UPI. Acct 5678.",
    ];
    const parsed = parseTransactionalSMS(msgs[Math.floor(Math.random() * msgs.length)]);
    if (parsed) addTransaction(parsed);
  };

  const filteredTx = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if (filter === 'All Time') return true;
      const td = new Date(t.date);
      if (filter === 'This Month') return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
      if (filter === 'This Week') return (now.getTime() - td.getTime()) / 86400000 <= 7;
      return true;
    });
  }, [transactions, filter]);

  const totalSpent = filteredTx.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  const totalCredit = filteredTx.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);

  const grouped = filteredTx.filter(t => t.type === 'debit').reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.amount; return a; }, {} as Record<string, number>);
  const pieData = Object.keys(grouped).map((k, i) => ({ name: k, amount: grouped[k], color: PIE_COLORS[i % PIE_COLORS.length] })).sort((a, b) => b.amount - a.amount);
  const topCats = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]).slice(0, 5);
  const maxCat = topCats.length ? grouped[topCats[0]] : 1;

  const catIcon = (c: string) => {
    if (c.includes('Food')) return 'fast-food';
    if (c.includes('Travel')) return 'car-sport';
    if (c.includes('Shopping')) return 'bag-handle';
    if (c.includes('Entertainment')) return 'film';
    if (c.includes('Bill')) return 'flash';
    if (c.includes('Health')) return 'medkit';
    return 'receipt';
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Animated.View style={[s.header, { opacity: fadeAnim }]}>
        <View style={s.headerRow}>
          <Text style={s.title}>Wallet Insights</Text>
          <TouchableOpacity onPress={() => { setEditingTx(null); setAddAmount(''); setAddMerchant(''); setShowAdd(true); }}>
            <View style={s.addBtn}><Ionicons name="add" size={24} color="#FFF"/></View>
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>₹ {totalSpent.toLocaleString('en-IN')}</Text>
        <Text style={s.subtext}>Spent • {filter}</Text>
      </Animated.View>

      <FlatList data={filteredTx} keyExtractor={item => item.id!} showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
              {FILTERS.map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[s.filterPill, filter === f && s.filterPillActive]}>
                  <Text style={[s.filterPillText, filter === f && s.filterPillTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statCard}><Text style={s.statAmt}>₹{totalSpent.toLocaleString('en-IN')}</Text><Text style={s.statDesc}>Debits</Text></View>
              <View style={[s.statCard,{backgroundColor:'rgba(0,230,118,0.08)'}]}><Text style={[s.statAmt,{color:'#00E676'}]}>₹{totalCredit.toLocaleString('en-IN')}</Text><Text style={s.statDesc}>Credits</Text></View>
              <View style={s.statCard}><Text style={s.statAmt}>{filteredTx.length}</Text><Text style={s.statDesc}>Total</Text></View>
            </View>

            {/* Chart */}
            {pieData.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>Spending Analysis</Text>
                <DonutChart data={pieData} size={180}/>
                {topCats.map(cat => (
                  <View key={cat} style={s.barRow}>
                    <Ionicons name={catIcon(cat) as any} size={14} color={PIE_COLORS[topCats.indexOf(cat) % PIE_COLORS.length]}/>
                    <Text style={s.barLabel} numberOfLines={1}>{cat}</Text>
                    <View style={s.barTrack}><View style={[s.barFill,{width:`${(grouped[cat]/maxCat)*100}%`,backgroundColor:PIE_COLORS[topCats.indexOf(cat)%PIE_COLORS.length]}]}/></View>
                    <Text style={s.barAmt}>₹{grouped[cat]}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.actionRow}>
              <TouchableOpacity style={s.syncBtn} onPress={requestRealPermissions}>
                <Ionicons name="sync" size={16} color="#000" style={{marginRight:6}}/>
                <Text style={s.syncBtnText}>{listening ? 'Live' : 'SMS Tracker'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.simBtn} onPress={simulateIncomingSMS}>
                <Ionicons name="add-circle" size={16} color="#FFF" style={{marginRight:6}}/>
                <Text style={s.simBtnText}>Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.simBtn,{backgroundColor:'rgba(255,23,68,0.15)'}]} onPress={() => {
                setTransactions([]); persistAll([]); showToast('All cleared', 'warning');
              }}>
                <Ionicons name="trash" size={16} color="#FF1744" style={{marginRight:4}}/>
                <Text style={[s.simBtnText,{color:'#FF1744'}]}>Clear</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.listTitle}>Recent Activity</Text>
          </>
        }
        contentContainerStyle={s.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.7} style={s.glassCard} onPress={() => setSelectedTx(item)} onLongPress={() => openEdit(item)}>
            <View style={s.txRow}>
              <View style={[s.txIconBox,{backgroundColor:item.type==='credit'?'rgba(0,230,118,0.1)':'rgba(255,23,68,0.1)'}]}>
                <Ionicons name={catIcon(item.category) as any} size={20} color={item.type==='credit'?'#00E676':'#FF1744'}/>
              </View>
              <View style={{flex:1}}>
                <Text style={s.txMerchant} numberOfLines={1}>{item.merchant}</Text>
                <Text style={s.txCategory}>{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[s.txAmount,{color:item.type==='credit'?'#00E676':'#FFF'}]}>{item.type==='credit'?'+':'-'}₹{item.amount.toLocaleString('en-IN')}</Text>
              <TouchableOpacity onPress={() => deleteTransaction(item.id!)} style={{marginLeft:10}}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.2)"/>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={s.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.15)" style={{marginBottom:16}}/>
            <Text style={s.emptyText}>No transactions yet</Text>
            <Text style={s.emptyHint}>Tap + to add manually or use SMS tracker</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      {selectedTx && (
        <Modal transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Details</Text>
                <TouchableOpacity onPress={() => setSelectedTx(null)}><Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.35)"/></TouchableOpacity>
              </View>
              <View style={s.modalBody}>
                <Text style={s.modalAmount}>{selectedTx.type==='credit'?'+':'-'}₹{selectedTx.amount.toLocaleString('en-IN')}</Text>
                <View style={[s.modalBadge,{backgroundColor:selectedTx.type==='credit'?'rgba(0,230,118,0.15)':'rgba(255,23,68,0.15)'}]}>
                  <Text style={{fontSize:11,fontWeight:'900',color:selectedTx.type==='credit'?'#00E676':'#FF1744'}}>{selectedTx.type.toUpperCase()}</Text>
                </View>
                <View style={s.modalDivider}/>
                {[{l:'Merchant',v:selectedTx.merchant},{l:'Category',v:selectedTx.category},{l:'Account',v:selectedTx.account},{l:'Date',v:new Date(selectedTx.date).toLocaleString()}].map(r => (
                  <View key={r.l} style={s.modalField}><Text style={s.modalLabel}>{r.l}</Text><Text style={s.modalValue}>{r.v}</Text></View>
                ))}
                <View style={{flexDirection:'row',gap:12,marginTop:20}}>
                  <TouchableOpacity style={s.editBtn} onPress={() => { setSelectedTx(null); openEdit(selectedTx); }}>
                    <Ionicons name="pencil" size={16} color="#FFF" style={{marginRight:6}}/>
                    <Text style={{color:'#FFF',fontWeight:'800',fontSize:13}}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.delBtn} onPress={() => { deleteTransaction(selectedTx.id!); setSelectedTx(null); }}>
                    <Ionicons name="trash" size={16} color="#FF1744" style={{marginRight:6}}/>
                    <Text style={{color:'#FF1744',fontWeight:'800',fontSize:13}}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <Modal transparent animationType="slide">
          <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{editingTx ? 'Edit' : 'Add'} Expense</Text>
                <TouchableOpacity onPress={() => { setShowAdd(false); setEditingTx(null); }}><Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.35)"/></TouchableOpacity>
              </View>

              {/* Type toggle */}
              <View style={{flexDirection:'row',gap:10,marginBottom:18}}>
                <TouchableOpacity style={[s.typeBtn,addType==='debit'&&{backgroundColor:'#FF1744'}]} onPress={() => setAddType('debit')}>
                  <Text style={{color:addType==='debit'?'#FFF':'rgba(255,255,255,0.5)',fontWeight:'800',fontSize:13}}>Debit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.typeBtn,addType==='credit'&&{backgroundColor:'#00E676'}]} onPress={() => setAddType('credit')}>
                  <Text style={{color:addType==='credit'?'#000':'rgba(255,255,255,0.5)',fontWeight:'800',fontSize:13}}>Credit</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.addLabel}>Amount (₹)</Text>
              <TextInput style={s.addInput} placeholder="0" placeholderTextColor="rgba(255,255,255,0.2)" value={addAmount} onChangeText={setAddAmount} keyboardType="numeric"/>

              <Text style={s.addLabel}>Merchant / Description</Text>
              <TextInput style={s.addInput} placeholder="e.g. Zomato" placeholderTextColor="rgba(255,255,255,0.2)" value={addMerchant} onChangeText={setAddMerchant}/>

              <Text style={s.addLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:20}}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} onPress={() => setAddCategory(c)} style={[s.catChip,addCategory===c&&{backgroundColor:'#FF1744',borderColor:'#FF1744'}]}>
                    <Ionicons name={catIcon(c) as any} size={14} color={addCategory===c?'#FFF':'rgba(255,255,255,0.5)'}/>
                    <Text style={{fontSize:11,fontWeight:'700',color:addCategory===c?'#FFF':'rgba(255,255,255,0.5)',marginLeft:4}}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={s.saveBtn} onPress={handleSaveManual}>
                <Text style={{color:'#000',fontWeight:'900',fontSize:15}}>{editingTx ? 'Update' : 'Add Expense'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0A0B0F'},
  header:{padding:24,paddingTop:10,paddingBottom:14},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  title:{fontSize:28,fontWeight:'900',color:'#FFF',letterSpacing:-0.5},
  addBtn:{width:42,height:42,borderRadius:21,backgroundColor:'#FF1744',alignItems:'center',justifyContent:'center'},
  subtitle:{fontSize:40,fontWeight:'900',color:'#00E676',marginTop:8,letterSpacing:-1},
  subtext:{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:'700',textTransform:'uppercase',letterSpacing:1},
  filterRow:{paddingHorizontal:24,marginTop:4,marginBottom:14},
  filterPill:{paddingHorizontal:16,paddingVertical:8,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)',marginRight:10,borderWidth:1,borderColor:'rgba(255,255,255,0.05)'},
  filterPillActive:{backgroundColor:'#FFF',borderColor:'#FFF'},
  filterPillText:{color:'rgba(255,255,255,0.6)',fontWeight:'700',fontSize:13},
  filterPillTextActive:{color:'#000',fontWeight:'900'},
  statsRow:{flexDirection:'row',gap:8,paddingHorizontal:24,marginBottom:14},
  statCard:{flex:1,backgroundColor:'rgba(255,255,255,0.04)',borderRadius:16,padding:12,borderWidth:1,borderColor:'rgba(255,255,255,0.05)'},
  statAmt:{fontSize:15,fontWeight:'900',color:'#FF1744'},
  statDesc:{fontSize:9,color:'rgba(255,255,255,0.45)',fontWeight:'700',marginTop:3},
  chartCard:{backgroundColor:'rgba(255,255,255,0.03)',borderRadius:24,padding:22,marginHorizontal:24,borderWidth:1,borderColor:'rgba(255,255,255,0.06)'},
  chartTitle:{color:'#FFF',fontSize:16,fontWeight:'900',marginBottom:4},
  barRow:{flexDirection:'row',alignItems:'center',marginBottom:10,gap:6},
  barLabel:{color:'rgba(255,255,255,0.6)',fontSize:10,width:65,fontWeight:'600'},
  barTrack:{flex:1,height:7,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:4},
  barFill:{height:'100%',borderRadius:4},
  barAmt:{color:'#FFF',fontSize:11,fontWeight:'800',width:50,textAlign:'right'},
  actionRow:{flexDirection:'row',gap:10,marginVertical:16,paddingHorizontal:24},
  syncBtn:{flex:1,flexDirection:'row',backgroundColor:'#00E676',padding:12,borderRadius:16,alignItems:'center',justifyContent:'center'},
  syncBtnText:{color:'#000',fontWeight:'900',fontSize:12},
  simBtn:{flexDirection:'row',backgroundColor:'rgba(255,255,255,0.08)',paddingHorizontal:16,padding:12,borderRadius:16,alignItems:'center',justifyContent:'center'},
  simBtnText:{color:'#FFF',fontWeight:'800',fontSize:12},
  listContent:{paddingBottom:140},
  listTitle:{color:'#FFF',fontSize:16,fontWeight:'900',marginBottom:10,paddingHorizontal:24},
  glassCard:{backgroundColor:'rgba(255,255,255,0.04)',borderRadius:18,padding:14,marginHorizontal:24,marginBottom:8,borderWidth:1,borderColor:'rgba(255,255,255,0.04)'},
  txRow:{flexDirection:'row',alignItems:'center',gap:12},
  txIconBox:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},
  txMerchant:{color:'#FFF',fontSize:14,fontWeight:'800'},
  txCategory:{color:'rgba(255,255,255,0.4)',fontSize:10,fontWeight:'600',marginTop:2},
  txAmount:{fontSize:16,fontWeight:'900',letterSpacing:-0.5},
  emptyState:{alignItems:'center',justifyContent:'center',paddingVertical:48},
  emptyText:{color:'rgba(255,255,255,0.6)',fontSize:15,fontWeight:'800'},
  emptyHint:{color:'rgba(255,255,255,0.3)',fontSize:11,fontWeight:'600',marginTop:6},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.85)',justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#141518',borderTopLeftRadius:32,borderTopRightRadius:32,padding:26,paddingBottom:40},
  modalHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  modalTitle:{color:'#FFF',fontSize:20,fontWeight:'900'},
  modalBody:{alignItems:'center'},
  modalAmount:{color:'#FFF',fontSize:40,fontWeight:'900',letterSpacing:-1},
  modalBadge:{paddingHorizontal:14,paddingVertical:5,borderRadius:12,marginTop:8},
  modalDivider:{width:'100%',height:1,backgroundColor:'rgba(255,255,255,0.06)',marginVertical:20},
  modalField:{width:'100%',flexDirection:'row',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.04)',paddingVertical:12},
  modalLabel:{color:'rgba(255,255,255,0.4)',fontSize:13,fontWeight:'600'},
  modalValue:{color:'#FFF',fontSize:13,fontWeight:'800',textAlign:'right',flex:1},
  editBtn:{flex:1,flexDirection:'row',backgroundColor:'#1E88E5',padding:14,borderRadius:16,alignItems:'center',justifyContent:'center'},
  delBtn:{flex:1,flexDirection:'row',backgroundColor:'rgba(255,23,68,0.15)',padding:14,borderRadius:16,alignItems:'center',justifyContent:'center'},
  typeBtn:{flex:1,padding:14,borderRadius:16,backgroundColor:'rgba(255,255,255,0.06)',alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.06)'},
  addLabel:{color:'rgba(255,255,255,0.5)',fontSize:11,fontWeight:'800',marginBottom:8,letterSpacing:0.5},
  addInput:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:18,padding:16,fontSize:18,color:'#FFF',fontWeight:'800',marginBottom:16},
  catChip:{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:10,borderRadius:20,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.06)',marginRight:8},
  saveBtn:{backgroundColor:'#00E676',padding:16,borderRadius:18,alignItems:'center',marginTop:6},
});
