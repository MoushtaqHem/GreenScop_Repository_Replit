import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { usePlant } from '@/context/PlantContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ScanScreen() {
  const { user } = useAuth();
  const { setCurrentReport } = usePlant();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Camera access is needed to scan plants');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
        base64: true,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      if (asset.base64) {
        setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setImageBase64(null);
      }
    }
  };

  const analyzeImage = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to identify plants', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    if (!imageUri) {
      Alert.alert('No image', 'Please select a photo first');
      return;
    }

    setAnalyzing(true);
    try {
      let base64 = imageBase64;

      if (!base64) {
        try {
          base64 = await uriToBase64(imageUri);
        } catch {
          Alert.alert('Image error', 'Could not read the selected image. Please try again.');
          return;
        }
      }

      const res = await fetch(`${BASE_URL}/api/plants/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, userId: user.userId }),
      });

      if (!res.ok) {
        let errMsg = 'Analysis failed';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const report = await res.json();
      setCurrentReport({ ...report, imageBase64: base64 });
      router.push('/report');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not analyze plant';
      Alert.alert('Analysis failed', msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: webTopPad }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Plant Scanner</Text>
        <Text style={styles.subtitle}>Take or upload a photo to identify</Text>

        {/* Image Preview */}
        <View style={styles.previewContainer}>
          {imageUri ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                }}
              >
                <Ionicons name="close-circle" size={28} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <LinearGradient
              colors={['#E8F5E9', '#F1F8E9']}
              style={styles.placeholder}
            >
              <View style={styles.placeholderInner}>
                <Ionicons name="camera-outline" size={64} color={Colors.secondary} />
                <Text style={styles.placeholderText}>No image selected</Text>
                <Text style={styles.placeholderSub}>Choose a photo to identify your plant</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => pickImage(true)}
            activeOpacity={0.85}
            disabled={analyzing}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="camera" size={26} color={Colors.white} />
              <Text style={styles.actionBtnText}>Camera</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => pickImage(false)}
            activeOpacity={0.85}
            disabled={analyzing}
          >
            <View style={styles.actionBtnOutline}>
              <Ionicons name="images-outline" size={26} color={Colors.primary} />
              <Text style={styles.actionBtnTextOutline}>Gallery</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        {imageUri && (
          <TouchableOpacity
            style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
            onPress={analyzeImage}
            disabled={analyzing}
            activeOpacity={0.9}
          >
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={Colors.white} />
                <Text style={styles.analyzeBtnText}>Analyzing...</Text>
              </View>
            ) : (
              <View style={styles.analyzingRow}>
                <Ionicons name="sparkles" size={22} color={Colors.white} />
                <Text style={styles.analyzeBtnText}>Identify Plant</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Tips */}
        {!imageUri && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips for best results</Text>
            <View style={styles.tipRow}>
              <Ionicons name="sunny-outline" size={18} color={Colors.primary} />
              <Text style={styles.tipText}>Good lighting improves accuracy</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="scan-outline" size={18} color={Colors.primary} />
              <Text style={styles.tipText}>Focus on leaves, flowers, or unique features</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="expand-outline" size={18} color={Colors.primary} />
              <Text style={styles.tipText}>Fill the frame with the plant</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginBottom: 24,
  },
  previewContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 24,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
  },
  placeholder: {
    height: 280,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderInner: {
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  placeholderSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.white,
  },
  actionBtnOutline: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
  },
  actionBtnTextOutline: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analyzeBtnText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
});
