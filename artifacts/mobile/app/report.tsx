import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlant, NutritionItem } from '@/context/PlantContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function NutritionRow({ item, index }: { item: NutritionItem; index: number }) {
  const pct = parseInt(item.percentage, 10) || 0;
  return (
    <View style={[styles.nutritionRow, index % 2 === 0 && styles.nutritionRowAlt]}>
      <Text style={styles.nutritionName}>{item.name}</Text>
      <Text style={styles.nutritionAmount}>{item.amount}</Text>
      <View style={styles.nutritionPctWrapper}>
        <View style={styles.pctBar}>
          <View style={[styles.pctFill, { width: `${Math.min(pct, 100)}%` }]} />
        </View>
        <Text style={styles.nutritionPct}>{item.percentage}</Text>
      </View>
    </View>
  );
}

export default function ReportScreen() {
  const { currentReport } = usePlant();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [savingGarden, setSavingGarden] = useState(false);
  const [savingFav, setSavingFav] = useState(false);
  const [savedGarden, setSavedGarden] = useState(false);
  const [savedFav, setSavedFav] = useState(false);

  if (!currentReport) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No report available</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSaveGarden = async () => {
    if (!user) return;
    setSavingGarden(true);
    try {
      await fetch(`${BASE_URL}/api/plants/garden`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          plantName: currentReport.name,
          scientificName: currentReport.scientificName,
          description: currentReport.description,
          benefits: currentReport.benefits,
          care: currentReport.care,
          nutrition: currentReport.nutrition,
          imageBase64: currentReport.imageBase64,
        }),
      });
      setSavedGarden(true);
      Alert.alert('Saved', 'Plant added to your garden');
    } catch {
      Alert.alert('Error', 'Could not save to garden');
    } finally {
      setSavingGarden(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!user) return;
    setSavingFav(true);
    try {
      await fetch(`${BASE_URL}/api/plants/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          plantName: currentReport.name,
          scientificName: currentReport.scientificName,
          description: currentReport.description,
          benefits: currentReport.benefits,
          care: currentReport.care,
          nutrition: currentReport.nutrition,
          imageBase64: currentReport.imageBase64,
        }),
      });
      setSavedFav(true);
      Alert.alert('Saved', 'Plant added to favorites');
    } catch {
      Alert.alert('Error', 'Could not save to favorites');
    } finally {
      setSavingFav(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          {currentReport.imageBase64 ? (
            <Image
              source={{ uri: currentReport.imageBase64 }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.heroPlaceholder}
            >
              <Ionicons name="leaf" size={80} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.heroOverlay}
          />
          <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.heroActionBtn, savedGarden && styles.heroActionSaved]}
                onPress={handleSaveGarden}
                disabled={savingGarden || savedGarden}
              >
                {savingGarden ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={savedGarden ? 'leaf' : 'leaf-outline'}
                    size={22}
                    color={Colors.white}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroActionBtn, savedFav && styles.heroActionSaved]}
                onPress={handleSaveFavorite}
                disabled={savingFav || savedFav}
              >
                {savingFav ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={savedFav ? 'heart' : 'heart-outline'}
                    size={22}
                    color={savedFav ? '#FF6B6B' : Colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroNames}>
            <Text style={styles.heroName}>{currentReport.name}</Text>
            <Text style={styles.heroScientific}>{currentReport.scientificName}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="information-circle" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <Text style={styles.sectionText}>{currentReport.description}</Text>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Benefits</Text>
            </View>
            <Text style={styles.sectionText}>{currentReport.benefits}</Text>
          </View>

          {/* Care */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="water" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Care Instructions</Text>
            </View>
            <Text style={styles.sectionText}>{currentReport.care}</Text>
          </View>

          {/* Nutrition Table */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="nutrition" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Nutritional Values</Text>
            </View>
            <Text style={styles.nutritionSubtitle}>Per 100g serving</Text>
            <View style={styles.nutritionTable}>
              <View style={styles.nutritionHeader}>
                <Text style={styles.nutritionHeaderText}>Nutrient</Text>
                <Text style={styles.nutritionHeaderText}>Amount</Text>
                <Text style={[styles.nutritionHeaderText, styles.nutritionPctHeader]}>Daily %</Text>
              </View>
              {currentReport.nutrition.map((item, i) => (
                <NutritionRow key={item.name} item={item} index={i} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    fontSize: 16,
  },
  backLink: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    marginTop: 12,
    fontSize: 16,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionSaved: {
    backgroundColor: 'rgba(46,125,50,0.7)',
  },
  heroNames: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroScientific: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textDark,
    lineHeight: 24,
  },
  nutritionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginBottom: 12,
  },
  nutritionTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutritionHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nutritionHeaderText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutritionPctHeader: {
    textAlign: 'right',
  },
  nutritionRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  nutritionRowAlt: {
    backgroundColor: Colors.background,
  },
  nutritionName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  nutritionAmount: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  nutritionPctWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pctBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  pctFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  nutritionPct: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    minWidth: 36,
    textAlign: 'right',
  },
});
