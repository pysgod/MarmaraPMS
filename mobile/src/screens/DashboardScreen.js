import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Clock, MapPin, ChevronRight, LogOut, Play, Pause, Square, Coffee, RefreshCw, Timer, Check, AlertTriangle } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout, API_URL } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionLoading, setActionLoading] = useState(false);
  const [mesaiActionLoading, setMesaiActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
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
  }, [user, API_URL]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    Alert.alert('Güncellendi', 'Tüm veriler yenilendi.');
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

  const formatHoursDisplay = (hours) => {
    if (!hours || isNaN(hours)) return '0dk';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0 && m > 0) return `${h}s ${m}dk`;
    if (h > 0) return `${h} saat`;
    return `${m}dk`;
  };

  const calculateRemainingTime = (plannedHours, workedHours) => {
    const remaining = plannedHours - workedHours;
    if (remaining <= 0) return { hours: 0, minutes: 0, isComplete: true };
    const hours = Math.floor(remaining);
    const minutes = Math.round((remaining - hours) * 60);
    return { hours, minutes, isComplete: false };
  };

  const isShiftEnded = (endTime) => {
    if (!endTime) return false;
    const [h, m] = endTime.split(':').map(Number);
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(h, m, 0, 0);
    
    const [startH] = (dashboardData?.today_shift?.start_time || '00:00').split(':').map(Number);
    if (h < startH) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return now > endDate;
  };

  const handleLeftButtonPress = async () => {
    const buttonStates = dashboardData?.button_states;
    if (!buttonStates) return;

    const action = buttonStates.left_action;
    
    if (action === 'start_shift') {
      navigation.navigate('Tara', { actionType: 'start_shift' });
    } else if (action === 'start_break') {
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
    navigation.navigate('Tara', { actionType: 'end_shift' });
  };

  const handleMesaiStart = () => {
    navigation.navigate('Tara', { actionType: 'start_mesai' });
  };

  const handleMesaiEnd = () => {
    navigation.navigate('Tara', { actionType: 'end_mesai' });
  };

  const todayShift = dashboardData?.today_shift;
  const todayMesai = dashboardData?.today_mesai;
  const attendance = dashboardData?.attendance;
  const profile = dashboardData?.profile || user;
  const buttonStates = dashboardData?.button_states;

  const isActiveShift = attendance?.is_active || false;
  const isOnBreak = attendance?.is_on_break || false;
  
  const worked = attendance?.worked_hours ? parseFloat(attendance.worked_hours) : 0;
  const planned = todayShift?.planned_hours ? parseFloat(todayShift.planned_hours) : 0;
  const progressPercent = planned > 0 ? Math.min((worked / planned) * 100, 100) : 0;
  
  const remainingTime = calculateRemainingTime(planned, worked);
  const shiftTimeEnded = todayShift && isShiftEnded(todayShift.end_time);
  const isShiftComplete = remainingTime.isComplete || (shiftTimeEnded && !isActiveShift);

  const getLeftButtonIcon = () => {
    if (!buttonStates) return <Play size={20} color="#fff" />;
    switch (buttonStates.left_action) {
      case 'start_shift': return <Play size={20} color="#fff" />;
      case 'start_break': return <Coffee size={20} color="#fff" />;
      case 'end_break': return <Coffee size={20} color="#fff" />;
      default: return <Play size={20} color="#fff" />;
    }
  };

  const getVardiyaStatus = () => {
    if (isActiveShift && !isOnBreak) {
      return { text: 'AKTİF', style: styles.statusBadgeActive, textStyle: styles.statusTextActive };
    }
    if (isOnBreak) {
      return { text: 'MOLADA', style: styles.statusBadgeBreak, textStyle: styles.statusTextBreak };
    }
    if (isShiftComplete) {
      return { text: 'TAMAMLANDI', style: styles.statusBadgeComplete, textStyle: styles.statusTextComplete };
    }
    if (shiftTimeEnded) {
      return { text: 'SONA ERDİ', style: styles.statusBadgeEnded, textStyle: styles.statusTextEnded };
    }
    return null;
  };

  const vardiyaStatus = getVardiyaStatus();
  const showVardiyaButtons = todayShift && !isShiftComplete && !shiftTimeEnded;

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
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={handleManualRefresh} 
              style={styles.refreshBtn}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <RefreshCw size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <LogOut size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
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

        {/* VARDİYA BİLGİSİ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Vardiya Bilgisi</Text>
            </View>
            {vardiyaStatus && (
              <View style={vardiyaStatus.style}>
                <Text style={vardiyaStatus.textStyle}>{vardiyaStatus.text}</Text>
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

              <View style={styles.remainingTimeContainer}>
                <Timer size={16} color={remainingTime.isComplete ? Colors.success : Colors.warning} />
                <Text style={[
                  styles.remainingTimeText,
                  remainingTime.isComplete && styles.remainingTimeComplete
                ]}>
                  {remainingTime.isComplete 
                    ? '✓ Vardiya tamamlandı' 
                    : `Kalan: ${remainingTime.hours} saat ${remainingTime.minutes} dk`
                  }
                </Text>
              </View>

              {(isActiveShift || worked > 0) && (
                <View style={{ marginTop: 12 }}>
                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressBar, 
                      { width: `${progressPercent}%` },
                      progressPercent >= 100 && styles.progressBarComplete
                    ]} />
                  </View>
                  <View style={styles.progressText}>
                    <Text style={styles.hoursText}>{formatHoursDisplay(worked)}</Text>
                    <Text style={styles.totalHoursText}>/ {formatHoursDisplay(planned)}</Text>
                  </View>
                </View>
              )}

              {showVardiyaButtons && (
                <View style={styles.shiftActionButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.shiftActionButton, 
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

                  {isActiveShift && (
                    <TouchableOpacity 
                      style={[styles.shiftActionButton, styles.rightButton]}
                      onPress={handleRightButtonPress}
                    >
                      <Square size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Vardiya Bitir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {isShiftComplete && (
                <View style={styles.shiftCompleteMessage}>
                  <Check size={18} color={Colors.success} />
                  <Text style={styles.shiftCompleteText}>
                    Bugünkü vardiyayı tamamladınız.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noShiftText}>Bugün için planlanmış vardiya yok.</Text>
          )}
        </View>

        {/* MESAİ BİLGİSİ */}
        <View style={[styles.card, styles.mesaiCard]}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Timer size={20} color={Colors.warning} />
              <Text style={[styles.cardTitle, { color: Colors.warning }]}>Mesai Bilgisi</Text>
            </View>
            {todayMesai ? (
              <View style={styles.statusBadgePending}>
                <Text style={styles.statusTextPending}>PLANLI</Text>
              </View>
            ) : (
              <View style={styles.statusBadgeEnded}>
                <Text style={styles.statusTextEnded}>YOK</Text>
              </View>
            )}
          </View>
          
          {todayMesai ? (
            <View>
              <View style={styles.shiftRow}>
                <View>
                  <Text style={styles.shiftLabel}>Saat Aralığı</Text>
                  <Text style={styles.shiftValue}>{todayMesai.start_time?.slice(0,5)} - {todayMesai.end_time?.slice(0,5)}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.shiftLabel}>Planlanan Süre</Text>
                  <Text style={styles.shiftValue}>{formatHoursDisplay(parseFloat(todayMesai.planned_hours))}</Text>
                </View>
              </View>

              <View style={styles.mesaiActionButtons}>
                <TouchableOpacity 
                  style={[styles.mesaiActionButton, styles.mesaiStartButton]}
                  onPress={handleMesaiStart}
                  disabled={mesaiActionLoading}
                >
                  <Play size={18} color="#fff" />
                  <Text style={styles.mesaiButtonText}>Mesai Başlat</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.mesaiActionButton, styles.mesaiEndButton]}
                  onPress={handleMesaiEnd}
                  disabled={mesaiActionLoading}
                >
                  <Square size={18} color="#fff" />
                  <Text style={styles.mesaiButtonText}>Mesai Bitir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.noShiftText}>Bugün için planlanmış mesai yok.</Text>
          )}

          <View style={styles.mesaiInfoNote}>
            <AlertTriangle size={14} color={Colors.textSecondary} />
            <Text style={styles.mesaiInfoText}>
              Mesai saatleri vardiyadan ayrı takip edilmektedir.
            </Text>
          </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  refreshBtn: {
    padding: 10,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
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
  mesaiCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
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
  statusBadgeComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusTextComplete: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeEnded: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  statusTextEnded: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusTextPending: {
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
  remainingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  remainingTimeText: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  remainingTimeComplete: {
    color: Colors.success,
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
  progressBarComplete: {
    backgroundColor: Colors.success,
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
  shiftActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  shiftActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
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
    fontSize: 14,
  },
  shiftCompleteMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  shiftCompleteText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  mesaiActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  mesaiActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mesaiStartButton: {
    backgroundColor: Colors.warning,
  },
  mesaiEndButton: {
    backgroundColor: '#DC2626',
  },
  mesaiButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mesaiInfoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 8,
  },
  mesaiInfoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    flex: 1,
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
