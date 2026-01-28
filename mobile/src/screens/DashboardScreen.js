import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Clock, MapPin, ChevronRight, LogOut, Play, Pause, Square, Coffee } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout, API_URL } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);

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

  // Action Handlers
  const handleLeftButtonPress = async () => {
    const buttonStates = dashboardData?.button_states;
    if (!buttonStates) return;

    const action = buttonStates.left_action;
    
    if (action === 'start_shift') {
      // Navigate to QR Scanner for shift start
      navigation.navigate('Scan', { actionType: 'start_shift' });
    } else if (action === 'start_break') {
      // Call break API directly
      setActionLoading(true);
      try {
        const response = await fetch(`${API_URL}/mobile/attendance/break`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: user.id, action: 'start' })
        });
        const result = await response.json();
        Alert.alert(result.success ? 'Başarılı' : 'Hata', result.message);
        await fetchDashboardData();
      } catch (error) {
        Alert.alert('Hata', 'Mola başlatılamadı');
      } finally {
        setActionLoading(false);
      }
    } else if (action === 'end_break') {
      // Call break API directly
      setActionLoading(true);
      try {
        const response = await fetch(`${API_URL}/mobile/attendance/break`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: user.id, action: 'end' })
        });
        const result = await response.json();
        Alert.alert(result.success ? 'Başarılı' : 'Hata', result.message);
        await fetchDashboardData();
      } catch (error) {
        Alert.alert('Hata', 'Mola bitirilemedi');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRightButtonPress = () => {
    // Navigate to QR Scanner for shift end
    navigation.navigate('Scan', { actionType: 'end_shift' });
  };

  const todayShift = dashboardData?.today_shift;
  const todayMesai = dashboardData?.today_mesai;
  const attendance = dashboardData?.attendance;
  const profile = dashboardData?.profile || user;
  const buttonStates = dashboardData?.button_states;

  const isActiveShift = attendance?.is_active || false;
  const isOnBreak = attendance?.is_on_break || false;
  
  // Calculate Progress
  const worked = attendance?.worked_hours ? parseFloat(attendance.worked_hours) : 0;
  const planned = todayShift?.planned_hours ? parseFloat(todayShift.planned_hours) : 0;
  const progressPercent = planned > 0 ? Math.min((worked / planned) * 100, 100) : 0;

  // Get button icon
  const getLeftButtonIcon = () => {
    if (!buttonStates) return <Play size={20} color="#fff" />;
    switch (buttonStates.left_action) {
      case 'start_shift': return <Play size={20} color="#fff" />;
      case 'start_break': return <Coffee size={20} color="#fff" />;
      case 'end_break': return <Coffee size={20} color="#fff" />;
      default: return <Play size={20} color="#fff" />;
    }
  };

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

        {/* Shift Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Vardiya Bilgisi</Text>
            </View>
            {isActiveShift && !isOnBreak && (
              <View style={styles.statusBadgeActive}>
                <Text style={styles.statusTextActive}>AKTİF</Text>
              </View>
            )}
            {isOnBreak && (
              <View style={styles.statusBadgeBreak}>
                <Text style={styles.statusTextBreak}>MOLADA</Text>
              </View>
            )}
          </View>
          
          {todayShift ? (
            <View>
              <View style={styles.shiftRow}>
                <View>
                  <Text style={styles.shiftLabel}>Saat Aralığı</Text>
                  <Text style={styles.shiftValue}>{todayShift.start_time?.slice(0,5)} - {todayShift.end_time?.slice(0,5)}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.shiftLabel}>Mola Hakkı</Text>
                  <Text style={styles.shiftValue}>{todayShift.break_duration || 0} dk</Text>
                </View>
              </View>

              {/* Progress */}
              {isActiveShift && (
                <View style={{ marginTop: 12 }}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                  </View>
                  <View style={styles.progressText}>
                    <Text style={styles.hoursText}>{worked.toFixed(1)} Saat</Text>
                    <Text style={styles.totalHoursText}>/ {planned} Saat</Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noShiftText}>Bugün için planlanmış vardiya yok.</Text>
          )}
        </View>

        {/* Mesai (Overtime) Info Card */}
        {todayMesai && (
          <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: Colors.warning }]}>
            <View style={styles.cardHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Clock size={20} color={Colors.warning} />
                <Text style={[styles.cardTitle, { color: Colors.warning }]}>Mesai Bilgisi</Text>
              </View>
            </View>
            <View style={styles.shiftRow}>
              <View>
                <Text style={styles.shiftLabel}>Saat Aralığı</Text>
                <Text style={styles.shiftValue}>{todayMesai.start_time?.slice(0,5)} - {todayMesai.end_time?.slice(0,5)}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.shiftLabel}>Süre</Text>
                <Text style={styles.shiftValue}>{todayMesai.planned_hours} Saat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.leftButton,
              isOnBreak && styles.breakButton,
              actionLoading && styles.disabledButton
            ]}
            onPress={handleLeftButtonPress}
            disabled={actionLoading}
          >
            {getLeftButtonIcon()}
            <Text style={styles.actionButtonText}>
              {buttonStates?.left_label || 'Vardiya Başlat'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.rightButton,
              !buttonStates?.right_enabled && styles.disabledButton
            ]}
            onPress={handleRightButtonPress}
            disabled={!buttonStates?.right_enabled}
          >
            <Square size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {buttonStates?.right_label || 'Vardiya Bitir'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Break Status */}
        {attendance?.total_break_minutes > 0 && (
          <View style={styles.breakInfo}>
            <Coffee size={16} color={Colors.textSecondary} />
            <Text style={styles.breakInfoText}>
              Bugün toplam {attendance.total_break_minutes} dk mola kullandınız
            </Text>
          </View>
        )}

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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 12,
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
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeBreak: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusTextBreak: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
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
    padding: 16,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  leftButton: {
    backgroundColor: Colors.primary,
  },
  rightButton: {
    backgroundColor: '#EF4444',
  },
  breakButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  breakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 12,
  },
  breakInfoText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
