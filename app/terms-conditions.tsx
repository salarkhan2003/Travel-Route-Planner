import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

export default function TermsConditionsScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={NC.primary} />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>Terms & Conditions</Text>
        <View style={{width:60}} />
      </View>
      
      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>
        <Text style={st.lastUpdated}>Last Updated: April 2026</Text>
        
        <View style={st.section}>
          <Text style={st.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={st.sectionText}>
            By downloading, installing, or using the Roamio travel planning application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our application.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>2. Description of Service</Text>
          <Text style={st.sectionText}>
            Roamio provides a comprehensive travel planning platform that allows users to:\n{'\n'}
            • Search and plan trips across India and international destinations{'\n'}
            • Book trains, flights, buses, and hotels{'\n'}
            • Track train running status and PNR status{'\n'}
            • Discover movies and entertainment options{'\n'}
            • Access interactive maps with traffic and EV charging information{'\n'}
            • Manage travel itineraries and budgets
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>3. User Accounts</Text>
          <Text style={st.sectionText}>
            <Text style={st.bold}>Registration:</Text>{'\n'}
            • You must provide accurate and complete information{'\n'}
            • You are responsible for maintaining account security{'\n'}
            • You must be at least 13 years old to use this app{'\n\n'}
            <Text style={st.bold}>Account Termination:</Text>{'\n'}
            • We reserve the right to suspend accounts for violations{'\n'}
            • Users may delete their accounts at any time
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>4. Bookings & Payments</Text>
          <Text style={st.sectionText}>
            <Text style={st.bold}>Third-Party Bookings:</Text>{'\n'}
            • Roamio redirects to official booking platforms (IRCTC, BookMyShow, etc.){'\n'}
            • We do not process payments directly{'\n'}
            • Booking confirmations are subject to third-party terms{'\n\n'}
            <Text style={st.bold}>Accuracy:</Text>{'\n'}
            • We strive to provide accurate schedules and prices{'\n'}
            • All information is subject to change without notice
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>5. Intellectual Property</Text>
          <Text style={st.sectionText}>
            All content, features, and functionality of the App including but not limited to text, graphics, logos, and software are owned by Roamio and are protected by international copyright, trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={st.sectionText}>
            Roamio shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:\n{'\n'}
            • Use or inability to use the service{'\n'}
            • Booking cancellations or delays{'\n'}
            • Inaccurate information from third parties{'\n'}
            • Data loss or security breaches
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>7. Governing Law</Text>
          <Text style={st.sectionText}>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>8. Changes to Terms</Text>
          <Text style={st.sectionText}>
            We reserve the right to modify these Terms at any time. We will notify users of significant changes via the app or email. Continued use of the App after changes constitutes acceptance of the updated Terms.
          </Text>
        </View>

        <View style={st.section}>
          <Text style={st.sectionTitle}>9. Contact Information</Text>
          <Text style={st.sectionText}>
            For questions about these Terms, please contact:\n{'\n'}
            Email: legal@roamio.app{'\n'}
            Address: Roamio Travel Technologies Pvt. Ltd.,\nBangalore - 560001, Karnataka, India
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
