import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={NC.primary} />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>Privacy Policy</Text>
        <View style={{width:60}} />
      </View>
      
      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.lastUpdated}>Last Updated: April 2026</Text>
        
        <View style={st.section}>
          <Text style={st.sectionTitle}>1. Introduction</Text>
          <Text style={st.sectionText}>
            Welcome to Roamio ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our travel planning application.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>2. Information We Collect</Text>
          <Text style={st.sectionText}>
            <Text style={st.bold}>Personal Data:</Text>{'\n'}
            • Name and contact information{'\n'}
            • Location data (with your permission){'\n'}
            • Travel preferences and itineraries{'\n'}
            • Booking history and saved trips{'\n'}
            • Payment information (processed securely by third parties){'\n\n'}
            <Text style={st.bold}>Usage Data:</Text>{'\n'}
            • App usage statistics{'\n'}
            • Search history and preferences{'\n'}
            • Device information and IP address{'\n'}
            • Crash logs and performance data
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={st.sectionText}>
            We use your data to:\n{'\n'}
            • Provide personalized travel recommendations{'\n'}
            • Process your bookings and reservations{'\n'}
            • Send travel alerts and notifications{'\n'}
            • Improve our app experience{'\n'}
            • Analyze usage patterns and trends{'\n'}
            • Ensure security and prevent fraud
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>4. Data Storage & Security</Text>
          <Text style={st.sectionText}>
            All data is stored locally on your device using secure AsyncStorage encryption. We do not store sensitive personal information on our servers. Your trip data, preferences, and settings remain on your device unless you explicitly choose to sync them.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>5. Third-Party Services</Text>
          <Text style={st.sectionText}>
            We integrate with third-party services including:\n{'\n'}
            • IRCTC for train bookings{'\n'}
            • TomTom Maps for navigation{'\n'}
            • International Showtimes for movie listings{'\n'}
            • BookMyShow for entertainment bookings{'\n\n'}
            These services have their own privacy policies and may collect data according to their terms.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>6. Your Rights</Text>
          <Text style={st.sectionText}>
            You have the right to:\n{'\n'}
            • Access your personal data{'\n'}
            • Delete your account and data{'\n'}
            • Opt-out of marketing communications{'\n'}
            • Disable location services{'\n'}
            • Export your trip data
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>7. Contact Us</Text>
          <Text style={st.sectionText}>
            If you have questions about this Privacy Policy, please contact us at:\n{'\n'}
            Email: privacy@roamio.app{'\n'}
            Address: Roamio Travel Technologies Pvt. Ltd.,\nBangalore, India
          </Text>
        </View>
        
        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: NC.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 14 
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: NC.surfaceLowest,
    gap: 6,
  },
  backText: { color: NC.primary, fontSize: 14, fontWeight: '700' },
  heading: { color: NC.onSurface, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  scroll: { paddingHorizontal: 20, paddingTop: 10 },
  lastUpdated: { 
    color: NC.onSurfaceVariant, 
    fontSize: 12, 
    marginBottom: 20,
    fontStyle: 'italic'
  },
  section: { marginBottom: 24 },
  sectionTitle: { 
    color: NC.primary, 
    fontSize: 16, 
    fontWeight: '900', 
    marginBottom: 10 
  },
  sectionText: { 
    color: NC.onSurface, 
    fontSize: 14, 
    lineHeight: 22,
    fontWeight: '500'
  },
  bold: { fontWeight: '800', color: NC.onSurface },
});
