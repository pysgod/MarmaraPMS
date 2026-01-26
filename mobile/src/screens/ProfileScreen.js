import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, Award, Shirt, Building2, Calendar, CreditCard, LogOut, FileText, MapPin } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, API_URL } = useAuth();
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/mobile/profile/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <Icon size={20} color={Colors.textSecondary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: Colors.textSecondary }}>Yükleniyor...</Text>
      </View>
    );
  }

  const clothingSizes = profile?.clothing_sizes ? (typeof profile.clothing_sizes === 'string' ? JSON.parse(profile.clothing_sizes) : profile.clothing_sizes) : {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerTop}>
                 <Text style={styles.screenTitle}>Profilim</Text>
                 <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <LogOut size={20} color={Colors.danger} />
                 </TouchableOpacity>
            </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {profile?.first_name ? profile.first_name[0] : user.first_name[0]}
              </Text>
            </View>
            <Text style={styles.nameLarge}>{profile?.first_name} {profile?.last_name}</Text>
            <Text style={styles.titleLarge}>{profile?.title || 'Personel'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: profile?.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                 <Text style={[styles.statusText, { color: profile?.status === 'active' ? Colors.success : Colors.warning }]}>
                     {profile?.status === 'active' ? 'Aktif Personel' : 'Pasif'}
                 </Text>
            </View>
          </View>
        </View>

        {/* Info Sections */}
        <View style={styles.content}>
            <Section title="Kişisel Bilgiler">
                <InfoRow icon={FileText} label="TC Kimlik No" value={profile?.tc_no} />
                <InfoRow icon={Phone} label="Telefon" value={profile?.phone} />
                <InfoRow icon={Mail} label="E-Posta" value={profile?.email} />
                <InfoRow icon={Calendar} label="Doğum Tarihi" value={profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('tr-TR') : '-'} />
            </Section>

            <Section title="Çalışma Bilgileri">
                <InfoRow icon={Building2} label="Firma" value={profile?.company?.name} />
                <InfoRow icon={MapPin} label="Proje" value={profile?.project?.name} />
                <InfoRow icon={Calendar} label="İşe Giriş" value={profile?.start_date ? new Date(profile.start_date).toLocaleDateString('tr-TR') : '-'} />
                <InfoRow icon={CreditCard} label="IBAN" value={profile?.iban} />
            </Section>

            {/* Sertifika */}
            {profile?.has_certificate && (
                <Section title="Özel Güvenlik Sertifikası">
                    <View style={styles.certificateCard}>
                        <Award size={32} color={Colors.primary} style={{ marginBottom: 8 }} />
                        <Text style={styles.certTitle}>Özel Güvenlik Kimlik Kartı</Text>
                        <Text style={styles.certDetail}>No: {profile.certificate_no}</Text>
                        <Text style={styles.certDetail}>Geçerlilik: {profile.certificate_expiry ? new Date(profile.certificate_expiry).toLocaleDateString('tr-TR') : '-'}</Text>
                    </View>
                </Section>
            )}

            {/* Kıyafet Bedenleri */}
            <Section title="Kıyafet Bedenleri">
                <View style={styles.clothingGrid}>
                    {Object.entries(clothingSizes).map(([key, value]) => (
                        <View key={key} style={styles.clothingItem}>
                            <Text style={styles.clothingLabel}>{key.replace('_', ' ').toUpperCase()}</Text>
                            <Text style={styles.clothingValue}>{value}</Text>
                        </View>
                    ))}
                    {Object.keys(clothingSizes).length === 0 && (
                        <Text style={{ color: Colors.textSecondary }}>Beden bilgisi girilmemiş.</Text>
                    )}
                </View>
            </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  screenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.textPrimary
  },
  logoutBtn: {
      padding: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 8
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  nameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  titleLarge: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20
  },
  statusText: {
      fontSize: 12,
      fontWeight: '600'
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  sectionContent: {
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  certificateCard: {
      alignItems: 'center',
      padding: 12
  },
  certTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.textPrimary,
      marginBottom: 8
  },
  certDetail: {
      color: Colors.textSecondary,
      fontSize: 14
  },
  clothingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12
  },
  clothingItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 12,
      borderRadius: 8,
      minWidth: '45%',
      flex: 1
  },
  clothingLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      marginBottom: 4
  },
  clothingValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.textPrimary
  }
});
