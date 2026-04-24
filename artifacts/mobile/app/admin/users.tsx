import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'warned' | 'banned';
  subscriptionTier: 'free' | 'paid';
  warningMessage: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: '#43A047' },
  warned: { label: 'تنبيه', color: '#F57C00' },
  banned: { label: 'محظور', color: '#E53935' },
};

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'مجانية', color: '#9E9E9E' },
  paid: { label: 'مدفوعة', color: '#1E88E5' },
};

type FilterKey = 'all' | 'free' | 'paid' | 'banned';

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all', label: 'الكل', icon: 'apps-outline' },
  { key: 'free', label: 'مجاني', icon: 'pricetag-outline' },
  { key: 'paid', label: 'مدفوع', icon: 'diamond-outline' },
  { key: 'banned', label: 'موقوف', icon: 'ban-outline' },
];

export default function UsersAdminScreen() {
  const { user, isAdmin } = useAuth();
  const { mode } = useTheme();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [warningTarget, setWarningTarget] = useState<AdminUser | null>(null);
  const [warningText, setWarningText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const styles = useMemo(() => makeStyles(), [mode]);

  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': user?.userId ?? '',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users`, { headers });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setUsers(data.users);
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل التحميل');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/(tabs)');
      return;
    }
    load();
  }, [isAdmin, load]);

  const updateUser = async (id: string, body: Record<string, unknown>) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Update failed');
      load();
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل التحديث');
    }
  };

  const deleteUser = (u: AdminUser) => {
    Alert.alert('حذف المستخدم', `حذف ${u.email} نهائياً؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/admin/users/${u.id}`, {
              method: 'DELETE',
              headers,
            });
            if (!res.ok) throw new Error('Delete failed');
            load();
          } catch (e) {
            Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل الحذف');
          }
        },
      },
    ]);
  };

  const toggleBan = (u: AdminUser) => {
    const newStatus = u.status === 'banned' ? 'active' : 'banned';
    updateUser(u.id, { status: newStatus });
  };

  const toggleTier = (u: AdminUser) => {
    const newTier = u.subscriptionTier === 'paid' ? 'free' : 'paid';
    updateUser(u.id, { subscriptionTier: newTier });
  };

  const submitWarning = async () => {
    if (!warningTarget) return;
    await updateUser(warningTarget.id, {
      status: 'warned',
      warningMessage: warningText.trim() || 'تم توجيه تنبيه إليك من الإدارة.',
    });
    setWarningTarget(null);
    setWarningText('');
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q)) return false;
      if (filter === 'free' && u.subscriptionTier !== 'free') return false;
      if (filter === 'paid' && u.subscriptionTier !== 'paid') return false;
      if (filter === 'banned' && u.status !== 'banned') return false;
      return true;
    });
  }, [users, search, filter]);

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: webTopPad + insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>إدارة المستخدمين</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث بالبريد الإلكتروني..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
              >
                <Ionicons
                  name={f.icon as never}
                  size={14}
                  color={active ? Colors.white : Colors.text}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 80 }}>
          <Text style={styles.counter}>
            {filteredUsers.length} من أصل {users.length} مستخدم
          </Text>
          {filteredUsers.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>لا يوجد مستخدمون مطابقون</Text>
            </View>
          )}
          {filteredUsers.map((u) => {
            const status = STATUS_LABELS[u.status] ?? STATUS_LABELS.active;
            const tier = TIER_LABELS[u.subscriptionTier] ?? TIER_LABELS.free;
            const isMe = u.id === user?.userId;
            return (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.email}>{u.email}</Text>
                    <Text style={styles.subText}>
                      {u.role === 'admin' ? 'مدير' : 'مستخدم'} •{' '}
                      {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </Text>
                  </View>
                  <View style={styles.badgesCol}>
                    <View style={[styles.badge, { backgroundColor: status.color + '22' }]}>
                      <Text style={[styles.badgeText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                    <View
                      style={[styles.badge, { backgroundColor: tier.color + '22', marginTop: 4 }]}
                    >
                      <Text style={[styles.badgeText, { color: tier.color }]}>{tier.label}</Text>
                    </View>
                  </View>
                </View>

                {u.warningMessage && u.status === 'warned' && (
                  <View style={styles.warnBox}>
                    <Ionicons name="warning" size={14} color="#F57C00" />
                    <Text style={styles.warnText}>{u.warningMessage}</Text>
                  </View>
                )}

                {!isMe && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnWarn]}
                      onPress={() => {
                        setWarningTarget(u);
                        setWarningText(u.warningMessage ?? '');
                      }}
                    >
                      <Ionicons name="warning-outline" size={14} color="#F57C00" />
                      <Text style={[styles.btnText, { color: '#F57C00' }]}>تنبيه</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnBan]}
                      onPress={() => toggleBan(u)}
                    >
                      <Ionicons
                        name={u.status === 'banned' ? 'lock-open-outline' : 'ban-outline'}
                        size={14}
                        color="#E53935"
                      />
                      <Text style={[styles.btnText, { color: '#E53935' }]}>
                        {u.status === 'banned' ? 'إلغاء الحظر' : 'حظر'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnTier]}
                      onPress={() => toggleTier(u)}
                    >
                      <Ionicons name="diamond-outline" size={14} color="#1E88E5" />
                      <Text style={[styles.btnText, { color: '#1E88E5' }]}>
                        {u.subscriptionTier === 'paid' ? 'تحويل إلى مجانية' : 'ترقية إلى مدفوعة'}
                      </Text>
                    </TouchableOpacity>
                    {u.status !== 'active' && (
                      <TouchableOpacity
                        style={[styles.btn, styles.btnReset]}
                        onPress={() =>
                          updateUser(u.id, { status: 'active', warningMessage: null })
                        }
                      >
                        <Ionicons name="checkmark-circle-outline" size={14} color="#43A047" />
                        <Text style={[styles.btnText, { color: '#43A047' }]}>إعادة تفعيل</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.btn, styles.btnDel]}
                      onPress={() => deleteUser(u)}
                    >
                      <Ionicons name="trash-outline" size={14} color={Colors.white} />
                      <Text style={[styles.btnText, { color: Colors.white }]}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isMe && <Text style={styles.meTag}>(حسابك الحالي)</Text>}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={!!warningTarget} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>توجيه تنبيه</Text>
            <Text style={styles.modalSub}>{warningTarget?.email}</Text>
            <TextInput
              style={styles.modalInput}
              value={warningText}
              onChangeText={setWarningText}
              placeholder="نص التنبيه"
              placeholderTextColor={Colors.textMuted}
              multiline
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setWarningTarget(null)}
              >
                <Text style={styles.btnText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#F57C00' }]}
                onPress={submitWarning}
              >
                <Text style={[styles.btnText, { color: Colors.white }]}>إرسال التنبيه</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles() {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    backBtn: { padding: 4 },
    title: { fontSize: 18, fontWeight: '600', color: Colors.text },
    counter: { color: Colors.textMuted, marginBottom: 12, textAlign: 'right' },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors.cardBorder,
    },
    cardTop: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
    email: { fontSize: 15, fontWeight: '600', color: Colors.text, textAlign: 'right' },
    subText: { fontSize: 12, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
    badgesCol: { alignItems: 'flex-end' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    warnBox: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(245,124,0,0.15)',
      padding: 8,
      borderRadius: 8,
      marginTop: 10,
    },
    warnText: { fontSize: 12, color: '#F57C00', flex: 1, textAlign: 'right' },
    actions: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    btn: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    btnText: { fontSize: 12, fontWeight: '600', color: Colors.text },
    btnWarn: { borderColor: '#F57C00', backgroundColor: 'rgba(245,124,0,0.12)' },
    btnBan: { borderColor: '#E53935', backgroundColor: 'rgba(229,57,53,0.12)' },
    btnTier: { borderColor: '#1E88E5', backgroundColor: 'rgba(30,136,229,0.12)' },
    btnReset: { borderColor: '#43A047', backgroundColor: 'rgba(67,160,71,0.12)' },
    btnDel: { borderColor: Colors.error, backgroundColor: Colors.error },
    btnGhost: { borderColor: Colors.border, backgroundColor: Colors.inputBg },
    meTag: { color: Colors.textMuted, fontSize: 12, marginTop: 8, textAlign: 'right' },
    toolbar: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    searchBox: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: Colors.inputBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 42,
      borderWidth: 1,
      borderColor: Colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: Colors.text,
      textAlign: 'right',
      height: '100%',
    },
    filtersRow: { flexDirection: 'row-reverse', gap: 8, paddingTop: 10 },
    chip: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.inputBg,
    },
    chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    chipText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
    chipTextActive: { color: Colors.white },
    empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder },
    modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'right' },
    modalSub: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
    modalInput: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 12,
      minHeight: 80,
      marginTop: 12,
      color: Colors.text,
      backgroundColor: Colors.inputBg,
      textAlign: 'right',
    },
  });
}
