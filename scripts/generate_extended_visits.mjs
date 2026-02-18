#!/usr/bin/env node
/**
 * Generate extended visit data from Apr 18 to Dec 31, 2026.
 * 3-4 visits per specialist per day, matching existing data format.
 * 
 * Usage: node scripts/generate_extended_visits.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'src', 'data', 'dummy_data.json');

// --- Config ---
const SPECIALISTS = ['1', '2', '3'];
const CLIENT_IDS = Array.from({ length: 65 }, (_, i) => `c_${i}`);
const SERVICES = [
    { id: 's1', name: 'Strzyżenie Męskie', durations: [30, 45] },
    { id: 's2', name: 'Strzyżenie Damskie', durations: [45, 60] },
    { id: 's3', name: 'Koloryzacja + Strzyżenie', durations: [120, 150, 180] },
    { id: 's4', name: 'Balayage', durations: [180, 240] },
    { id: 's5', name: 'Modelowanie', durations: [30, 45] },
    { id: 's6', name: 'Pielęgnacja Premium', durations: [60, 90] },
    { id: 's7', name: 'Trwała Ondulacja', durations: [120, 150, 180] },
];

const CLIENT_NAMES = [
    'Agnieszka Wójcik', 'Anna Nowak', 'Jakub Woźniak', 'Adam Kowalczyk',
    'Małgorzata Kowalczyk', 'Adam Lewandowski', 'Katarzyna Wiśniewski',
    'Katarzyna Wójcik', 'Marcin Kowalczyk', 'Katarzyna Kowalczyk',
    'Marek Wiśniewski', 'Elżbieta Nowak', 'Jan Nowak', 'Marcin Lewandowski',
    'Monika Lewandowski', 'Barbara Nowak', 'Ewa Szymański', 'Adam Woźniak',
    'Ewa Wójcik', 'Ewa Szymański', 'Ewa Kowalczyk', 'Marek Kowalczyk',
    'Maria Wiśniewski', 'Piotr Lewandowski', 'Adam Kamiński', 'Paweł Szymański',
    'Barbara Wójcik', 'Anna Nowak', 'Barbara Zieliński', 'Maria Wójcik',
    'Jan Kowalski', 'Marek Kowalczyk', 'Marcin Wójcik', 'Piotr Kamiński',
    'Adam Nowak', 'Piotr Woźniak', 'Adam Wójcik', 'Michał Woźniak',
    'Anna Nowak', 'Anna Zieliński', 'Monika Szymański', 'Ewa Kowalczyk',
    'Krzysztof Wójcik', 'Monika Kowalski', 'Maria Wiśniewski', 'Monika Wójcik',
    'Michał Woźniak', 'Jakub Kowalczyk', 'Adam Woźniak', 'Piotr Kamiński',
    'Piotr Wiśniewski', 'Paweł Szymański', 'Maria Wójcik', 'Katarzyna Zieliński',
    'Monika Kowalczyk', 'Michał Szymański', 'Piotr Woźniak', 'Elżbieta Lewandowski',
    'Ewa Wiśniewski', 'Krystyna Nowak', 'Jakub Kowalski', 'Elżbieta Nowak',
    'Piotr Szymański', 'Paweł Wójcik', 'Katarzyna Nowak',
];

const PHONES = Array.from({ length: 65 }, () => {
    const num = Math.floor(500000000 + Math.random() * 400000000);
    return `+48 ${String(num).slice(0, 3)} ${String(num).slice(3, 6)} ${String(num).slice(6, 9)}`;
});

// --- Helpers ---
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function isWeekday(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6; // skip Sat/Sun
}

function generateVisitsForDay(date, dayIndex) {
    const visits = [];

    for (const specId of SPECIALISTS) {
        const visitCount = randInt(3, 4);
        let currentMinutes = randInt(0, 15) + 8 * 60; // Start 08:00-08:15

        for (let v = 0; v < visitCount; v++) {
            const service = rand(SERVICES);
            const duration = rand(service.durations);
            const clientIdx = randInt(0, CLIENT_IDS.length - 1);

            const startDate = new Date(date);
            startDate.setUTCHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

            const endMinutes = currentMinutes + duration;
            const endDate = new Date(date);
            endDate.setUTCHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

            // Don't go past 18:00
            if (endMinutes > 18 * 60) break;

            const isConfirmed = Math.random() > 0.1; // 90% confirmed

            visits.push({
                id: `v_ext_${dayIndex}_${specId}_${v}`,
                specialistId: specId,
                clientId: CLIENT_IDS[clientIdx],
                clientName: CLIENT_NAMES[clientIdx],
                clientPhone: PHONES[clientIdx],
                serviceDescription: service.name,
                serviceId: service.id,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                status: isConfirmed ? 'confirmed' : 'cancelled',
                isConfirmed,
            });

            // Gap between visits: 5-20 minutes
            currentMinutes = endMinutes + randInt(5, 20);
        }
    }

    return visits;
}

// --- Main ---
console.log('Reading existing data...');
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
const existingCount = data.data.visits.length;

console.log(`Existing visits: ${existingCount}`);

const startDate = new Date('2026-04-18T00:00:00.000Z');
const endDate = new Date('2026-12-31T00:00:00.000Z');

const newVisits = [];
let dayIndex = 0;
const current = new Date(startDate);

while (current <= endDate) {
    if (isWeekday(current)) {
        const dayVisits = generateVisitsForDay(new Date(current), dayIndex);
        newVisits.push(...dayVisits);
        dayIndex++;
    }
    current.setDate(current.getDate() + 1);
}

console.log(`Generated ${newVisits.length} new visits across ${dayIndex} weekdays`);
console.log(`Total visits: ${existingCount + newVisits.length}`);

data.data.visits.push(...newVisits);
data.timestamp = new Date().toISOString();

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
console.log('✅ Written to dummy_data.json');
