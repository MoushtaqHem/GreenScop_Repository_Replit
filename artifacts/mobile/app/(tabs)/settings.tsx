import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Colors from '@/constants/colors';

interface SettingRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  isRTL?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  label,
  sublabel,
  onPress,
  rightElement,
  destructive = false,
  isRTL = false,
}: SettingRowProps) {
  const { mode } = useTheme();
  const styles = useMemo(() => makeStyles(), [mode]);
  const ic = iconColor ?? Colors.primary;
  return (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rowRTL]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.rowIcon, { backgroundColor: ic + '20' }]}>
        <Ionicons name={icon as never} size={20} color={ic} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive, isRTL && styles.textRTL]}>
          {label}
        </Text>
        {sublabel && <Text style={[styles.rowSublabel, isRTL && styles.textRTL]}>{sublabel}</Text>}
      </View>
      {rightElement || (
        onPress && <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout, isAdmin } = useAuth();
  const { t, lang, setLang, isRTL } = useI18n();
  const { mode, isDark, toggleMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const styles = useMemo(() => makeStyles(), [mode]);
  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  const handleLogout = () => {
    Alert.alert(t('signOutTitle'), t('signOutDesc'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleLanguageToggle = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <View style={[styles.container, { paddingTop: webTopPad }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t('settings')}</Text>

        {/* Profile Section */}
        <View style={[styles.profileCard, isRTL && styles.rowRTL]}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isRTL && styles.textRTL]}>
              {user?.email?.split('@')[0] ?? 'Plant Explorer'}
            </Text>
            <Text style={[styles.profileEmail, isRTL && styles.textRTL]}>{user?.email}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t('preferences')}</Text>
        <View style={styles.group}>
          <SettingRow
            icon={isDark ? 'moon' : 'moon-outline'}
            iconColor={isDark ? Colors.primary : '#5C6BC0'}
            label={t('darkMode')}
            sublabel={isDark ? (isRTL ? 'مفعّل' : 'On') : (isRTL ? 'معطّل' : 'Off')}
            isRTL={isRTL}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleMode}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={isDark ? Colors.primaryLight : Colors.white}
                ios_backgroundColor={Colors.border}
              />
            }
          />
          <View style={styles.separator} />
          <SettingRow
            icon="notifications-outline"
            iconColor="#FF7043"
            label={t('notifications')}
            isRTL={isRTL}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
          <View style={styles.separator} />
          <SettingRow
            icon="language-outline"
            iconColor="#00ACC1"
            label={t('language')}
            sublabel={lang === 'en' ? 'English' : 'العربية'}
            isRTL={isRTL}
            onPress={handleLanguageToggle}
            rightElement={
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>{lang === 'en' ? 'AR' : 'EN'}</Text>
              </View>
            }
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t('about')}</Text>
        <View style={styles.group}>
          <SettingRow
            icon="leaf-outline"
            iconColor={Colors.primary}
            label={t('aboutApp')}
            sublabel={t('version')}
            isRTL={isRTL}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="sparkles-outline"
            iconColor="#F57F17"
            label={t('aiModel')}
            sublabel="Gemini 2.5 Flash"
            isRTL={isRTL}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="shield-checkmark-outline"
            iconColor="#43A047"
            label={t('privacyPolicy')}
            isRTL={isRTL}
          />
        </View>

        {isAdmin && (
          <>
            <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>لوحة الإدارة</Text>
            <View style={styles.group}>
              <SettingRow
                icon="key-outline"
                iconColor="#7B1FA2"
                label="إدارة مفاتيح API"
                sublabel="GEMINI / WEATHER وغيرها"
                isRTL={isRTL}
                onPress={() => router.push('/admin/api-keys')}
              />
              <View style={styles.separator} />
              <SettingRow
                icon="people-outline"
                iconColor="#1E88E5"
                label="إدارة المستخدمين"
                sublabel="حظر / تنبيه / حذف / الباقات"
                isRTL={isRTL}
                onPress={() => router.push('/admin/users')}
              />
            </View>
          </>
        )}

        {/* Account */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>{t('account')}</Text>
        <View style={styles.group}>
          <SettingRow
            icon="log-out-outline"
            iconColor={Colors.error}
            label={t('signOut')}
            destructive
            isRTL={isRTL}
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.footer}>{t('footer')}</Text>
      </ScrollView>
    </View>
  );
}

function makeStyles() {
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
      color: Colors.text,
      marginBottom: 24,
    },
    textRTL: {
      textAlign: 'right',
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 28,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 3,
      gap: 16,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    profileAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      color: Colors.text,
      textTransform: 'capitalize',
    },
    profileEmail: {
      fontSize: 13,
      color: Colors.textMuted,
      marginTop: 4,
    },
    sectionLabel: {
      fontSize: 12,
      color: Colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginLeft: 4,
    },
    group: {
      backgroundColor: Colors.surface,
      borderRadius: 18,
      marginBottom: 24,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 18,
      gap: 14,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowContent: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 15,
      color: Colors.text,
    },
    rowLabelDestructive: {
      color: Colors.error,
    },
    rowSublabel: {
      fontSize: 12,
      color: Colors.textMuted,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: Colors.border,
      marginLeft: 68,
    },
    footer: {
      textAlign: 'center',
      fontSize: 12,
      color: Colors.textMuted,
      paddingTop: 8,
    },
    langBadge: {
      backgroundColor: Colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    langBadgeText: {
      color: Colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
