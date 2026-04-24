import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import Colors from '@/constants/colors';

interface ScanRecord {
  id: string;
  plantName: string;
  scientificName: string;
  imageBase64?: string | null;
  createdAt: string;
}

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function HomeScreen() {
  const { user } = useAuth();
  const { t, isRTL } = useI18n();
  const { mode } = useTheme();
  const insets = useSafeAreaInsets();
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [search, setSearch] = useState('');
  const styles = useMemo(() => makeStyles(), [mode]);

  const FEATURED_PLANTS = [
    { id: 'f1', name: 'Aloe Vera',  tag: t('healing'),   color: '#4CAF50', icon: 'medkit' as const },
    { id: 'f2', name: 'Lavender',   tag: t('calming'),   color: '#7B68EE', icon: 'flower-outline' as const },
    { id: 'f3', name: 'Mint',       tag: t('refreshing'),color: '#00BCD4', icon: 'leaf-outline' as const },
    { id: 'f4', name: 'Rosemary',   tag: t('aromatic'),  color: '#FF7043', icon: 'nutrition-outline' as const },
  ];

  useEffect(() => {
    if (!user) return;
    fetch(`${BASE_URL}/api/plants/scans?userId=${user.userId}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRecentScans(data.slice().reverse()); })
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
        <View style={[styles.header, isRTL && styles.rowRTL]}>
          <View>
            <Text style={[styles.greeting, isRTL && styles.textRTL]}>{t('goodMorning')}</Text>
            <Text style={[styles.userName, isRTL && styles.textRTL]}>
              {user?.email?.split('@')[0] ?? 'Explorer'}
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={22} color={Colors.primary} />
          </View>
        </View>

        <View style={[styles.searchWrapper, isRTL && styles.rowRTL]}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRTL]}
            placeholder={t('searchPlants')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

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
              <View style={[styles.scanCtaContent, isRTL && styles.rowRTL]}>
                <View>
                  <Text style={[styles.scanCtaTitle, isRTL && styles.textRTL]}>{t('identifyPlant')}</Text>
                  <Text style={[styles.scanCtaSub, isRTL && styles.textRTL]}>{t('tapToScan')}</Text>
                </View>
                <View style={styles.scanCtaIcon}>
                  <Ionicons name="camera" size={28} color={Colors.white} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('featuredPlants')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
          contentContainerStyle={styles.featuredContent}
        >
          {FEATURED_PLANTS.filter(
            (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
          ).map((plant) => (
            <TouchableOpacity key={plant.id} style={styles.featuredCard} activeOpacity={0.85}>
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

        <View style={[styles.recentHeader, isRTL && styles.rowRTL]}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }, isRTL && styles.textRTL]}>
            {t('recentScans')}
          </Text>
          {recentScans.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingScans ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : recentScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={48} color={Colors.textMuted} />
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('noScansYet')}</Text>
            <Text style={[styles.emptySubText, isRTL && styles.textRTL]}>{t('scanToSeeHere')}</Text>
          </View>
        ) : (
          recentScans.slice(0, 5).map((scan) => (
            <View key={scan.id} style={[styles.recentCard, isRTL && styles.rowRTL]}>
              <View style={[styles.recentImageWrapper, isRTL ? { marginLeft: 14, marginRight: 0 } : {}]}>
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
                <Text style={[styles.recentName, isRTL && styles.textRTL]}>{scan.plantName}</Text>
                <Text style={[styles.recentScientific, isRTL && styles.textRTL]} numberOfLines={1}>
                  {scan.scientificName}
                </Text>
                <Text style={[styles.recentDate, isRTL && styles.textRTL]}>
                  {new Date(scan.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                </Text>
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={Colors.textMuted} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles() {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    textRTL: { textAlign: 'right' },
    rowRTL: { flexDirection: 'row-reverse' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    greeting: { fontSize: 14, color: Colors.textMuted },
    userName: { fontSize: 24, color: Colors.text, textTransform: 'capitalize' },
    avatarCircle: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: Colors.accent,
      alignItems: 'center', justifyContent: 'center',
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
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
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 15, color: Colors.text },
    quickActions: { marginBottom: 28 },
    scanCta: {
      borderRadius: 20, overflow: 'hidden',
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6, shadowRadius: 18, elevation: 8,
    },
    scanCtaGradient: { padding: 22, borderRadius: 20 },
    scanCtaContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    scanCtaTitle: { fontSize: 20, color: Colors.white },
    scanCtaSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
    scanCtaIcon: {
      width: 60, height: 60, borderRadius: 30,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center',
    },
    sectionTitle: { fontSize: 18, color: Colors.text, marginBottom: 14 },
    featuredScroll: { marginHorizontal: -20, marginBottom: 28 },
    featuredContent: { paddingHorizontal: 20, gap: 12 },
    featuredCard: {
      width: 120, backgroundColor: Colors.surface,
      borderRadius: 18, padding: 16, alignItems: 'center',
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1, shadowRadius: 12, elevation: 3,
      borderWidth: 1, borderColor: Colors.cardBorder,
    },
    featuredIcon: {
      width: 64, height: 64, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    featuredName: { fontSize: 13, color: Colors.text, textAlign: 'center', marginBottom: 6 },
    featuredTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    featuredTagText: { fontSize: 11 },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    seeAll: { fontSize: 14, color: Colors.primary },
    loader: { marginTop: 20 },
    emptyState: {
      alignItems: 'center', paddingVertical: 40,
      backgroundColor: Colors.surface, borderRadius: 20,
      borderWidth: 1, borderColor: Colors.border,
    },
    emptyText: { fontSize: 17, color: Colors.textSecondary, marginTop: 14 },
    emptySubText: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
    recentCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: Colors.surface, borderRadius: 16,
      padding: 14, marginBottom: 10,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1, shadowRadius: 8, elevation: 2,
      borderWidth: 1, borderColor: Colors.cardBorder,
    },
    recentImageWrapper: {
      width: 56, height: 56, borderRadius: 14,
      overflow: 'hidden', marginRight: 14,
    },
    recentImage: { width: '100%', height: '100%' },
    recentImagePlaceholder: {
      width: '100%', height: '100%',
      alignItems: 'center', justifyContent: 'center',
    },
    recentInfo: { flex: 1 },
    recentName: { fontSize: 15, color: Colors.text },
    recentScientific: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },
    recentDate: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  });
}
