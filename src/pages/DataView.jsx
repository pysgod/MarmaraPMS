import React, { useState, useEffect } from 'react';

const DataView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/data-view');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu: ' + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;
  if (!data) return <div>Veri bulunamadı.</div>;

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    section: {
      marginBottom: '40px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    th: {
      backgroundColor: '#474646ff',
      padding: '12px',
      borderBottom: '2px solid #ddd',
      textAlign: 'left'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #ddd'
    },
    h2: {
      color: '#333',
      borderBottom: '2px solid #333',
      paddingBottom: '10px'
    }
  };

  const renderTable = (items, columns) => {
    if (!items || items.length === 0) return <p>Veri yok.</p>;
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map(col => <th key={col.key} style={styles.th}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              {columns.map(col => (
                <td key={`${item.id}-${col.key}`} style={styles.td}>
                  {typeof item[col.key] === 'object' ? JSON.stringify(item[col.key]) : item[col.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.container}>
      <h1>Veritabanı Görünümü</h1>
      
      <div style={styles.section}>
        <h2 style={styles.h2}>Şirketler ({data.companies?.length})</h2>
        {renderTable(data.companies, [
          { key: 'name', label: 'Şirket Adı' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Durum' },
          { key: 'createdAt', label: 'Oluşturulma Tarihi' }
        ])}
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Projeler ({data.projects?.length})</h2>
        {renderTable(data.projects, [
          { key: 'name', label: 'Proje Adı' },
          { key: 'status', label: 'Durum' },
          { key: 'type', label: 'Tür' }
        ])}
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Personel ({data.personnel?.length})</h2>
        {renderTable(data.personnel, [
          { key: 'firstName', label: 'Ad' },
          { key: 'lastName', label: 'Soyad' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rol' }
        ])}
      </div>
      
      <div style={styles.section}>
        <h2 style={styles.h2}>Kullanıcılar ({data.users?.length})</h2>
        {renderTable(data.users, [
            { key: 'username', label: 'Kullanıcı Adı' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Rol' }
        ])}
      </div>

      <div style={styles.section}>
        <h2 style={styles.h2}>Devriyeler ({data.patrols?.length})</h2>
        {renderTable(data.patrols, [
            { key: 'status', label: 'Durum' },
            { key: 'timeRange', label: 'Zaman Aralığı' },
            { key: 'createdAt', label: 'Oluşturulma Tarihi' }
        ])}
      </div>

    </div>
  );
};

export default DataView;
