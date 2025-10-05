// src/components/admin/AdminAudit.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { auditLogs } from "../../data/adminMock";

export default function AdminAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Audit Trail
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </CardTitle>
        <CardDescription>System activity and security events log</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-sm text-gray-600">{log.action}</span>
                </div>
                <p className="text-sm text-gray-500">{log.resource}</p>
              </div>
              <div className="text-sm text-gray-500">{log.timestamp}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
