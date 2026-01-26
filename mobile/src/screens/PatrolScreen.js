import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, QrCode } from 'lucide-react-native';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

export default function PatrolScreen({ navigation }) {
    const { user, API_URL } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPatrols();
        
        // Tab açıldığında datayı yenile
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPatrols();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchPatrols = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/mobile/patrols/${user.id}`);
            const data = await response.json();
            
            if (data.success) {
                setAssignments(data.data.assignments);
                setLogs(data.data.recent_logs);
            }
        } catch (error) {
            console.error('Patrol fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPatrols();
    };

    const formatTime = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const StatusBadge = ({ result }) => {
        let color = Colors.textSecondary;
        let bg = 'rgba(55, 65, 81, 0.3)';
        let text = 'Belirsiz';

        switch(result) {
            case 'success':
                color = Colors.success;
                bg = 'rgba(16, 185, 129, 0.1)';
                text = 'Başarılı';
                break;
            case 'failed':
                color = Colors.danger;
                bg = 'rgba(239, 68, 68, 0.1)';
                text = 'Başarısız';
                break;
            case 'pending':
                color = Colors.warning;
                bg = 'rgba(245, 158, 11, 0.1)';
                text = 'Bekliyor';
                break;
        }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: color }]}>{text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Shield size={24} color={Colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.headerTitle}>Devriye Takibi</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                refreshControl={
                   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                {/* Assignments */}
                <Text style={styles.sectionTitle}>Aktif Görevler</Text>
                {loading ? (
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                ) : assignments.length > 0 ? (
                    assignments.map(item => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.patrol_name || 'Devriye'}</Text>
                                <View style={styles.scheduleBadge}>
                                    <Clock size={12} color={Colors.textSecondary} />
                                    <Text style={styles.scheduleText}>
                                        {item.start_time ? item.start_time.slice(0,5) : ''} - {item.end_time ? item.end_time.slice(0,5) : ''}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.actionBtn}
                                onPress={() => navigation.navigate('Tara')}
                            >
                                <QrCode size={18} color={Colors.white} />
                                <Text style={styles.actionBtnText}>Kontrol Noktası Okut</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>Aktif devriye göreviniz bulunmuyor.</Text>
                    </View>
                )}

                {/* Recent Logs */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Son Hareketler</Text>
                <View style={styles.logsList}>
                    {logs.length > 0 ? (
                        logs.map(log => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={styles.logIcon}>
                                    {log.result === 'success' ? <CheckCircle size={20} color={Colors.success} /> : 
                                     log.result === 'failed' ? <XCircle size={20} color={Colors.danger} /> :
                                     <AlertTriangle size={20} color={Colors.warning} />}
                                </View>
                                <View style={styles.logContent}>
                                    <Text style={styles.logTime}>{formatTime(log.time)}</Text>
                                    <Text style={styles.logDesc}>Devriye kontrol noktası</Text>
                                </View>
                                <StatusBadge result={log.result} />
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Bugün henüz kayıt yok.</Text>
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary
    },
    content: {
        padding: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12
    },
    loadingText: {
        color: Colors.textSecondary,
        textAlign: 'center'
    },
    card: {
        backgroundColor: 'rgba(31, 41, 55, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(55, 65, 81, 0.5)',
        marginBottom: 12
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary
    },
    scheduleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    scheduleText: {
        color: Colors.textSecondary,
        fontSize: 12
    },
    actionBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8
    },
    actionBtnText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14
    },
    emptyCard: {
        padding: 20,
        backgroundColor: 'rgba(31, 41, 55, 0.3)',
        borderRadius: 12,
        alignItems: 'center'
    },
    emptyText: {
        color: Colors.textSecondary
    },
    logsList: {
        backgroundColor: 'rgba(31, 41, 55, 0.3)',
        borderRadius: 12,
        padding: 16
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)'
    },
    logIcon: {
        marginRight: 12
    },
    logContent: {
        flex: 1
    },
    logTime: {
        color: Colors.textPrimary,
        fontWeight: '600'
    },
    logDesc: {
        color: Colors.textSecondary,
        fontSize: 12
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold'
    }
});
