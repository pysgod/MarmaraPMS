---
description: Marmara-PMS Altın Kurallar - Bu dosyayı her komutta mutlaka oku ve bu kurallara uy
---

# 🏆 MARMARA-PMS ALTIN KURALLAR

> **⚠️ ZORUNLU:** Bu dosya her işlem öncesi okunmalı ve tüm kurallara uyulmalıdır.

---

## 📊 VERİTABANI İLİŞKİLERİ

### Hiyerarşi (Büyükanne → Anne → Çocuk)

```
Company (Firma) - Büyükanne
    ├── Project (Proje) - Firma'ya bağlı
    ├── Employee (Personel) - Firma'ya atanabilir
    ├── Patrol (Devriye) - Firma'ya bağlı
    └── ShiftDefinition (Vardiya Tanımı) - Firma'ya bağlı
```

### Ana Model İlişkileri

| Parent Model | Child Model | İlişki Türü | Foreign Key |
|--------------|-------------|-------------|-------------|
| Company | Employee | 1:N (hasMany) | `company_id` (nullable) |
| Company | Project | 1:N (hasMany) | `company_id` (required) |
| Company | Patrol | 1:N (hasMany) | `company_id` |
| Company | ShiftDefinition | 1:N (hasMany) | `company_id` |
| Project | Patrol | 1:N (hasMany) | `project_id` |
| Project | ShiftAssignment | 1:N (hasMany) | `project_id` |
| Project ↔ Employee | ProjectEmployee | N:M (Many-to-Many) | `project_id`, `employee_id` |
| ShiftDefinition | ShiftAssignment | 1:N (hasMany) | `shift_id` |
| Employee | ShiftAssignment | 1:N (hasMany) | `employee_id` |
| Employee | EmployeeHistory | 1:N (hasMany) | `employee_id` |

---

## 👥 PERSONEL YÖNETİMİ KURALLARI

### 1. Personel Atama Durumları (assignment_status)
```javascript
'idle'                  // Boşta - Hiçbir firmaya atanmamış
'assigned_to_company'   // Firmaya atanmış
'assigned_to_project'   // Projeye atanmış
```

### 2. Personel Akışı
```
1. Personel BOŞTA oluşturulur (company_id = null, assignment_status = 'idle')
2. Personel → Firmaya Atanır (company_id = X, assignment_status = 'assigned_to_company')
3. Personel → Projeye Atanır (ProjectEmployee kaydı, assignment_status = 'assigned_to_project')
```

### 3. Kritik Kurallar
- ❌ Personel DOĞRUDAN projeye atanamaz (önce firmaya atanmalı)
- ❌ Firmadan çıkarılan personel otomatik olarak TÜM projelerden de çıkar
- ✅ TC No sisteme özel UNIQUE (firma bağımsız)
- ✅ Her atama/çıkarma EmployeeHistory'e kayıt düşer

### 4. EmployeeHistory Aksiyonları
```javascript
'assigned_to_company'     // Firmaya atandı
'removed_from_company'    // Firmadan çıkarıldı
'assigned_to_project'     // Projeye atandı
'removed_from_project'    // Projeden çıkarıldı
```

---

## 🕐 VARDİYA SİSTEMİ KURALLARI

### 1. Vardiya Tanımları (ShiftDefinition)
- Vardiyalar **FİRMA** bazında tanımlanır
- Projeler kendi vardiya tanımı YARATAMAZ
- Her vardiya: `name`, `start_time`, `end_time`, `break_duration`

### 2. Vardiya Atamaları (ShiftAssignment)
- Bir personel, bir projede SADECE BİR vardiyaya atanabilir
- UNIQUE constraint: `(project_id, employee_id)`
- Personel projeden çıkarılırsa, vardiya ataması da SİLİNMELİ

---

## 🏢 FİRMA VE PROJE KURALLARI

### Company (Firma)
| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `name` | ✅ | Firma adı |
| `company_code` | ✅ | Benzersiz firma kodu |
| `status` | - | 'active', 'passive', 'archived' |
| `country`, `city`, `district` | - | Lokasyon bilgileri |

### Project (Proje)
| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `company_id` | ✅ | Bağlı olduğu firma |
| `name` | ✅ | Proje adı |
| `status` | - | 'active', 'pending', 'completed', 'cancelled' |
| `service_type` | - | Hizmet türü ENUM |

---

## 🔒 SİLME İŞLEMLERİ

### CASCADE Kuralları
| Silinen | Etkilenen |
|---------|-----------|
| Firma silinirse | Projeler, Personeller, Vardiya tanımları |
| Proje silinirse | ProjectEmployee, ShiftAssignment, Patrol |
| Personel silinirse | ProjectEmployee, ShiftAssignment, EmployeeHistory |
| Vardiya tanımı silinirse | ShiftAssignment kayıtları |

### Onay Gerektiren İşlemler
- ⚠️ Firma silme
- ⚠️ Proje silme
- ⚠️ Personeli firmadan çıkarma
- ⚠️ Toplu silme işlemleri

---

## 🔧 TEKNİK KURALLAR

### Backend
- Port: **3001**
- Database: PostgreSQL
- ORM: Sequelize
- Sync: `alter: true` (ASLA `force: true` kullanma!)

### Frontend
- Port: **5173** (Vite)
- Framework: React
- State: AppContext
- API Base: `/api`

### Veritabanı Senkronizasyonu
```javascript
// ✅ DOĞRU - Veri korunur
sequelize.sync({ alter: true })

// ❌ YANLIŞ - Tüm veriler silinir!
sequelize.sync({ force: true })
```

---

## 📝 API ENDPOINT YAPISI

### Temel Yapı
```
GET    /api/[resource]           - Liste
GET    /api/[resource]/:id       - Detay
POST   /api/[resource]           - Oluştur
PUT    /api/[resource]/:id       - Güncelle
DELETE /api/[resource]/:id       - Sil
```

### Personel Özel Endpoint'ler
```
PUT    /api/employees/:id/assign-company     - Firmaya ata
PUT    /api/employees/:id/unassign-company   - Firmadan çıkar
GET    /api/employees?status=idle            - Boşta personeller
GET    /api/employees?companyId=X           - Firma personelleri
```

---

## ✅ YAPILMASI GEREKENLER (DO)

1. Her değişiklikten önce mevcut veriyi koru
2. İlişkili kayıtları kontrol et (cascade etkileri)
3. EmployeeHistory'e tüm personel hareketlerini kaydet
4. Silme işlemlerinde onay modal'ı göster
5. API hatalarını uygun şekilde yakala ve göster
6. Frontend'de loading state'leri kullan

## ❌ YAPILMAMASI GEREKENLER (DON'T)

1. `force: true` ile veritabanı senkronizasyonu yapma
2. Personeli doğrudan projeye atama (önce firmaya ata)
3. İlişkili kayıtlar varken parent kaydı silme
4. TC No'yu firma bazlı unique yapma (sisteme özel olmalı)
5. Vardiya tanımlarını proje bazında oluşturma (firma bazlı)
6. Onaysız silme işlemi yapma

---

