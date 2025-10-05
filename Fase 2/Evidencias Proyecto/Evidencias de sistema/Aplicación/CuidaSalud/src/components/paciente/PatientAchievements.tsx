// src/components/paciente/PatientAchievements.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { achievements } from '../../data/patientMock';

export default function PatientAchievements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Achievements</CardTitle>
        <CardDescription>Unlock badges by maintaining healthy habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && <Badge className="bg-green-100 text-green-800">Earned</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
