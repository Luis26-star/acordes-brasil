# 📊 Datenbankschema

## Übersicht

Das Projekt verwendet **Supabase** (PostgreSQL) als Backend.

## Tabellen

### `profiles`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel (verknüpft mit auth.users) |
| member_number | TEXT | Eindeutige Mitgliedsnummer |
| name | TEXT | Vollständiger Name |
| email | TEXT | E-Mail-Adresse |
| voice | TEXT | Stimmlage (soprano/contralto/tenor/baixo) |
| phone | TEXT | Telefonnummer |
| role | TEXT | Rolle (member/board/admin) |
| status | TEXT | Status (active/inactive) |

### `events`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| title | TEXT | Event-Titel |
| type | TEXT | Typ (ensaio/concerto/workshop) |
| start_time | TIMESTAMP | Beginn |
| end_time | TIMESTAMP | Ende |
| location | TEXT | Ort |
| description | TEXT | Beschreibung |

### `participations`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| member_id | UUID | FK zu profiles |
| event_id | UUID | FK zu events |
| status | TEXT | sim/nao/talvez |

### `fee_payments`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| member_id | UUID | FK zu profiles |
| amount | DECIMAL | Betrag |
| due_date | DATE | Fälligkeitsdatum |
| fee_year | INTEGER | Jahr |
| status | TEXT | pending/paid/overdue |

### `donations`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| date | DATE | Datum |
| donor_name | TEXT | Spendername |
| amount | DECIMAL | Betrag |
| purpose | TEXT | Verwendungszweck |

### `projects`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| title | TEXT | Projektname |
| status | TEXT | planning/active/completed |
| budget | DECIMAL | Budget |
| progress | INTEGER | Fortschritt (0-100) |

### `partners`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| name | TEXT | Name |
| type | TEXT | company/institution/individual |
| status | TEXT | inquiry/negotiation/active |
| level | TEXT | bronze/silber/gold/main |
| amount | DECIMAL | Sponsoringbetrag |

### `push_subscriptions`
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primärschlüssel |
| member_id | UUID | FK zu profiles |
| endpoint | TEXT | Push-Endpoint |
| p256dh | TEXT | Public Key |
| auth | TEXT | Auth Secret |
