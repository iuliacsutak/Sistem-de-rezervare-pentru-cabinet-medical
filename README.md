# Sistem de Rezervare pentru Cabinet Medical

Aplicație web completă pentru gestiunea și programarea online a consultațiilor într-un cabinet medical, realizată ca proiect universitar.

---

## 🚀 Tehnologii Utilizate

- **Frontend & Backend**: Next.js 16 (App Router, Server & Client Components)
- **Limbaj**: TypeScript
- **Bază de Date**: MongoDB Local (`mongodb://127.0.0.1:27017/cabinet_medical`)
- **ODM**: Mongoose cu scheme și indexări pentru verificarea disponibilității
- **Autentificare & Securitate**: JWT semnat cu `jose`, stocat în Cookies `HTTP-only`, parole hash-uite cu `bcryptjs`
- **Stilizare**: Tailwind CSS
- **Iconografie**: Lucide React

---

## 👥 Cele 3 Portaluri de Autentificare și Roluri

Conform cerințelor de proiect, aplicația dispune de 3 fluxuri dedicate de acces:

### 1. Portal Pacienți (`/auth/pacient/login` și `/auth/pacient/register`)
- Înregistrare cont nou pacient și autentificare securizată
- Panou de control (`/dashboard/pacient`)
- Rezervare pas-cu-pas (`/dashboard/pacient/programeaza`):
  1. Selectare Specialitate (Cardiologie, Dermatologie, Pediatrie, etc.)
  2. Selectare Medic
  3. Selectare Serviciu medical (afișare tarif și durată)
  4. Selectare dată din calendar
  5. **Verificare sloturi orare libere în timp real** (orele ocupate sau trecute sunt dezactivate)
  6. Confirmare automată fără suprapuneri
- Istoric programări și posibilitate de anulare

### 2. Portal Medici (`/auth/medic/login`)
- Autentificare dedicată cadrelor medicale
- Panou de control (`/dashboard/medic`):
  - Agendă consultații (Azi / Viitoare)
  - Filtrare după status (Toate, Confirmate, Finalizate, Anulate)
  - Finalizare consultație cu consemnare **Diagnostic și Recomandări Medicale**
  - Posibilitate de anulare consultație
- Configurare program de lucru săptămânal (`/dashboard/medic/orar`):
  - Setare zile lucrătoare, ore de start/sfârșit și durata unei consultații (ex. 30 min)

### 3. Portal Administrator (`/auth/admin/login`)
- Autentificare securizată pentru conducerea cabinetului
- Panou de control (`/dashboard/admin`):
  - Indicatori cheie: număr total pacienți, medici, programări și încasări estimate
- Gestiune medici (`/dashboard/admin/medici`):
  - Adăugare medic nou (creează automat cont de utilizator și profil asociat)
- Gestiune servicii și specializări (`/dashboard/admin/servicii`):
  - Adăugare secție / specialitate clinică
  - Adăugare serviciu medical cu preț și timp alocat
  - Ștergere servicii
- Registru global programări (`/dashboard/admin/programari`):
  - Monitorizare, căutare și schimbare manuală de status
- **Jurnal & Audit Sistem - Logging Concret pe Toate Rutele (`/dashboard/admin/loguri`)**:
  - Vizualizare în timp real a tuturor cererilor HTTP, evenimentelor de autentificare, rezervărilor și erorilor
  - Filtrare pe nivele de log: `HTTP`, `AUTH`, `PROGRAMARE`, `ADMIN`, `ERROR`
  - Auto-refresh la fiecare 5 secunde și posibilitate de curățare
- Buton de re-populare / resetare a bazei de date cu un singur click

---

## 🔑 Conturi de Test Predefinite (Gata de prezentare)

Pentru susținerea proiectului la facultate, baza de date conține conturi demonstrative gata populate:

| Rol | Email | Parolă | Detalii |
|---|---|---|---|
| **Administrator** | `admin@cabinet.ro` | `admin123` | Acces complet la toate modulele |
| **Medic Cardiolog** | `andrei.ionescu@cabinet.ro` | `medic123` | Dr. Andrei Ionescu (Cabinet 101) |
| **Medic Dermatolog** | `elena.popa@cabinet.ro` | `medic123` | Dr. Elena Popa (Cabinet 102) |
| **Medic Pediatru** | `radu.vasilescu@cabinet.ro` | `medic123` | Dr. Radu Vasilescu (Cabinet 201) |
| **Medic Oftalmolog** | `maria.dumitrescu@cabinet.ro` | `medic123` | Dr. Maria Dumitrescu (Cabinet 202) |
| **Pacient** | `pacient@test.ro` | `pacient123` | Ion Popescu |

> **Notă:** Fiecare pagină de autentificare include un banner cu butonul **„Completează”**, care populează instant câmpurile cu datele de test!

---

## 🛠️ Comenzi Disponibile

### 1. Pornire Server de Dezvoltare
```bash
npm run dev
```
Aplicația va fi accesibilă la adresa: [http://localhost:3000](http://localhost:3000)

### 2. Populare / Resetare Bază de Date (CLI)
```bash
npm run seed
```

### 3. Compilare pentru Producție
```bash
npm run build
npm start
```

---

## 📁 Structura Proiectului

```
src/
├── app/
│   ├── api/                     # Endpoint-uri REST
│   │   ├── auth/                # Login, Register, Logout, Me
│   │   ├── medici/              # CRUD medici & calcul sloturi libere
│   │   ├── programari/          # Rezervare, istoric, actualizare status
│   │   ├── seed/                # Inițializare bază de date via HTTP
│   │   ├── servicii/            # Nomenclator servicii
│   │   ├── specializari/        # Specialități medicale
│   │   └── statistici/          # Date pentru panoul de admin
│   ├── auth/                    # Paginile dedicate de autentificare
│   │   ├── pacient/login & register
│   │   ├── medic/login
│   │   └── admin/login
│   ├── dashboard/               # Panouri de control protejate pe roluri
│   │   ├── pacient/ & pacient/programeaza/
│   │   ├── medic/ & medic/orar/
│   │   └── admin/ & admin/medici/ & admin/servicii/ & admin/programari/
│   ├── layout.tsx & globals.css
│   └── page.tsx                 # Pagina principală (Landing page public)
├── components/
│   ├── Navbar.tsx               # Bară de navigare responsive cu comutare portaluri
│   └── Footer.tsx               # Subsol cu date de contact și informații proiect
├── lib/
│   ├── auth.ts                  # Utilitare JWT & Bcrypt
│   ├── mongodb.ts               # Conexiune Mongoose singleton
│   ├── seed.ts                  # Logică populare inițială
│   └── types.ts                 # Interfețe TypeScript
├── middleware.ts                # Protecție rute pe baza rolului
└── models/
    ├── Appointment.ts
    ├── Doctor.ts
    ├── Service.ts
    ├── Specialization.ts
    └── User.ts
```
