export type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Visit {
    id: string;
    specialistId?: string;
    clientId?: string; // Optional, links to Client
    clientName: string;
    clientPhone?: string;
    serviceIds?: string[]; // Multiple service IDs
    customTags?: string[]; // Custom service tags/names
    startTime: Date;
    endTime: Date;
    status: Status;
    isConfirmed: boolean;
}

export interface Service {
    id: string;
    name: string;
    color?: string; // Hex code for timeline
}

export interface TimeRange {
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
}

export interface DaySchedule {
    isOpen: boolean;
    hours: TimeRange[];
}

export interface WeeklySchedule {
    [key: string]: DaySchedule; // monday, tuesday, etc.
}

export interface SpecialClosure {
    date: string; // ISO date string
    reason: string;
}

export interface Specialist {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    color?: string;
    availabilityOverrides?: WeeklySchedule; // Monday to Sunday overrides
    offDays?: string[]; // Array of ISO date strings
}

export interface Client {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    notes?: string;
    createdAt: Date;
}
