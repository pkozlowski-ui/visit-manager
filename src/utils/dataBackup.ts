/**
 * Data Backup Utilities
 * Export/Import all LocalStorage data for visit-manager app
 */

export interface BackupData {
    version: string;
    timestamp: string;
    data: {
        clients: unknown[];
        visits: unknown[];
        services: unknown[];
        specialists: unknown[];
        salonSchedule: unknown;
        specialClosures: unknown[];
        theme: string;
        language: string;
    };
}

const STORAGE_KEYS = {
    clients: 'visit-manager-clients',
    visits: 'visit-manager-visits',
    services: 'visit-manager-services',
    specialists: 'visit-manager-specialists',
    salonSchedule: 'visit-manager-salon-schedule',
    specialClosures: 'visit-manager-special-closures',
    theme: 'visit-manager-theme',
    language: 'i18nextLng',
};

/**
 * Export all data from LocalStorage as JSON
 */
export function exportData(): BackupData {
    const backup: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
            clients: [],
            visits: [],
            services: [],
            specialists: [],
            salonSchedule: null,
            specialClosures: [],
            theme: 'light',
            language: 'en',
        },
    };

    // Export each data type
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                backup.data[key as keyof typeof backup.data] = JSON.parse(stored);
            }
        } catch (error) {
            console.error(`Failed to export ${key}:`, error);
        }
    });

    return backup;
}

/**
 * Download backup data as JSON file
 */
export function downloadBackup(): void {
    const backup = exportData();
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `visit-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import data from backup file
 */
export function importData(backup: BackupData): { success: boolean; error?: string } {
    try {
        // Validate backup structure
        if (!backup.version || !backup.data) {
            return { success: false, error: 'Invalid backup file format' };
        }

        // Import each data type
        Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
            const data = backup.data[key as keyof typeof backup.data];
            if (data !== null && data !== undefined) {
                localStorage.setItem(storageKey, JSON.stringify(data));
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to import data:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Clear all app data from LocalStorage
 */
export function clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(storageKey => {
        localStorage.removeItem(storageKey);
    });
}

/**
 * Get backup statistics
 */
export function getBackupStats(): {
    clients: number;
    visits: number;
    services: number;
    specialists: number;
} {
    const backup = exportData();
    return {
        clients: backup.data.clients?.length || 0,
        visits: backup.data.visits?.length || 0,
        services: backup.data.services?.length || 0,
        specialists: backup.data.specialists?.length || 0,
    };
}
