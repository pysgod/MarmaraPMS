import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { RotateCcw, Zap, ZapOff, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../theme/Colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreen({ navigation }) {
    const { user, API_URL } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    
    // Error Modal State
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorResult, setErrorResult] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setScanned(false);
            setLoading(false);
            setModalVisible(false);
            setErrorModalVisible(false);
            setScanResult(null);
            setErrorResult(null);
        });
        return unsubscribe;
    }, [navigation]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Kamera izni gerekiyor</Text>
                <Button onPress={requestPermission} title="İzin Ver" color={Colors.primary} />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);
        setLoading(true);
        
        try {
            // 1. Scan Request
            const response = await fetch(`${API_URL}/mobile/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: user.id,
                    code: data
                })
            });

            const result = await response.json();

            if (result.success) {
                if (result.data.can_confirm) {
                    // Show Confirmation Modal
                    setScanResult(result.data);
                    setModalVisible(true);
                } else {
                    // Direct Success (e.g. Checkpoint or Direct Entry)
                    // Use Context for Title if available
                    const title = result.data.context ? `${result.data.context} İşlemi` : "Başarılı";
                    
                    // Show Custom Success Modal via ErrorModal mechanism (styled as success)
                    // OR just standard Alert. Standard Alert is native and visible.
                    // Let's stick to Alert but make it clear.
                    Alert.alert(title, result.message, [{ text: "Tamam", onPress: () => setScanned(false) }]);
                }
            } else {
                // Show Custom Error Modal instead of Alert
                setErrorResult({
                    title: "Hata",
                    message: result.message || "Geçersiz işlem"
                });
                setErrorModalVisible(true);
            }
        } catch (error) {
             setErrorResult({
                title: "Bağlantı Hatası",
                message: "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
            });
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };
    
    const confirmAction = async () => {
        if (!scanResult) return;
        setLoading(true);
        
        try {
            const response = await fetch(`${API_URL}/mobile/attendance/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: user.id,
                    projectId: scanResult.project_id,
                    action: scanResult.action,
                    attendanceStatus: scanResult.attendance_status
                })
            });
            
            const result = await response.json();
            
            setModalVisible(false);
            
            if (result.success) {
                Alert.alert("İşlem Başarılı", result.message, [{ text: "Tamam", onPress: () => setScanned(false) }]);
            } else {
                 setErrorResult({
                    title: "İşlem Hatası",
                    message: result.message
                });
                setErrorModalVisible(true);
            }
        } catch (error) {
             setErrorResult({
                title: "Hata",
                message: "Onay işlemi başarısız"
            });
            setErrorModalVisible(true);
            setModalVisible(false);
        } finally {
            setLoading(false);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
        // Delay resetting scanned status slightly to prevent immediate re-scan if user hasn't moved camera
        setTimeout(() => {
            setScanned(false);
        }, 500);
    };

    return (
        <View style={styles.container}>
            <CameraView 
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned || loading ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                enableTorch={flash}
            />

            <SafeAreaView style={styles.overlay} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>QR Tara</Text>
                    <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.iconBtn}>
                        {flash ? <Zap size={24} color={Colors.warning} fill={Colors.warning} /> : <ZapOff size={24} color={Colors.white} />}
                    </TouchableOpacity>
                </View>

                <View style={styles.centerContainer}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </View>
                    <Text style={styles.scanText}>QR kodu karenin içine hizalayın</Text>
                    {loading && <Text style={styles.scanText}>İşleniyor...</Text>}
                </View>
                
                <View style={styles.footer}>
                     {scanned && !modalVisible && !errorModalVisible && (
                         <TouchableOpacity onPress={() => setScanned(false)} style={styles.resetBtn}>
                             <RotateCcw size={20} color={Colors.white} />
                             <Text style={styles.resetText}>Tekrar Tara</Text>
                         </TouchableOpacity>
                     )}
                </View>
            </SafeAreaView>
            
            {/* Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                    setScanned(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {scanResult && (
                            <>
                                <View style={styles.modalHeader}>
                                    {scanResult.status_type === 'warning' ? 
                                        <AlertTriangle size={48} color={Colors.warning} /> :
                                        <CheckCircle size={48} color={Colors.success} />
                                    }
                                    <Text style={styles.modalTitle}>{scanResult.title}</Text>
                                </View>
                                
                                <View style={styles.modalBody}>
                                    <View style={styles.infoRow}>
                                        <Clock size={20} color={Colors.textSecondary} />
                                        <Text style={styles.infoText}>Vardiya: {scanResult.shift_time}</Text>
                                    </View>
                                    
                                    <View style={[styles.statusBox, { 
                                        backgroundColor: scanResult.status_type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        borderColor: scanResult.status_type === 'warning' ? Colors.warning : Colors.success
                                    }]}>
                                        <Text style={[styles.statusMsg, {
                                            color: scanResult.status_type === 'warning' ? Colors.warning : Colors.success
                                        }]}>
                                            {scanResult.message}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnCancel]}
                                        onPress={() => {
                                            setModalVisible(false);
                                            setScanned(false);
                                        }}
                                    >
                                        <Text style={styles.btnTextCancel}>İptal</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.btn, styles.btnConfirm]}
                                        onPress={confirmAction}
                                    >
                                        <Text style={styles.btnTextConfirm}>
                                            {scanResult.action === 'check_in' ? 'BAŞLAT' : 'BİTİR'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Error Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={errorModalVisible}
                onRequestClose={closeErrorModal}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { borderTopWidth: 4, borderTopColor: Colors.error }]}>
                        {errorResult && (
                            <>
                                <View style={styles.modalHeader}>
                                    <XCircle size={56} color={Colors.error} />
                                    <Text style={[styles.modalTitle, { color: Colors.error }]}>{errorResult.title}</Text>
                                </View>
                                
                                <View style={styles.modalBody}>
                                    <Text style={[styles.infoText, { textAlign: 'center', marginBottom: 10 }]}>
                                        {errorResult.message}
                                    </Text>
                                    <View style={{ height: 1, backgroundColor: Colors.border, width: '100%', marginVertical: 10 }} />
                                    <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }}>
                                        Lütfen geçerli bir işlem yapınız
                                    </Text>
                                </View>
                                
                                <View style={styles.modalFooter}>
                                    <TouchableOpacity 
                                        style={[styles.btn, { backgroundColor: Colors.error }]}
                                        onPress={closeErrorModal}
                                    >
                                        <Text style={styles.btnTextConfirm}>Tamam</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    message: { textAlign: 'center', paddingBottom: 10, color: Colors.textPrimary },
    overlay: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    iconBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE, backgroundColor: 'transparent', position: 'relative' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.primary, borderWidth: 4 },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    scanText: { color: 'white', marginTop: 20, fontSize: 16, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, overflow: 'hidden' },
    footer: { padding: 40, alignItems: 'center' },
    resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    resetText: { color: 'white', fontWeight: 'bold' },
    
    // Modal Styles
    centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.8)' },
    modalView: { margin: 20, backgroundColor: Colors.background, borderRadius: 20, padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '85%' },
    modalHeader: { alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 12 },
    modalBody: { width: '100%', marginBottom: 24 },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 8 },
    infoText: { color: Colors.textSecondary, fontSize: 16, lineHeight: 22 },
    statusBox: { padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
    statusMsg: { fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
    modalFooter: { flexDirection: 'row', width: '100%', gap: 12 },
    btn: { flex: 1, borderRadius: 12, padding: 16, elevation: 2, alignItems: 'center' },
    btnCancel: { backgroundColor: Colors.surface },
    btnConfirm: { backgroundColor: Colors.primary },
    btnTextCancel: { color: Colors.textSecondary, fontWeight: "bold" },
    btnTextConfirm: { color: "white", fontWeight: "bold" }
});
