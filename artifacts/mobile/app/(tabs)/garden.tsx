import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { usePlant, SavedPlant } from '@/context/PlantContext';
import { router } from 'expo-router';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

function PlantCard({ item, onDelete }: { item: SavedPlant; onDelete: () => void }) {
  const { setCurrentReport } = usePlant();

  const handlePress = () => {
    setCurrentReport({
      id: item.id,
      name: item.plantName,
      scientificName: item.scientificName,
      description: item.description,
      benefits: item.benefits,
      care: item.care,
      nutrition: item.nutrition,
      imageBase64: item.imageBase64 ?? undefined,
      createdAt: item.savedAt,
    });
    router.push('/report');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.cardImageWrapper}>
        {item.imageBase64 ? (
          <Image source={{ uri: item.imageBase64 }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[Colors.primary + '55', Colors.secondary + '55']}
            style={styles.cardImagePlaceholder}
          >
            <Ionicons name="leaf" size={36} color={Colors.primary} />
          </LinearGradient>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.plantName}</Text>
        <Text style={styles.cardScientific} numberOfLines={1}>{item.scientificName}</Text>
        <Text style={styles.cardDate}>{new Date(item.savedAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function GardenScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  const loadGarden = () => {
    if (!user) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/plants/garden?userId=${user.userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlants(data.slice().reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGarden();
  }, [user]);

  const handleDelete = (id: string) => {
    Alert.alert('Remove plant?', 'This will remove the plant from your garden.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${BASE_URL}/api/plants/garden/${id}`, { method: 'DELETE' });
          setPlants((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: webTopPad }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>My Garden</Text>
        <Text style={styles.subtitle}>
          {plants.length} plant{plants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : plants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[Colors.accent + '55', Colors.background]}
            style={styles.emptyIconBg}
          >
            <Ionicons name="leaf-outline" size={60} color={Colors.secondary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your garden is empty</Text>
          <Text style={styles.emptyText}>Save plants from your scans to build your garden</Text>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={18} color={Colors.white} />
            <Text style={styles.scanBtnText}>Scan a plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlantCard item={item} onDelete={() => handleDelete(item.id)} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadGarden}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  scanBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  cardScientific: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 3,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 6,
  },
  deleteBtn: {
    padding: 8,
  },
});
