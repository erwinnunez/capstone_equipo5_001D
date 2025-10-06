// src/components/admin/AdminSettings.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function AdminSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>Configure system-wide settings and security policies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Require 2FA for all administrator accounts</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Session Timeout</h4>
              <p className="text-sm text-gray-600">Auto-logout users after inactivity</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Data Backup</h4>
              <p className="text-sm text-gray-600">Automated system backups</p>
            </div>
            <Select defaultValue="daily">
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Audit Logging</h4>
              <p className="text-sm text-gray-600">Log all system activities</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Button className="w-full">Save Configuration</Button>
      </CardContent>
    </Card>
  );
}
