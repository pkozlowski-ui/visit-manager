import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    pl: {
        translation: {
            // Common
            "today": "Dziś",
            "calendar": "Kalendarz",
            "save": "Zapisz",
            "cancel": "Anuluj",
            "close": "Zamknij",
            "update": "Aktualizuj",
            "delete": "Usuń",
            "edit": "Edytuj",
            "add": "Dodaj",
            "confirm": "Potwierdź",
            "back": "Wróć",

            // Navigation
            "home": "Start",
            "clients": "Klienci",
            "settings": "Ustawienia",
            "stats": "Statystyki",

            // Stats
            "stats_title": "Statystyki",
            "stats_today": "Dziś",
            "stats_this_week": "Ten tydzień",
            "stats_this_month": "Ten miesiąc",
            "stats_cancelled": "Anulowane",
            "stats_visit_trend": "Trend wizyt",
            "stats_team_load": "Obciążenie zespołu",
            "stats_off_days": "Nadchodzące wolne",
            "stats_next_up": "Następne dziś",
            "stats_no_more_visits": "Brak kolejnych wizyt",
            "stats_no_off_days": "Brak nadchodzących wolnych",
            "stats_vs_last_week": "vs ost. tydzień",
            "stats_vs_last_month": "vs ost. miesiąc",
            "stats_week": "Tydzień",
            "stats_month": "Miesiąc",
            "stats_visits": "wizyt",

            // Visit Management
            "add_visit": "Dodaj wizytę",
            "new_visit": "Nowa wizyta",
            "edit_visit": "Edytuj wizytę",
            "visit_details": "Szczegóły wizyty",
            "client_name": "Imię i nazwisko klienta",
            "service_desc": "Opis usługi (np. strzyżenie)",
            "phone": "Telefon (opcjonalnie)",
            "time": "Godzina",
            "duration": "Czas trwania",
            "status": "Status",
            "confirmed": "Potwierdzona",
            "pending": "Oczekująca",
            "completed": "Zakończona",
            "cancelled": "Anulowana",
            "confirm_delete": "Czy na pewno chcesz usunąć tę wizytę?",
            "select_specialist": "Wybierz specjalistę",
            "select_service": "Wybierz usługę",
            "select_date": "Wybierz datę",
            "select_time": "Wybierz godzinę",
            "available_slots": "Dostępne terminy",
            "no_slots_available": "Brak dostępnych terminów",

            // Settings Tabs
            "services": "Usługi",
            "team": "Zespół",
            "hours": "Godziny otwarcia",
            "preferences": "Preferencje",

            // Services
            "service_name": "Nazwa usługi",
            "service_duration": "Czas trwania",
            "service_price": "Cena",
            "service_color": "Kolor",
            "new_service": "Nowa usługa",
            "edit_service": "Edytuj usługę",
            "add_service": "Dodaj usługę",
            "delete_service": "Usuń usługę",
            "min": "min",
            "hours_label": "godz",
            "hour": "godzina",

            // Team
            "specialist_name": "Imię i nazwisko",
            "specialist_role": "Stanowisko",
            "new_member": "Nowy członek zespołu",
            "edit_member": "Edytuj członka zespołu",
            "add_member": "Dodaj członka",
            "delete_member": "Usuń członka",
            "all_team": "Cały zespół",

            // Clients
            "client_email": "Email",
            "client_phone": "Telefon",
            "client_notes": "Notatki",
            "new_client": "Nowy klient",
            "edit_client": "Edytuj klienta",
            "add_client": "Dodaj klienta",
            "delete_client": "Usuń klienta",
            "total_visits": "Liczba wizyt",
            "last_visit": "Ostatnia wizyta",
            "search_clients": "Szukaj klientów...",

            // Hours
            "salon_hours": "Godziny pracy salonu",
            "opening_time": "Godzina otwarcia",
            "closing_time": "Godzina zamknięcia",
            "closed": "Zamknięte",
            "special_closures": "Dni wolne",
            "add_closure": "Dodaj dzień wolny",
            "closure_date": "Data",
            "closure_reason": "Powód",
            "monday": "Poniedziałek",
            "tuesday": "Wtorek",
            "wednesday": "Środa",
            "thursday": "Czwartek",
            "friday": "Piątek",
            "saturday": "Sobota",
            "sunday": "Niedziela",

            // Preferences
            "language": "Język",
            "theme": "Motyw",
            "light": "Jasny",
            "dark": "Ciemny",
            "device": "Systemowy",
            "currently_using": "Aktualnie używany",
            "mode": "tryb",

            // Time
            "am": "AM",
            "pm": "PM",

            // Settings Page
            "configuration": "Konfiguracja",
            "offerings": "Oferta",
            "staff": "Zespół",
            "opening_hours": "Godziny otwarcia",
            "schedule": "Harmonogram",
            "closures": "Dni wolne",
            "exceptions": "Wyjątki",
            "system": "System",
            "data": "Dane",
            "export": "Eksport",
            "import": "Import",
            "reset_data": "Wyczyść dane",
            "erase_warning": "⚠️ Usunąć WSZYSTKIE dane?",
            "no_dates": "Brak dat",
            "reason_placeholder": "POWÓD...",
            "service_name_placeholder": "NAZWA USŁUGI...",
            "name_placeholder": "IMIĘ...",
            "role_placeholder": "STANOWISKO...",
            "team_members": "Członkowie zespołu",
            "assigned_color": "Przypisany kolor",
            "exported": "✅ Wyeksportowano!",
            "export_failed": "❌ Nie udało się",
            "invalid_file": "Nieprawidłowy plik",

            // Messages
            "no_visits_today": "Brak wizyt na dziś",
            "loading": "Ładowanie...",
            "error": "Błąd",
            "success": "Sukces",
            "saved_successfully": "Zapisano pomyślnie",
            "deleted_successfully": "Usunięto pomyślnie",
        }
    },
    en: {
        translation: {
            // Common
            "today": "Today",
            "calendar": "Calendar",
            "save": "Save",
            "cancel": "Cancel",
            "close": "Close",
            "update": "Update",
            "delete": "Delete",
            "edit": "Edit",
            "add": "Add",
            "confirm": "Confirm",
            "back": "Back",

            // Navigation
            "home": "Home",
            "clients": "Clients",
            "settings": "Settings",
            "stats": "Stats",

            // Stats
            "stats_title": "Stats",
            "stats_today": "Today",
            "stats_this_week": "This Week",
            "stats_this_month": "This Month",
            "stats_cancelled": "Cancelled",
            "stats_visit_trend": "Visit Trend",
            "stats_team_load": "Team Load",
            "stats_off_days": "Upcoming Off Days",
            "stats_next_up": "Next Up Today",
            "stats_no_more_visits": "No more visits today",
            "stats_no_off_days": "No upcoming off days",
            "stats_vs_last_week": "vs last week",
            "stats_vs_last_month": "vs last month",
            "stats_week": "Week",
            "stats_month": "Month",
            "stats_visits": "visits",

            // Visit Management
            "add_visit": "Add Visit",
            "new_visit": "New Visit",
            "edit_visit": "Edit Visit",
            "visit_details": "Visit Details",
            "client_name": "Client Name",
            "service_desc": "Service Description",
            "phone": "Phone (optional)",
            "time": "Time",
            "duration": "Duration",
            "status": "Status",
            "confirmed": "Confirmed",
            "pending": "Pending",
            "completed": "Completed",
            "cancelled": "Cancelled",
            "confirm_delete": "Are you sure you want to delete this visit?",
            "select_specialist": "Select Specialist",
            "select_service": "Select Service",
            "select_date": "Select Date",
            "select_time": "Select Time",
            "available_slots": "Available Slots",
            "no_slots_available": "No available slots",

            // Settings Tabs
            "services": "Services",
            "team": "Team",
            "hours": "Hours",
            "preferences": "Preferences",

            // Services
            "service_name": "Service Name",
            "service_duration": "Duration",
            "service_price": "Price",
            "service_color": "Color",
            "new_service": "New Service",
            "edit_service": "Edit Service",
            "add_service": "Add Service",
            "delete_service": "Delete Service",
            "min": "min",
            "hours_label": "hrs",
            "hour": "hour",

            // Team
            "specialist_name": "Name",
            "specialist_role": "Role",
            "new_member": "New Team Member",
            "edit_member": "Edit Team Member",
            "add_member": "Add Member",
            "delete_member": "Delete Member",
            "all_team": "All Team",

            // Clients
            "client_email": "Email",
            "client_phone": "Phone",
            "client_notes": "Notes",
            "new_client": "New Client",
            "edit_client": "Edit Client",
            "add_client": "Add Client",
            "delete_client": "Delete Client",
            "total_visits": "Total Visits",
            "last_visit": "Last Visit",
            "search_clients": "Search clients...",

            // Hours
            "salon_hours": "Salon Hours",
            "opening_time": "Opening Time",
            "closing_time": "Closing Time",
            "closed": "Closed",
            "special_closures": "Special Closures",
            "add_closure": "Add Closure",
            "closure_date": "Date",
            "closure_reason": "Reason",
            "monday": "Monday",
            "tuesday": "Tuesday",
            "wednesday": "Wednesday",
            "thursday": "Thursday",
            "friday": "Friday",
            "saturday": "Saturday",
            "sunday": "Sunday",

            // Preferences
            "language": "Language",
            "theme": "Theme",
            "light": "Light",
            "dark": "Dark",
            "device": "Device",
            "currently_using": "Currently using",
            "mode": "mode",

            // Time
            "am": "AM",
            "pm": "PM",

            // Settings Page
            "configuration": "Configuration",
            "offerings": "Offerings",
            "staff": "Staff",
            "opening_hours": "Opening Hours",
            "schedule": "Schedule",
            "closures": "Closures",
            "exceptions": "Exceptions",
            "system": "System",
            "data": "Data",
            "export": "Export",
            "import": "Import",
            "reset_data": "Reset All Data",
            "erase_warning": "⚠️ Erase ALL data?",
            "no_dates": "No dates",
            "reason_placeholder": "REASON...",
            "service_name_placeholder": "SERVICE NAME...",
            "name_placeholder": "NAME...",
            "role_placeholder": "ROLE...",
            "team_members": "Team Members",
            "assigned_color": "Assigned Color",
            "exported": "✅ Exported!",
            "export_failed": "❌ Failed",
            "invalid_file": "Invalid file",

            // Messages
            "no_visits_today": "No visits today",
            "loading": "Loading...",
            "error": "Error",
            "success": "Success",
            "saved_successfully": "Saved successfully",
            "deleted_successfully": "Deleted successfully",
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // Default language
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
