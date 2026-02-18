import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONSTANTS ---
const SPECIALISTS = [
    { id: '1', name: 'Anna', role: 'Stylist', color: '#E11D48' }, // Brand Red
    { id: '2', name: 'Marta', role: 'Junior', color: '#0F172A' }, // Slate 900
    { id: '3', name: 'Kasia', role: 'Manager', color: '#3B82F6' }, // Info Blue
];

const SERVICES = [
    { id: 's1', name: 'Strzyżenie Męskie', durationMinutes: 30, price: 50, color: '#D6BCFA' },
    { id: 's2', name: 'Strzyżenie Damskie', durationMinutes: 60, price: 100, color: '#9AE6B4' },
    { id: 's3', name: 'Koloryzacja + Strzyżenie', durationMinutes: 150, price: 350, color: '#FBD38D' },
    { id: 's4', name: 'Balayage', durationMinutes: 240, price: 500, color: '#E9D8FD' },
    { id: 's5', name: 'Modelowanie', durationMinutes: 45, price: 80, color: '#FEEBC8' },
    { id: 's6', name: 'Pielęgnacja Premium', durationMinutes: 90, price: 180, color: '#BEE3F8' },
    { id: 's7', name: 'Trwała Ondulacja', durationMinutes: 180, price: 400, color: '#FED7E2' },
];

const FIRST_NAMES_MALE = ['Marek', 'Piotr', 'Tomasz', 'Jan', 'Paweł', 'Michał', 'Adam', 'Krzysztof', 'Marcin', 'Jakub'];
const FIRST_NAMES_FEMALE = ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Krystyna', 'Elżbieta', 'Monika'];
const LAST_NAMES = ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak'];

// --- HELPERS ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateClients(count) {
    const clients = [];
    for (let i = 0; i < count; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? randomElement(FIRST_NAMES_MALE) : randomElement(FIRST_NAMES_FEMALE);
        const lastName = randomElement(LAST_NAMES);

        clients.push({
            id: `c_${i}`,
            name: `${firstName} ${lastName}`,
            phone: `+48 ${randomInt(500, 899)} ${randomInt(100, 999)} ${randomInt(100, 999)}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            notes: Math.random() > 0.7 ? 'Preferuje kawę z mlekiem' : '',
            createdAt: new Date().toISOString()
        });
    }
    return clients;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

// --- MAIN GENERATION ---
function generateData() {
    const clients = generateClients(65);
    const visits = [];

    // Generate for next 60 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);

        // Skip Sundays (0)
        if (currentDate.getDay() === 0) continue;

        SPECIALISTS.forEach(spec => {
            // At least 6 visits per day
            const targetVisits = 6;
            let currentHour = 8;
            let currentMinute = 0;
            let visitsCount = 0;

            // Simple loop to try and fit at least 6 visits
            while (visitsCount < targetVisits || (currentHour < 18 && visitsCount < 12)) {
                // Determine slot start
                const gap = randomElement([0, 5, 10, 15]);

                const startTime = new Date(currentDate);
                startTime.setHours(currentHour, currentMinute, 0, 0);
                startTime.setMinutes(startTime.getMinutes() + gap);

                // Pick Service - weigh shorter ones if we are running out of time or need to hit the count
                let service;
                const timeLeft = (19 - startTime.getHours()) * 60 - startTime.getMinutes();

                if (visitsCount < targetVisits && timeLeft < 120) {
                    // If we need more visits and time is short, pick shorter ones
                    service = SERVICES.find(s => s.durationMinutes <= 30) || SERVICES[0];
                } else {
                    service = randomElement(SERVICES);
                }

                // Determine End Time
                const endTime = addMinutes(startTime, service.durationMinutes);

                // If this visit pushes us too far past 20:00, stop (unless we MUST have 6 visits)
                if (endTime.getHours() >= 20 && visitsCount >= targetVisits) break;

                // Pick Client (70% from DB, 30% Walk-in)
                const useExistingClient = Math.random() < 0.7;
                let clientName, clientId, clientPhone;

                if (useExistingClient) {
                    const client = randomElement(clients);
                    clientId = client.id;
                    clientName = client.name;
                    clientPhone = client.phone;
                } else {
                    const isMale = Math.random() > 0.5;
                    const firstName = isMale ? randomElement(FIRST_NAMES_MALE) : randomElement(FIRST_NAMES_FEMALE);
                    const lastName = randomElement(LAST_NAMES);
                    clientName = `${firstName} ${lastName}`;
                }

                visits.push({
                    id: `v_${dayOffset}_${spec.id}_${visitsCount}`,
                    specialistId: spec.id,
                    clientId: clientId,
                    clientName: clientName,
                    clientPhone: clientPhone,
                    serviceDescription: service.name,
                    serviceId: service.id,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    status: 'confirmed',
                    isConfirmed: true
                });

                // Update tracker for next visit
                currentHour = endTime.getHours();
                currentMinute = endTime.getMinutes();
                visitsCount++;

                // Hard stop at 21:00 just in case
                if (currentHour >= 21) break;
            }
        });
    }

    const backupData = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        data: {
            clients: clients,
            visits: visits,
            services: SERVICES,
            specialists: SPECIALISTS,
            salonSchedule: null,
            specialClosures: [],
            theme: "light",
            language: "en"
        }
    };

    fs.writeFileSync(path.join(__dirname, 'src/data/dummy_data.json'), JSON.stringify(backupData, null, 2));
    console.log(`Generated ${visits.length} visits across 60 days.`);
    console.log('Dummy data generated successfully!');
}

generateData();

