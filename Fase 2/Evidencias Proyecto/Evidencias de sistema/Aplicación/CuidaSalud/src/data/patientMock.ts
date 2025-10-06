// src/data/patientMock.ts
export const recentMeasurements = [
  { date: '2024-01-20', bloodSugar: 120, bloodPressure: 120, oxygen: 98, temperature: 98.6 },
  { date: '2024-01-19', bloodSugar: 135, bloodPressure: 125, oxygen: 97, temperature: 99.1 },
  { date: '2024-01-18', bloodSugar: 110, bloodPressure: 118, oxygen: 99, temperature: 98.4 },
  { date: '2024-01-17', bloodSugar: 125, bloodPressure: 122, oxygen: 98, temperature: 98.8 },
  { date: '2024-01-16', bloodSugar: 140, bloodPressure: 130, oxygen: 96, temperature: 99.2 }
];

export const achievements = [
  { id: 1, title: 'Week Warrior', description: '7 days of consistent logging', icon: '🏆', earned: true },
  { id: 2, title: 'Health Hero', description: '30 days streak', icon: '⭐', earned: true },
  { id: 3, title: 'Perfect Week', description: 'All measurements in range', icon: '💯', earned: true },
  { id: 4, title: 'Early Bird', description: 'Log measurements before 9 AM', icon: '🌅', earned: false },
  { id: 5, title: 'Century Club', description: '100 total measurements', icon: '💪', earned: false }
];
