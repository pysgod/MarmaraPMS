import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function ShiftsScreen() {
  const { user, API_URL } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [refreshing, setRefreshing] = useState(false);

  function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    fetchShifts();
  }, [weekStart]);

  const fetchShifts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Yerel saat dilimine göre YYYY-MM-DD formatı oluştur
      const toLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startStr = toLocalDateString(weekStart);
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const endStr = toLocalDateString(endDate);

      console.log('Fetching shifts for range:', startStr, endStr);

      const response = await fetch(`${API_URL}/mobile/shifts/${user.id}?start_date=${startStr}&end_date=${endStr}`);
      const data = await response.json();
      
      if (data.success) {
        setShifts(data.data.shifts);
      }
    } catch (error) {
      console.error('Shifts fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShifts();
  };

  const changeWeek = (direction) => {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + (direction * 7));
    setWeekStart(newDate);
  };

  const formatDate = (dateString, format = 'full') => {
    if (!dateString) return '';
    // YYYY-MM-DD formatını doğrudan parçalayıp yerel tarih oluşturuyoruz
    // Bu sayede UTC/Timezone kaymalarını önlüyoruz
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);

    if (format === 'day') return date.toLocaleDateString('tr-TR', { weekday: 'long' });
    if (format === 'date') return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    return date.toLocaleDateString('tr-TR');
  };

  const currentWeekDisplay = () => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return `${weekStart.getDate()} - ${end.getDate()} ${end.toLocaleDateString('tr-TR', { month: 'long' })}`;
  };

  const ShiftCard = ({ shift }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
           <Text style={styles.dayText}>{formatDate(shift.date, 'day')}</Text>
           <Text style={styles.dateText}>{formatDate(shift.date, 'date')}</Text>
        </View>
        <View style={[styles.statusBadge, { 
            backgroundColor: shift.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                             shift.status === 'missed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' 
        }]}>
            <Text style={[styles.statusText, { 
                color: shift.status === 'completed' ? Colors.success : 
                       shift.status === 'missed' ? Colors.danger : Colors.warning 
            }]}>
                {shift.status === 'completed' ? 'Tamamlandı' : 
                 shift.status === 'missed' ? 'Gelmedi' : 'Planlandı'}
            </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.row}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{shift.start_time?.slice(0,5)} - {shift.end_time?.slice(0,5)}</Text>
            <Text style={styles.durationText}>({shift.shift_name})</Text>
        </View>
        
        {shift.project_name && (
            <View style={styles.row}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.projectText}>{shift.project_name}</Text>
            </View>
        )}

        {(shift.mesai_hours > 0 || shift.mesai_shift_name) && (
            <View style={[styles.row, { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                <Clock size={16} color={Colors.warning} />
                <Text style={[styles.timeText, { color: Colors.warning }]}>
                    {shift.mesai_start_time ? `${shift.mesai_start_time.slice(0,5)} - ${shift.mesai_end_time?.slice(0,5)}` : `${shift.mesai_hours} Saat`}
                </Text>
                <Text style={[styles.durationText, { color: Colors.warning }]}>
                   (Mesai{shift.mesai_shift_name ? `: ${shift.mesai_shift_name}` : ''})
                </Text>
            </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vardiya Programı</Text>
        
        <View style={styles.weekNavigator}>
            <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.navBtn}>
                <ChevronLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.currentWeek}>
                <Calendar size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.weekText}>{currentWeekDisplay()}</Text>
            </View>
            
            <TouchableOpacity onPress={() => changeWeek(1)} style={styles.navBtn}>
                <ChevronRight size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
           <Text style={styles.loadingText}>Yükleniyor...</Text>
        ) : shifts.length > 0 ? (
            shifts.map(shift => <ShiftCard key={shift.id} shift={shift} />)
        ) : (
            <View style={styles.emptyState}>
                <AlertCircle size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Bu hafta için vardiya planı bulunamadı.</Text>
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
  header: {
    padding: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.textPrimary,
      marginBottom: 16
  },
  weekNavigator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(31, 41, 55, 0.5)',
      borderRadius: 12,
      padding: 4
  },
  navBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  currentWeek: {
      flexDirection: 'row',
      alignItems: 'center'
  },
  weekText: {
      color: Colors.textPrimary,
      fontWeight: '600',
      fontSize: 16
  },
  content: {
      padding: 20,
      paddingBottom: 40,
      gap: 16
  },
  loadingText: {
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 20
  },
  card: {
      backgroundColor: 'rgba(31, 41, 55, 0.5)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(55, 65, 81, 0.5)'
  },
  cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      paddingBottom: 12
  },
  dateContainer: {
      
  },
  dayText: {
      color: Colors.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 2
  },
  dateText: {
      color: Colors.textSecondary,
      fontSize: 12
  },
  statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6
  },
  statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase'
  },
  cardContent: {
      gap: 8
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
  },
  timeText: {
      color: Colors.textPrimary,
      fontSize: 16,
      fontWeight: '600'
  },
  durationText: {
      color: Colors.textSecondary,
      fontSize: 14
  },
  projectText: {
      color: Colors.primary,
      fontSize: 14
  },
  emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 16
  },
  emptyText: {
      color: Colors.textSecondary,
      textAlign: 'center'
  }
});
