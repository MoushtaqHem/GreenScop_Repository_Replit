import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';

interface ScanRecord {
  id: string;
  plantName: string;
  scientificName: string;
  imageBase64?: string | null;
  createdAt: string;
}

const FEATURED_PLANTS = [
  {
    id: 'f1',
    name: 'Aloe Vera',
    tag: 'Healing',
    color: '#4CAF50',
    icon: 'medkit' as const,
  },
  {
    id: 'f2',
    name: 'Lavender',
    tag: 'Calming',
    color: '#7B68EE',
    icon: 'flower-outline' as const,
  },
  {
    id: 'f3',
    name: 'Mint',
    tag: 'Refreshing',
    color: '#00BCD4',
    icon: 'leaf-outline' as const,
  },
  {
    id: 'f4',
    name: 'Rosemary',
    tag: 'Aromatic',
    color: '#FF7043',
    icon: 'nutrition-outline' as const,
  },
];

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch(`${BASE_URL}/api/plants/scans?userId=${user.userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentScans(data.slice().reverse());
        }
      })
      .catch(() => {})
      .finally(() => setLoadingScans(false));
  }, [user]);

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: webTopPad }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] ?? 'Explorer'}</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={Colors.primary} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.scanCta}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanCtaGradient}
            >
              <View style={styles.scanCtaContent}>
                <View>
                  <Text style={styles.scanCtaTitle}>Identify a Plant</Text>
                  <Text style={styles.scanCtaSub}>Tap to scan with AI</Text>
                </View>
                <View style={styles.scanCtaIcon}>
                  <Ionicons name="camera" size={28} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Plants */}
        <Text style={styles.sectionTitle}>Featured Plants</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
          contentContainerStyle={styles.featuredContent}
        >
          {FEATURED_PLANTS.filter(
            (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
          ).map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.featuredCard}
              activeOpacity={0.85}
            >
              <View style={[styles.featuredIcon, { backgroundColor: plant.color + '22' }]}>
                <Ionicons name={plant.icon} size={32} color={plant.color} />
              </View>
              <Text style={styles.featuredName}>{plant.name}</Text>
              <View style={[styles.featuredTag, { backgroundColor: plant.color + '22' }]}>
                <Text style={[styles.featuredTagText, { color: plant.color }]}>{plant.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Scans */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingScans ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : recentScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubText}>Scan a plant to see it here</Text>
          </View>
        ) : (
          recentScans.slice(0, 5).map((scan) => (
            <View key={scan.id} style={styles.recentCard}>
              <View style={styles.recentImageWrapper}>
                {scan.imageBase64 ? (
                  <Image source={{ uri: scan.imageBase64 }} style={styles.recentImage} resizeMode="cover" />
                ) : (
                  <LinearGradient
                    colors={[Colors.primary + '44', Colors.secondary + '44']}
                    style={styles.recentImagePlaceholder}
                  >
                    <Ionicons name="leaf" size={24} color={Colors.primary} />
                  </LinearGradient>
                )}
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{scan.plantName}</Text>
                <Text style={styles.recentScientific} numberOfLines={1}>{scan.scientificName}</Text>
                <Text style={styles.recentDate}>
                  {new Date(scan.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text,
  },
  quickActions: {
    marginBottom: 28,
  },
  scanCta: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  scanCtaGradient: {
    padding: 22,
    borderRadius: 20,
  },
  scanCtaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanCtaTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
  },
  scanCtaSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  scanCtaIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 14,
  },
  featuredScroll: {
    marginHorizontal: -20,
    marginBottom: 28,
  },
  featuredContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuredCard: {
    width: 120,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  featuredIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featuredName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  featuredTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredTagText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  loader: {
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 14,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 6,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  recentImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },
  recentImage: {
    width: '100%',
    height: '100%',
  },
  recentImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  recentScientific: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  recentDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 4,
  },
});
