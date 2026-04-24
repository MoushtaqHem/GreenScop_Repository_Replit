import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface ApiKey {
  key: string;
  value: string;
  masked: string;
  updatedAt: string;
}

export default function ApiKeysScreen() {
  const { user, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': user?.userId ?? '',
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/api-keys`, { headers });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setKeys(data.keys);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load');
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

  const save = async (key: string) => {
    const value = editing[key];
    if (value === undefined) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/api-keys/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error('Save failed');
      setEditing((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      Alert.alert('تم الحفظ', `تم تحديث المفتاح ${key}`);
      load();
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل الحفظ');
    }
  };

  const addKey = async () => {
    if (!newKey.trim()) {
      Alert.alert('خطأ', 'اسم المفتاح مطلوب');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/api-keys`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: newKey.trim(), value: newValue }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Add failed');
      }
      setNewKey('');
      setNewValue('');
      load();
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل الإضافة');
    }
  };

  const removeKey = (key: string) => {
    Alert.alert('حذف المفتاح', `هل أنت متأكد من حذف ${key}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/admin/api-keys/${encodeURIComponent(key)}`, {
              method: 'DELETE',
              headers,
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Delete failed');
            }
            load();
          } catch (e) {
            Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل الحذف');
          }
        },
      },
    ]);
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: webTopPad + insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>إدارة مفاتيح API</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 60 }}>
          {keys.map((k) => {
            const isEditing = editing[k.key] !== undefined;
            const isRevealed = revealed[k.key];
            return (
              <View key={k.key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.keyName}>{k.key}</Text>
                  <TouchableOpacity
                    onPress={() => setRevealed((p) => ({ ...p, [k.key]: !isRevealed }))}
                  >
                    <Ionicons
                      name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={
                    isEditing
                      ? editing[k.key]
                      : isRevealed
                        ? k.value
                        : k.masked || '— لم يتم تعيين قيمة —'
                  }
                  editable={isEditing}
                  onChangeText={(v) => setEditing((p) => ({ ...p, [k.key]: v }))}
                  secureTextEntry={!isEditing && !isRevealed && !!k.value}
                  placeholder="أدخل قيمة المفتاح"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.actions}>
                  {isEditing ? (
                    <>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary]}
                        onPress={() => save(k.key)}
                      >
                        <Text style={styles.btnTextLight}>حفظ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnGhost]}
                        onPress={() =>
                          setEditing((p) => {
                            const n = { ...p };
                            delete n[k.key];
                            return n;
                          })
                        }
                      >
                        <Text style={styles.btnTextDark}>إلغاء</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary]}
                        onPress={() => setEditing((p) => ({ ...p, [k.key]: k.value }))}
                      >
                        <Text style={styles.btnTextLight}>تعديل / استبدال</Text>
                      </TouchableOpacity>
                      {!['GEMINI_API_KEY', 'VITE_GEMINI_API_KEY', 'WEATHER_API_KEY'].includes(
                        k.key,
                      ) && (
                        <TouchableOpacity
                          style={[styles.btn, styles.btnDanger]}
                          onPress={() => removeKey(k.key)}
                        >
                          <Text style={styles.btnTextLight}>حذف</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}

          <View style={[styles.card, { borderColor: Colors.primary, borderWidth: 1 }]}>
            <Text style={styles.keyName}>إضافة مفتاح جديد</Text>
            <TextInput
              style={styles.input}
              value={newKey}
              onChangeText={setNewKey}
              placeholder="اسم المفتاح (مثال: OPENAI_API_KEY)"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={newValue}
              onChangeText={setNewValue}
              placeholder="قيمة المفتاح"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={addKey}>
                <Text style={styles.btnTextLight}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '600', color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyName: { fontSize: 15, fontWeight: '600', color: Colors.text, textAlign: 'right' },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
    textAlign: 'right',
  },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnPrimary: { backgroundColor: Colors.primary },
  btnDanger: { backgroundColor: Colors.error },
  btnGhost: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  btnTextLight: { color: Colors.white, fontWeight: '600' },
  btnTextDark: { color: Colors.text, fontWeight: '600' },
});
