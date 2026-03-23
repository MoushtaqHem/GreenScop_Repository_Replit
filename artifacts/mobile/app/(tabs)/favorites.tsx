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

function FavoriteCard({ item, onDelete }: { item: SavedPlant; onDelete: () => void }) {
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
            colors={['#FCE4EC', '#FFF8F8']}
            style={styles.cardImagePlaceholder}
          >
            <Ionicons name="heart" size={32} color="#E91E63" />
          </LinearGradient>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.plantName}</Text>
        <Text style={styles.cardScientific} numberOfLines={1}>{item.scientificName}</Text>
        <View style={styles.cardMeta}>
          <Ionicons name="heart" size={12} color="#E91E63" />
          <Text style={styles.cardDate}>{new Date(item.savedAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="heart-dislike-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState<SavedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  const loadFavorites = () => {
    if (!user) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/plants/favorites?userId=${user.userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFavorites(data.slice().reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleRemove = (id: string) => {
    Alert.alert('Remove from favorites?', 'This will remove the plant from your favorites.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await fetch(`${BASE_URL}/api/plants/favorites/${id}`, { method: 'DELETE' });
          setFavorites((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: webTopPad }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} saved plant{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="heart-outline" size={60} color="#E91E63" />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            After identifying a plant, tap the heart icon to save it here
          </Text>
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
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FavoriteCard item={item} onDelete={() => handleRemove(item.id)} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadFavorites}
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
    backgroundColor: '#FCE4EC',
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 8,
  },
});
