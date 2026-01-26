import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Calendar, AlertTriangle, Clock, MapPin, ChevronRight, LogOut } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout, API_URL } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/mobile/dashboard/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  const todayShift = dashboardData?.today_shift;
  const attendance = dashboardData?.attendance;
  const profile = dashboardData?.profile || user;

  const isActiveShift = attendance?.is_active || false;
  
  // Calculate Progress
  const worked = attendance?.worked_hours ? parseFloat(attendance.worked_hours) : 0;
  const planned = todayShift?.planned_hours ? parseFloat(todayShift.planned_hours) : 0;
  
  const progressPercent = planned > 0 ? Math.min((worked / planned) * 100, 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hoş Geldiniz,</Text>
            <Text style={styles.userName}>{user?.first_name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Time Card */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
        </View>
        
        {/* Profile Summary */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={24} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.first_name} {profile?.last_name}</Text>
              {profile?.project_name && (
                <View style={styles.projectBadge}>
                  <MapPin size={12} color={Colors.primary} />
                  <Text style={styles.projectText}>{profile.project_name}</Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Shift & Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                 <Clock size={20} color={Colors.primary} />
                 <Text style={styles.cardTitle}>Vardiya Durumu</Text>
            </View>
            
            {/* Active Status Badge */}
            {isActiveShift ? (
                <View style={styles.statusBadgeActive}>
                    <Text style={styles.statusTextActive}>AKTİF VARDİYA</Text>
                </View>
            ) : (
                <View style={styles.statusBadgeInactive}>
                    <Text style={styles.statusTextInactive}>MESAİ DIŞI</Text>
                </View>
            )}
          </View>
          
          {todayShift ? (
            <View>
              <View style={styles.shiftRow}>
                 <View>
                    <Text style={styles.shiftLabel}>Vardiya Saati</Text>
                    <Text style={styles.shiftValue}>{todayShift.start_time?.slice(0,5)} - {todayShift.end_time?.slice(0,5)}</Text>
                 </View>
                 <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.shiftLabel}>Vardiya Tipi</Text>
                    <Text style={styles.shiftValue}>{todayShift.shift_name}</Text>
                 </View>
              </View>

              {/* Progress Section */}
              <View style={{ marginTop: 8 }}>
                  <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                  </View>
                  <View style={styles.progressText}>
                      <Text style={styles.hoursText}>{worked} Saat <Text style={{fontWeight:'normal', fontSize:12, color:Colors.textSecondary}}>Tamamlanan</Text></Text>
                      <Text style={styles.totalHoursText}>/ {planned} Saat</Text>
                  </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noShiftText}>Bugün için planlanmış vardiya bulunmamaktadır.</Text>
          )}
        </View>

        {/* Risk Status */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, {borderBottomWidth:0, paddingBottom:0, marginBottom:10}]}>
             <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <AlertTriangle size={20} color={Colors.warning} />
                <Text style={styles.cardTitle}>Bildirimler</Text>
             </View>
          </View>
          <View style={styles.riskStatus}>
            <View style={styles.riskIndicator} />
            <Text style={styles.riskText}>Güvendesiniz. Risk bildirimi yok.</Text>
          </View>
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
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 12,
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  projectText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusTextActive: {
    color: '#34D399', // Emerald 400
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  statusTextInactive: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shiftLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  shiftValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalHoursText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  noShiftText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
    riskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 8,
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  riskText: {
    color: Colors.textPrimary,
  },
});
