import React, { useState, useMemo } from 'react';
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
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function uriToBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = reject;
    img.src = uri;
  });
}

export default function ScanScreen() {
  const { user } = useAuth();
  const { setCurrentReport } = usePlant();
  const { mode, isDark } = useTheme();
  const { t, lang, isRTL } = useI18n();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const styles = useMemo(() => makeStyles(isRTL), [mode, isRTL]);

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert(t('permissionRequired'), t('cameraPermission'));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.4,
        base64: true,
        exif: false,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.4,
        base64: true,
        exif: false,
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
      Alert.alert(t('signInRequired'), t('signInToIdentify'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('signIn'), onPress: () => router.push('/auth') },
      ]);
      return;
    }

    if (!imageUri) {
      Alert.alert(t('noImage'), t('selectPhotoFirst'));
      return;
    }

    setAnalyzing(true);
    try {
      let base64 = imageBase64;

      if (!base64) {
        try {
          base64 = await uriToBase64(imageUri);
        } catch {
          Alert.alert(t('imageError'), t('imageReadError'));
          return;
        }
      }

      const res = await fetch(`${BASE_URL}/api/plants/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, userId: user.userId, lang }),
      });

      if (!res.ok) {
        let errMsg = t('analysisFailed');
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
      const msg = e instanceof Error ? e.message : t('couldNotAnalyze');
      Alert.alert(t('analysisFailed'), msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const placeholderColors: [string, string] = isDark
    ? ['#0F1612', '#0A0F0D']
    : ['#E8F5E9', '#F1F8E9'];

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
        <Text style={styles.title}>{t('plantScanner')}</Text>
        <Text style={styles.subtitle}>{t('scanSubtitle')}</Text>

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
            <LinearGradient colors={placeholderColors} style={styles.placeholder}>
              <View style={styles.placeholderInner}>
                <Ionicons name="camera-outline" size={64} color={Colors.secondary} />
                <Text style={styles.placeholderText}>{t('noImageSelected')}</Text>
                <Text style={styles.placeholderSub}>{t('choosePhotoDesc')}</Text>
              </View>
            </LinearGradient>
          )}
        </View>

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
              <Text style={styles.actionBtnText}>{t('camera')}</Text>
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
              <Text style={styles.actionBtnTextOutline}>{t('gallery')}</Text>
            </View>
          </TouchableOpacity>
        </View>

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
                <Text style={styles.analyzeBtnText}>{t('analyzing')}</Text>
              </View>
            ) : (
              <View style={styles.analyzingRow}>
                <Ionicons name="sparkles" size={22} color={Colors.white} />
                <Text style={styles.analyzeBtnText}>{t('identifyBtn')}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {!imageUri && (
          <View style={styles.tipsCard}>
            <Text style={[styles.tipsTitle, isRTL && styles.textRTL]}>{t('tipsTitle')}</Text>
            <View style={styles.tipRow}>
              <Ionicons name="sunny-outline" size={18} color={Colors.primary} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('tip1')}</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="scan-outline" size={18} color={Colors.primary} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('tip2')}</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="expand-outline" size={18} color={Colors.primary} />
              <Text style={[styles.tipText, isRTL && styles.textRTL]}>{t('tip3')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(isRTL: boolean) {
  return StyleSheet.create({
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
      textAlign: isRTL ? 'right' : 'left',
    },
    subtitle: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: Colors.textMuted,
      marginBottom: 24,
      textAlign: isRTL ? 'right' : 'left',
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
      backgroundColor: Colors.surface,
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
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 14,
      marginBottom: 20,
    },
    actionBtn: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 6,
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
      backgroundColor: Colors.surface,
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
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.7,
      shadowRadius: 18,
      elevation: 10,
    },
    analyzeBtnDisabled: {
      opacity: 0.7,
    },
    analyzingRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 20,
      gap: 14,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    tipsTitle: {
      fontSize: 15,
      fontFamily: 'Inter_700Bold',
      color: Colors.text,
      marginBottom: 4,
    },
    tipRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 12,
    },
    tipText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: Colors.textSecondary,
      flex: 1,
    },
    textRTL: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
  });
}
