import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

export default function CuidadorPreferencias() {
  const [notificationSettings, setNotificationSettings] = useState({
    criticalAlerts: true,
    medicationReminders: true,
    appointmentReminders: true,
    dailyReports: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Configure which alerts and notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Critical Alerts</h4>
            <p className="text-sm text-gray-600">Immediate notifications for critical patient conditions</p>
          </div>
          <Switch
            checked={notificationSettings.criticalAlerts}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, criticalAlerts: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Medication Reminders</h4>
            <p className="text-sm text-gray-600">Alerts when patients miss medications</p>
          </div>
          <Switch
            checked={notificationSettings.medicationReminders}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, medicationReminders: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Appointment Reminders</h4>
            <p className="text-sm text-gray-600">Upcoming appointment notifications</p>
          </div>
          <Switch
            checked={notificationSettings.appointmentReminders}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Daily Reports</h4>
            <p className="text-sm text-gray-600">Daily summary of patient activities</p>
          </div>
          <Switch
            checked={notificationSettings.dailyReports}
            onCheckedChange={(checked: boolean) =>
              setNotificationSettings({ ...notificationSettings, dailyReports: checked })
            }
          />
        </div>

        <Button className="w-full mt-4">Save Preferences</Button>
      </CardContent>
    </Card>
  );
}
