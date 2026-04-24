import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Colors from '@/constants/colors';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const { mode, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(), [mode]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('حقول ناقصة', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'حدث خطأ غير متوقع';
      Alert.alert(isLogin ? 'فشل تسجيل الدخول' : 'فشل التسجيل', msg);
    } finally {
      setLoading(false);
    }
  };

  const gradientColors: [string, string, string] = isDark
    ? ['#050807', '#0A0F0D', '#101814']
    : [Colors.primary, Colors.secondary, Colors.accent];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.gradient, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>GreenScope AI</Text>
            <Text style={styles.tagline}>Identify plants with intelligence</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function makeStyles() {
  return StyleSheet.create({
    gradient: {
      flex: 1,
    },
    kav: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    logoSection: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: 'rgba(255,255,255,0.95)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 18,
      elevation: 10,
    },
    appName: {
      fontSize: 32,
      fontFamily: 'Inter_700Bold',
      color: Colors.white,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 6,
    },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: 28,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.4,
      shadowRadius: 32,
      elevation: 12,
    },
    cardTitle: {
      fontSize: 22,
      fontFamily: 'Inter_700Bold',
      color: Colors.text,
      marginBottom: 24,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.inputBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: Colors.border,
      marginBottom: 14,
      paddingHorizontal: 14,
      height: 54,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      color: Colors.text,
      height: '100%',
    },
    inputFlex: {
      flex: 1,
    },
    eyeBtn: {
      padding: 4,
    },
    submitBtn: {
      backgroundColor: Colors.primary,
      borderRadius: 14,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      shadowColor: Colors.glow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.6,
      shadowRadius: 14,
      elevation: 8,
    },
    submitDisabled: {
      opacity: 0.7,
    },
    submitText: {
      color: Colors.white,
      fontSize: 17,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.3,
    },
    switchRow: {
      marginTop: 20,
      alignItems: 'center',
    },
    switchText: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: Colors.textSecondary,
    },
    switchLink: {
      fontFamily: 'Inter_600SemiBold',
      color: Colors.primary,
    },
  });
}
