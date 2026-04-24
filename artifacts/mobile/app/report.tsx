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
  Modal,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlant, NutritionItem, PlantReport } from '@/context/PlantContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const RISK_PALETTE: Record<string, { bg: string; fg: string; label: string }> = {
  Low: { bg: '#FFEBEE', fg: '#E53935', label: 'Low' },
  Medium: { bg: '#FFF3E0', fg: '#F57C00', label: 'Medium' },
  High: { bg: '#FCE4EC', fg: '#C2185B', label: 'High' },
};

const SAFETY_PALETTE: Record<string, { bg: string; fg: string }> = {
  'آمن': { bg: '#E8F5E9', fg: '#2E7D32' },
  'حذر': { bg: '#FFF8E1', fg: '#F57C00' },
  'غير آمن': { bg: '#FFEBEE', fg: '#C62828' },
};

function NutritionRow({ item, index }: { item: NutritionItem; index: number }) {
  const pct = parseInt(item.percentage, 10) || 0;
  return (
    <View style={[styles.nutritionRow, index % 2 === 0 && styles.nutritionRowAlt]}>
      <View style={styles.nutritionPctWrapper}>
        <Text style={styles.nutritionPct}>{item.percentage}</Text>
        <View style={styles.pctBar}>
          <View style={[styles.pctFill, { width: `${Math.min(pct, 100)}%` }]} />
        </View>
      </View>
      <Text style={styles.nutritionAmount}>{item.amount}</Text>
      <Text style={styles.nutritionName}>{item.name}</Text>
    </View>
  );
}

interface ToolCardProps {
  icon: string;
  iconColor: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

function ToolCard({ icon, iconColor, bg, title, subtitle, onPress }: ToolCardProps) {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.toolIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon as never} size={22} color={iconColor} />
      </View>
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function SectionCard({
  icon,
  iconColor,
  title,
  children,
  badge,
}: {
  icon: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {badge}
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.sectionIcon, { backgroundColor: iconColor + '22' }]}>
          <Ionicons name={icon as never} size={16} color={iconColor} />
        </View>
      </View>
      {children}
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
  const [soilOpen, setSoilOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lightOpen, setLightOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);

  if (!currentReport) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>لا يوجد تقرير</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const r: PlantReport = currentReport;
  const risk = (r.warnings?.risk_level && RISK_PALETTE[r.warnings.risk_level]) || RISK_PALETTE.Low;

  const handleSaveGarden = async () => {
    if (!user) return;
    setSavingGarden(true);
    try {
      await fetch(`${BASE_URL}/api/plants/garden`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          plantName: r.name,
          scientificName: r.scientificName,
          description: r.description,
          benefits: r.benefits,
          care: r.care,
          nutrition: r.nutrition,
          imageBase64: r.imageBase64,
        }),
      });
      setSavedGarden(true);
      Alert.alert('تمت الإضافة', 'تمت إضافة النبات إلى حديقتك');
    } catch {
      Alert.alert('خطأ', 'تعذر الحفظ في الحديقة');
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
          plantName: r.name,
          scientificName: r.scientificName,
          description: r.description,
          benefits: r.benefits,
          care: r.care,
          nutrition: r.nutrition,
          imageBase64: r.imageBase64,
        }),
      });
      setSavedFav(true);
      Alert.alert('تمت الإضافة', 'تمت إضافة النبات إلى المفضلة');
    } catch {
      Alert.alert('خطأ', 'تعذر الحفظ في المفضلة');
    } finally {
      setSavingFav(false);
    }
  };

  const sharePdf = async () => {
    try {
      const text = `${r.name} (${r.scientificName})\n\n${r.description}\n\nالفوائد: ${r.benefits}\nالعناية: ${r.care}`;
      await Share.share({ message: text, title: r.name });
    } catch {
      // user cancelled
    }
  };

  const downloadPdf = () => {
    Alert.alert('تصدير PDF', 'سيتم تصدير التقرير الكامل قريباً.');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroContainer}>
          {r.imageBase64 ? (
            <Image source={{ uri: r.imageBase64 }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.heroPlaceholder}>
              <Ionicons name="leaf" size={80} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          )}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.heroOverlay} />
          <View style={[styles.heroTopBar, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.iconBtn, savedGarden && styles.iconBtnSaved]}
                onPress={handleSaveGarden}
                disabled={savingGarden || savedGarden}
              >
                {savingGarden ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={savedGarden ? 'leaf' : 'leaf-outline'}
                    size={20}
                    color={Colors.white}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, savedFav && styles.iconBtnFav]}
                onPress={handleSaveFavorite}
                disabled={savingFav || savedFav}
              >
                {savingFav ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={savedFav ? 'heart' : 'heart-outline'}
                    size={20}
                    color={savedFav ? '#FF6B6B' : Colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroNameWrap}>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>غير سام</Text>
              </View>
              <View style={[styles.heroBadge, styles.heroBadgeWarn]}>
                <Text style={styles.heroBadgeText}>صعب</Text>
              </View>
            </View>
            <Text style={styles.heroName}>{r.name}</Text>
            <Text style={styles.heroScientific}>{r.scientificName}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* PDF buttons */}
          <View style={styles.pdfRow}>
            <TouchableOpacity style={[styles.pdfBtn, styles.pdfBtnPrimary]} onPress={sharePdf}>
              <Ionicons name="share-social-outline" size={16} color={Colors.white} />
              <Text style={styles.pdfBtnTextLight}>مشاركة PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pdfBtn, styles.pdfBtnGhost]} onPress={downloadPdf}>
              <Ionicons name="download-outline" size={16} color={Colors.text} />
              <Text style={styles.pdfBtnTextDark}>تحميل PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Similar plants */}
          <SectionCard icon="images-outline" iconColor="#7B1FA2" title="صور نباتات مشابهة">
            <View style={styles.emptyBox}>
              <Text style={styles.emptyBoxText}>لا توجد صور مشابهة لهذا النبات</Text>
              <TouchableOpacity style={styles.emptyBoxBtn}>
                <Text style={styles.emptyBoxBtnText}>إعادة البحث</Text>
              </TouchableOpacity>
            </View>
          </SectionCard>

          {/* Smart Tools */}
          <Text style={styles.groupTitle}>أدوات ذكية</Text>
          <View style={styles.toolsRow}>
            <ToolCard
              icon="aperture-outline"
              iconColor="#7B1FA2"
              bg="#F3E5F5"
              title="معاينة AR"
              subtitle="تجربة في غرفتك"
              onPress={() => setArOpen(true)}
            />
            <ToolCard
              icon="leaf-outline"
              iconColor="#43A047"
              bg="#E8F5E9"
              title="مساعد التربة"
              subtitle="خلطات ووصفات"
              onPress={() => setSoilOpen(true)}
            />
            <ToolCard
              icon="notifications-outline"
              iconColor="#F57C00"
              bg="#FFF3E0"
              title="التنبيهات المحلية"
              subtitle="من المجتمع"
              onPress={() => setAlertsOpen(true)}
            />
            <ToolCard
              icon="sunny-outline"
              iconColor="#FBC02D"
              bg="#FFF8E1"
              title="مقياس الضوء"
              subtitle="افحص الإضاءة"
              onPress={() => setLightOpen(true)}
            />
          </View>

          {/* Risk badge bar */}
          {r.warnings && (
            <View style={[styles.riskBar, { backgroundColor: risk.bg }]}>
              <Text style={[styles.riskBarText, { color: risk.fg }]}>تجنب الملامسة</Text>
              <Ionicons name="warning" size={14} color={risk.fg} />
            </View>
          )}

          {/* Care */}
          <SectionCard icon="leaf" iconColor={Colors.primary} title="دليل العناية">
            <View style={styles.careRow}>
              <Text style={styles.careValue}>Every 3-4 weeks</Text>
              <Text style={styles.careLabel}>الري</Text>
              <View style={styles.careIcon}>
                <Ionicons name="water" size={14} color="#1E88E5" />
              </View>
            </View>
            <View style={styles.careRow}>
              <Text style={styles.careValue}>Low to bright indirect light</Text>
              <Text style={styles.careLabel}>الإضاءة</Text>
              <View style={styles.careIcon}>
                <Ionicons name="sunny" size={14} color="#F9A825" />
              </View>
            </View>
            <View style={styles.careRow}>
              <Text style={styles.careValue}>Standard potting mix</Text>
              <Text style={styles.careLabel}>التربة</Text>
              <View style={styles.careIcon}>
                <Ionicons name="flower" size={14} color="#8D6E63" />
              </View>
            </View>
            <View style={styles.careGrid}>
              <View style={styles.careGridCell}>
                <Ionicons name="thermometer" size={16} color="#E53935" />
                <Text style={styles.careGridLabel}>الحرارة</Text>
                <Text style={styles.careGridValue}>18-27°C</Text>
              </View>
              <View style={styles.careGridCell}>
                <Ionicons name="trophy" size={16} color="#43A047" />
                <Text style={styles.careGridLabel}>الصعوبة</Text>
                <Text style={styles.careGridValue}>سهل</Text>
              </View>
            </View>
            <Text style={styles.careDescription}>{r.care}</Text>
          </SectionCard>

          {/* Botanical description */}
          <SectionCard icon="information-circle" iconColor={Colors.primary} title="الوصف النباتي">
            <Text style={styles.bodyText}>{r.description}</Text>
          </SectionCard>

          {/* Distribution */}
          {r.distribution && (
            <SectionCard icon="globe-outline" iconColor="#0288D1" title="أماكن الانتشار">
              <Text style={styles.bodyText}>{r.distribution}</Text>
            </SectionCard>
          )}

          {/* Nutritional */}
          <SectionCard icon="nutrition" iconColor="#43A047" title="القيمة الغذائية">
            <Text style={styles.subtleText}>القيم لكل 100 جرام</Text>
            <View style={styles.nutritionTable}>
              {r.nutrition.map((item, i) => (
                <NutritionRow key={item.name} item={item} index={i} />
              ))}
            </View>
          </SectionCard>

          {/* Medical benefits */}
          <SectionCard icon="medkit-outline" iconColor="#43A047" title="الفوائد الطبية">
            {(r.medicalBenefits && r.medicalBenefits.length > 0
              ? r.medicalBenefits
              : [r.benefits]
            ).map((b, idx) => (
              <View key={idx} style={styles.bullet}>
                <Text style={styles.bulletText}>{b}</Text>
                <View style={styles.bulletDot}>
                  <Ionicons name="checkmark" size={12} color="#43A047" />
                </View>
              </View>
            ))}
          </SectionCard>

          {/* Usage methods */}
          {r.usageMethods && r.usageMethods.length > 0 && (
            <SectionCard icon="hand-left-outline" iconColor="#1E88E5" title="طرق الاستخدام">
              {r.usageMethods.map((m, idx) => (
                <View key={idx} style={styles.bullet}>
                  <Text style={styles.bulletText}>{m}</Text>
                  <View style={[styles.bulletDot, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={{ color: '#1E88E5', fontSize: 11, fontWeight: '700' }}>
                      {idx + 1}
                    </Text>
                  </View>
                </View>
              ))}
            </SectionCard>
          )}

          {/* Warnings */}
          {r.warnings && (
            <View style={[styles.section, styles.warningSection]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: '#C62828' }]}>التحذيرات</Text>
                <View style={[styles.sectionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="warning" size={16} color="#C62828" />
                </View>
              </View>

              <View style={styles.warnTopRow}>
                <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                  <Text style={[styles.riskBadgeText, { color: risk.fg }]}>{risk.label}</Text>
                  <Text style={styles.riskBadgeLabel}>السمية</Text>
                </View>
                <View style={styles.warnTitleWrap}>
                  <Text style={styles.warnTitle}>نبات سام</Text>
                  <Text style={styles.warnSubtitle}>الخطر</Text>
                </View>
                <View style={[styles.warnIconRound, { backgroundColor: risk.bg }]}>
                  <Ionicons name="warning" size={20} color={risk.fg} />
                </View>
              </View>

              {r.warnings.summary && <Text style={styles.warnText}>{r.warnings.summary}</Text>}

              {/* Safety shield */}
              <View style={styles.shieldCard}>
                <View style={styles.shieldHeader}>
                  <Text style={styles.shieldTitle}>درع الحماية</Text>
                  <View style={styles.shieldIcon}>
                    <Ionicons name="shield-checkmark" size={16} color="#1E88E5" />
                  </View>
                </View>

                <View style={styles.shieldRow}>
                  <View
                    style={[
                      styles.shieldBadge,
                      {
                        backgroundColor:
                          (SAFETY_PALETTE[r.warnings.pet_safety ?? 'حذر']?.bg) ?? '#FFF8E1',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.shieldBadgeText,
                        {
                          color:
                            (SAFETY_PALETTE[r.warnings.pet_safety ?? 'حذر']?.fg) ?? '#F57C00',
                        },
                      ]}
                    >
                      للحيوانات الأليفة
                    </Text>
                    <Text style={styles.shieldBadgeSub}>
                      {r.warnings.pet_safety ?? 'حذر'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.shieldBadge,
                      {
                        backgroundColor:
                          (SAFETY_PALETTE[r.warnings.child_safety ?? 'حذر']?.bg) ?? '#FFF8E1',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.shieldBadgeText,
                        {
                          color:
                            (SAFETY_PALETTE[r.warnings.child_safety ?? 'حذر']?.fg) ?? '#F57C00',
                        },
                      ]}
                    >
                      للأطفال
                    </Text>
                    <Text style={styles.shieldBadgeSub}>
                      {r.warnings.child_safety ?? 'حذر'}
                    </Text>
                  </View>
                </View>

                {r.warnings.pet_note && (
                  <View style={styles.shieldNote}>
                    <Text style={styles.shieldNoteText}>{r.warnings.pet_note}</Text>
                    <Ionicons name="paw-outline" size={14} color="#F57C00" />
                  </View>
                )}
                {r.warnings.child_note && (
                  <View style={styles.shieldNote}>
                    <Text style={styles.shieldNoteText}>{r.warnings.child_note}</Text>
                    <Ionicons name="happy-outline" size={14} color="#F57C00" />
                  </View>
                )}

                <TouchableOpacity style={styles.shieldEmergencyBtn}>
                  <Text style={styles.shieldEmergencyText}>اتصل بالطبيب فوراً عند الابتلاع</Text>
                  <Ionicons name="call" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>

              {/* Symptoms */}
              {r.warnings.symptoms && r.warnings.symptoms.length > 0 && (
                <View>
                  <Text style={styles.symptomsTitle}>الأعراض المحتملة</Text>
                  <View style={styles.symptomsRow}>
                    {r.warnings.symptoms.map((s) => (
                      <View key={s} style={styles.symptomChip}>
                        <Text style={styles.symptomText}>{s}</Text>
                        <Ionicons name="alert-circle" size={12} color="#C62828" />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.bottomChip} onPress={() => setAlertsOpen(true)}>
          <Text style={styles.bottomChipText}>تنبيهات المجتمع</Text>
          <Ionicons name="notifications-outline" size={14} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomChip} onPress={() => setSoilOpen(true)}>
          <Text style={styles.bottomChipText}>مساعد التربة</Text>
          <Ionicons name="leaf-outline" size={14} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomChip, styles.bottomChipPrimary]} onPress={downloadPdf}>
          <Text style={styles.bottomChipTextLight}>تصدير PDF</Text>
          <Ionicons name="download" size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Soil Helper Modal */}
      <Modal visible={soilOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>مساعد التربة والتقصيص</Text>
              <TouchableOpacity onPress={() => setSoilOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <View style={styles.soilCard}>
                <View style={styles.soilCardHeader}>
                  <View>
                    <Text style={styles.soilTitle}>
                      {r.soilHelper?.title ?? 'وصفة التربة المثالية'}
                    </Text>
                    <Text style={styles.soilSubtitle}>وصفة التربة المثالية</Text>
                  </View>
                  <View style={styles.soilHeaderIcon}>
                    <Ionicons name="leaf" size={18} color="#43A047" />
                  </View>
                </View>

                {(r.soilHelper?.ingredients ?? []).map((ing) => (
                  <View key={ing.name} style={styles.soilIngredient}>
                    <View style={styles.soilParts}>
                      <Text style={styles.soilPartsText}>{ing.parts}</Text>
                    </View>
                    <Text style={styles.soilName}>{ing.name}</Text>
                  </View>
                ))}

                {r.soilHelper?.ph_range && (
                  <View style={styles.soilPh}>
                    <View style={styles.soilParts}>
                      <Text style={styles.soilPartsText}>{r.soilHelper.ph_range}</Text>
                    </View>
                    <Text style={styles.soilName}>درجة الحموضة المثالية</Text>
                  </View>
                )}

                {r.soilHelper?.moisture_tip && (
                  <View style={styles.soilTip}>
                    <Text style={styles.soilTipText}>{r.soilHelper.moisture_tip}</Text>
                    <Ionicons name="information-circle" size={14} color="#43A047" />
                  </View>
                )}
              </View>

              {r.soilHelper?.watering_tip && (
                <View style={[styles.tipBox, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={[styles.tipTitle, { color: '#1565C0' }]}>نصيحة الري</Text>
                  <Text style={styles.tipText}>{r.soilHelper.watering_tip}</Text>
                </View>
              )}
              {r.soilHelper?.drainage_tip && (
                <View style={[styles.tipBox, { backgroundColor: '#FFF8E1' }]}>
                  <Text style={[styles.tipTitle, { color: '#E65100' }]}>نصيحة التصريف</Text>
                  <Text style={styles.tipText}>{r.soilHelper.drainage_tip}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Community Alerts Modal */}
      <Modal visible={alertsOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تنبيهات المجتمع المحلي</Text>
              <TouchableOpacity onPress={() => setAlertsOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {(r.communityAlerts ?? ['لا توجد تنبيهات حالياً.']).map((a, idx) => (
                <View key={idx} style={styles.alertCard}>
                  <Text style={styles.alertText}>{a}</Text>
                  <Ionicons name="megaphone-outline" size={18} color="#F57C00" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Light Meter Modal */}
      <Modal visible={lightOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>مقياس الضوء</Text>
              <TouchableOpacity onPress={() => setLightOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#FFF8E1',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="sunny" size={60} color="#FBC02D" />
              </View>
              <Text style={{ fontSize: 16, color: Colors.text, textAlign: 'center' }}>
                وجّه كاميرا هاتفك نحو موقع النبات لقياس شدة الإضاءة.
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                هذه الميزة قيد التطوير وستتوفر قريباً.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* AR preview Modal */}
      <Modal visible={arOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>معاينة AR</Text>
              <TouchableOpacity onPress={() => setArOpen(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#F3E5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="aperture" size={60} color="#7B1FA2" />
              </View>
              <Text style={{ fontSize: 16, color: Colors.text, textAlign: 'center' }}>
                تجربة وضع النبات في غرفتك بتقنية الواقع المعزز.
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                هذه الميزة قيد التطوير وستتوفر قريباً.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F4' },
  scroll: { flex: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: { color: Colors.textMuted, fontSize: 16 },
  backLink: { color: Colors.primary, marginTop: 12, fontSize: 16 },

  /* Hero */
  heroContainer: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnSaved: { backgroundColor: 'rgba(46,125,50,0.7)' },
  iconBtnFav: { backgroundColor: 'rgba(255,107,107,0.3)' },
  heroActions: { flexDirection: 'row-reverse', gap: 8 },
  heroNameWrap: { position: 'absolute', bottom: 16, right: 20, left: 20, alignItems: 'flex-end' },
  heroBadges: { flexDirection: 'row-reverse', gap: 6, marginBottom: 6 },
  heroBadge: {
    backgroundColor: '#43A047',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeWarn: { backgroundColor: '#F57C00' },
  heroBadgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  heroName: { color: Colors.white, fontSize: 26, fontWeight: '800', textAlign: 'right' },
  heroScientific: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'right',
  },

  /* Content */
  content: { padding: 16, gap: 14 },

  pdfRow: { flexDirection: 'row-reverse', gap: 10, marginTop: -36, marginHorizontal: 4 },
  pdfBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfBtnPrimary: { backgroundColor: Colors.primary },
  pdfBtnGhost: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pdfBtnTextLight: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  pdfBtnTextDark: { color: Colors.text, fontWeight: '700', fontSize: 13 },

  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2EE',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  warningSection: { borderColor: '#FFCDD2' },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text, textAlign: 'right' },
  bodyText: { fontSize: 14, color: Colors.textDark, lineHeight: 22, textAlign: 'right' },
  subtleText: { fontSize: 11, color: Colors.textMuted, marginBottom: 8, textAlign: 'right' },

  emptyBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
  },
  emptyBoxText: { color: Colors.textMuted, fontSize: 13, marginBottom: 10 },
  emptyBoxBtn: {
    backgroundColor: '#7B1FA2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  emptyBoxBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },

  groupTitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  toolsRow: { flexDirection: 'row-reverse', gap: 8 },
  toolCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2EE',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  toolTitle: { fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  toolSubtitle: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },

  riskBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-end',
    gap: 6,
  },
  riskBarText: { fontSize: 11, fontWeight: '700' },

  /* Care */
  careRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 10,
  },
  careIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  careLabel: { color: Colors.textMuted, fontSize: 12, width: 50, textAlign: 'right' },
  careValue: { flex: 1, fontSize: 13, color: Colors.text, textAlign: 'left', fontStyle: 'italic' },
  careGrid: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  careGridCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 4,
  },
  careGridLabel: { fontSize: 11, color: Colors.textMuted },
  careGridValue: { fontSize: 13, color: Colors.text, fontWeight: '700' },
  careDescription: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
    textAlign: 'right',
  },

  /* Nutrition */
  nutritionTable: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EEEEEE' },
  nutritionRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  nutritionRowAlt: { backgroundColor: '#FAFAFA' },
  nutritionName: { flex: 1.2, fontSize: 13, color: Colors.text, fontWeight: '600', textAlign: 'right' },
  nutritionAmount: { flex: 1, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  nutritionPctWrapper: { flex: 1.5, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  pctBar: { flex: 1, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  pctFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  nutritionPct: { fontSize: 11, color: Colors.primary, fontWeight: '700', minWidth: 36, textAlign: 'left' },

  /* Bullets */
  bullet: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8, marginVertical: 5 },
  bulletDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  bulletText: { flex: 1, color: Colors.textDark, fontSize: 13, lineHeight: 20, textAlign: 'right' },

  /* Warnings */
  warnTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  warnIconRound: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  warnTitleWrap: { flex: 1, alignItems: 'flex-end' },
  warnTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  warnSubtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  riskBadgeText: { fontSize: 14, fontWeight: '800' },
  riskBadgeLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  warnText: { fontSize: 13, color: Colors.textDark, lineHeight: 20, marginTop: 10, textAlign: 'right' },

  shieldCard: {
    backgroundColor: '#F8FAFE',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E1ECF7',
  },
  shieldHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  shieldIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldTitle: { flex: 1, fontWeight: '700', color: Colors.text, fontSize: 14, textAlign: 'right' },
  shieldRow: { flexDirection: 'row-reverse', gap: 8 },
  shieldBadge: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  shieldBadgeText: { fontSize: 12, fontWeight: '700' },
  shieldBadgeSub: { fontSize: 11, marginTop: 2, opacity: 0.8 },
  shieldNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  shieldNoteText: { flex: 1, fontSize: 12, color: Colors.textDark, textAlign: 'right' },
  shieldEmergencyBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E53935',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 10,
  },
  shieldEmergencyText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  symptomsTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: '700',
  },
  symptomsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  symptomChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  symptomText: { fontSize: 11, color: '#C62828', fontWeight: '700' },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    gap: 8,
    padding: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  bottomChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F5F7F4',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  bottomChipPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary, flex: 1, justifyContent: 'center' },
  bottomChipText: { fontSize: 12, color: Colors.text, fontWeight: '700' },
  bottomChipTextLight: { fontSize: 13, color: Colors.white, fontWeight: '700' },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  soilCard: {
    backgroundColor: '#F1FAF3',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  soilCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  soilTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, textAlign: 'right' },
  soilSubtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textAlign: 'right' },
  soilHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soilIngredient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  soilName: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  soilParts: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soilPartsText: { color: '#2E7D32', fontWeight: '700', fontSize: 12 },
  soilPh: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  soilTip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  soilTipText: { flex: 1, fontSize: 12, color: Colors.textDark, textAlign: 'right' },

  tipBox: { borderRadius: 12, padding: 12, marginTop: 10 },
  tipTitle: { fontWeight: '800', fontSize: 13, marginBottom: 4, textAlign: 'right' },
  tipText: { fontSize: 12, color: Colors.textDark, lineHeight: 18, textAlign: 'right' },

  alertCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  alertText: { flex: 1, fontSize: 13, color: Colors.textDark, textAlign: 'right' },
});
