import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { assignedPatients } from "../../data/cuidadorMock.ts";
import type { AssignedPatient } from "../../data/cuidadorMock.ts";
import { Plus } from "lucide-react";

export default function CuidadorDataEntry() {
  const [newMeasurement, setNewMeasurement] = useState({
    patientId: "",
    type: "",
    value: "",
    notes: "",
  });

  const handleAddMeasurement = () => {
    console.log("Adding measurement:", newMeasurement);
    setNewMeasurement({ patientId: "", type: "", value: "", notes: "" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Record Patient Data</CardTitle>
          <CardDescription>Enter health measurements on behalf of your patients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Patient</label>
              <Select
                value={newMeasurement.patientId}
                onValueChange={(value: string) =>
                  setNewMeasurement({ ...newMeasurement, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPatients.map((p: AssignedPatient) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Measurement Type</label>
              <Select
                value={newMeasurement.type}
                onValueChange={(value: string) =>
                  setNewMeasurement({ ...newMeasurement, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="oxygen">Oxygen Level</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Value</label>
            <Input
              placeholder="Enter measurement value"
              value={newMeasurement.value}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, value: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              placeholder="Additional notes or observations"
              value={newMeasurement.notes}
              onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
            />
          </div>

          <Button
            onClick={handleAddMeasurement}
            className="w-full"
            disabled={!newMeasurement.patientId || !newMeasurement.type || !newMeasurement.value}
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Measurement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Data Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { patient: "Eleanor Smith", type: "Blood Sugar",   value: "140 mg/dL", time: "1 hour ago" },
              { patient: "Robert Johnson", type: "Blood Pressure", value: "160/95",  time: "2 hours ago" },
              { patient: "Mary Wilson",    type: "Temperature",    value: "98.6°F",  time: "3 hours ago" },
            ].map((entry, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{entry.patient}</h4>
                  <p className="text-sm text-gray-600">{entry.type}: {entry.value}</p>
                </div>
                <p className="text-sm text-gray-500">{entry.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
