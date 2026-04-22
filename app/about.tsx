import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NC } from '../src/constants/theme';

export default function AboutScreen() {
  const router = useRouter();
  
  const appVersion = '1.0.0';
  const buildNumber = '2026.04.22';
  
  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={NC.primary} />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={st.heading}>About Roamio</Text>
        <View style={{width:60}} />
      </View>
      
      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>
        {/* App Logo Section */}
        <View style={st.logoSection}>
          <View style={st.logoContainer}>
            <Ionicons name="compass" size={60} color={NC.primary} />
          </View>
          <Text style={st.appName}>Roamio</Text>
          <Text style={st.tagline}>Your Complete Travel Companion</Text>
          <Text style={st.version}>Version {appVersion} ({buildNumber})</Text>
        </View>

        {/* Description */}
        <View style={st.card}>
          <Text style={st.cardTitle}>About the App</Text>
          <Text style={st.cardText}>
            Roamio is a comprehensive travel planning application designed specifically for Indian travelers. From discovering popular routes like the Golden Triangle to tracking live train status, booking movie tickets, and finding EV charging stations - Roamio brings all your travel needs into one beautiful, intuitive platform.
          </Text>
        </View>

        {/* Features List */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Key Features</Text>
          <View style={st.featureList}>
            {[
              { icon: 'map', text: 'Interactive TomTom Maps with Traffic & EV Stations' },
              { icon: 'train', text: 'Live Train Tracking & PNR Status Check' },
              { icon: 'film', text: 'Movie Showtimes & Theater Listings' },
              { icon: 'airplane', text: 'Flight, Train, Bus & Hotel Bookings' },
              { icon: 'wallet', text: 'Budget Planning & Expense Tracking' },
              { icon: 'people', text: 'Family Trip Management' },
            ].map((feature, i) => (
              <View key={i} style={st.featureItem}>
                <View style={st.featureIcon}>
                  <Ionicons name={feature.icon as any} size={18} color={NC.primary} />
                </View>
                <Text style={st.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tech Stack */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Built With</Text>
          <View style={st.techGrid}>
            {['React Native', 'Expo', 'TypeScript', 'Zustand', 'TomTom Maps', 'RapidAPI'].map((tech, i) => (
              <View key={i} style={st.techChip}>
                <Text style={st.techText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Our Team</Text>
          <Text style={st.cardText}>
            Roamio is developed by a passionate team of travel enthusiasts and software engineers based in Bangalore, India. We believe in making travel planning seamless and enjoyable for everyone.
          </Text>
        </View>

        {/* Credits */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Third-Party Credits</Text>
          <Text style={st.cardText}>
            • TomTom Maps SDK - Navigation & Mapping{'\n'}
            • Indian Railways API - Train Information{'\n'}
            • International Showtimes API - Movie Data{'\n'}
            • BookMyShow - Entertainment Bookings{'\n'}
            • Wikipedia - Images for Popular Routes
          </Text>
        </View>

        {/* Contact */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Contact Us</Text>
          <View style={st.contactItem}>
            <Ionicons name="mail" size={18} color={NC.primary} />
            <Text style={st.contactText}>hello@roamio.app</Text>
          </View>
          <View style={st.contactItem}>
            <Ionicons name="globe" size={18} color={NC.primary} />
            <Text style={st.contactText}>www.roamio.app</Text>
          </View>
          <View style={st.contactItem}>
            <Ionicons name="location" size={18} color={NC.primary} />
            <Text style={st.contactText}>Bangalore, Karnataka, India</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={st.copyrightSection}>
          <Text style={st.copyright}>
            © 2026 Roamio Travel Technologies Pvt. Ltd.{'\n'}
            All rights reserved.
          </Text>
          <Text style={st.madeWith}>Made with ❤️ in India</Text>
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
  
  logoSection: { 
    alignItems: 'center', 
    paddingVertical: 30,
    marginBottom: 20 
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: NC.surfaceLowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(165,214,167,0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: { 
    color: NC.onSurface, 
    fontSize: 28, 
    fontWeight: '900',
    letterSpacing: -0.5 
  },
  tagline: { 
    color: NC.onSurfaceVariant, 
    fontSize: 14, 
    marginTop: 4,
    fontWeight: '600' 
  },
  version: {
    color: NC.outline,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500'
  },
  
  card: {
    backgroundColor: NC.surfaceLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: 'rgba(165,214,167,0.3)',
    shadowColor: 'rgba(165,214,167,0.3)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: { 
    color: NC.primary, 
    fontSize: 16, 
    fontWeight: '900', 
    marginBottom: 12 
  },
  cardText: { 
    color: NC.onSurface, 
    fontSize: 14, 
    lineHeight: 22,
    fontWeight: '500' 
  },
  
  featureList: { gap: 12 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: NC.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: NC.onSurface,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    backgroundColor: NC.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(165,214,167,0.3)',
  },
  techText: {
    color: NC.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
  },
  
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  contactText: {
    color: NC.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  copyright: {
    color: NC.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  madeWith: {
    color: NC.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});
