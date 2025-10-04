import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function SOAPNoteForm() {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    date: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    subjective: '',
    objective: {
      vitals: '',
      physicalExam: '',
      labs: ''
    },
    assessment: '',
    plan: {
      diagnostic: '',
      therapeutic: '',
      followUp: ''
    }
  });

  const [generatedNote, setGeneratedNote] = useState('');

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateSOAPNote = () => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const note = `NOTA MÉDICA - FORMATO SOAP
==============================

DATOS DEL PACIENTE:
Nombre: ${formData.patientName}
Edad: ${formData.age} años
Fecha de consulta: ${currentDate}

MOTIVO DE CONSULTA:
${formData.chiefComplaint}

SUBJETIVO (S):
${formData.subjective}

OBJETIVO (O):
Signos Vitales: ${formData.objective.vitals}
Examen Físico: ${formData.objective.physicalExam}
Laboratorios/Estudios: ${formData.objective.labs || 'Pendientes'}

EVALUACIÓN/ASSESSMENT (A):
${formData.assessment}

PLAN (P):
1. Plan Diagnóstico:
${formData.plan.diagnostic}

2. Plan Terapéutico:
${formData.plan.therapeutic}

3. Seguimiento:
${formData.plan.followUp}

==============================
Médico: [NOMBRE DEL MÉDICO]
Registro: [NÚMERO DE REGISTRO]
Fecha: ${currentDate}
Firma: [FIRMA DIGITAL]

Nota: Esta consulta fue realizada mediante telemedicina. Se obtuvo consentimiento informado del paciente para la consulta remota.`;

    setGeneratedNote(note);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedNote);
    toast.success('Nota SOAP copiada al portapapeles');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="patientName">Nombre del Paciente</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => handleInputChange('patientName', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label htmlFor="age">Edad</Label>
            <Input
              id="age"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Años"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="chiefComplaint">Motivo de Consulta</Label>
          <Textarea
            id="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
            placeholder="Describe el motivo principal de la consulta"
            rows={2}
          />
        </div>

        {/* Subjective */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjetivo (S)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.subjective}
              onChange={(e) => handleInputChange('subjective', e.target.value)}
              placeholder="Historia actual, síntomas reportados por el paciente, antecedentes relevantes..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Objetivo (O)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vitals">Signos Vitales</Label>
              <Textarea
                id="vitals"
                value={formData.objective.vitals}
                onChange={(e) => handleInputChange('objective.vitals', e.target.value)}
                placeholder="TA: _/_  FC: _  FR: _  T: _°C  SAT O2: _%  Peso: _ kg  Talla: _ cm"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="physicalExam">Examen Físico</Label>
              <Textarea
                id="physicalExam"
                value={formData.objective.physicalExam}
                onChange={(e) => handleInputChange('objective.physicalExam', e.target.value)}
                placeholder="Hallazgos del examen físico por sistemas..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="labs">Laboratorios/Estudios</Label>
              <Textarea
                id="labs"
                value={formData.objective.labs}
                onChange={(e) => handleInputChange('objective.labs', e.target.value)}
                placeholder="Resultados de laboratorio, imágenes, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evaluación (A)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.assessment}
              onChange={(e) => handleInputChange('assessment', e.target.value)}
              placeholder="Impresión diagnóstica, diagnósticos diferenciales, evaluación del estado del paciente..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan (P)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="diagnostic">Plan Diagnóstico</Label>
              <Textarea
                id="diagnostic"
                value={formData.plan.diagnostic}
                onChange={(e) => handleInputChange('plan.diagnostic', e.target.value)}
                placeholder="Estudios adicionales requeridos, interconsultas..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="therapeutic">Plan Terapéutico</Label>
              <Textarea
                id="therapeutic"
                value={formData.plan.therapeutic}
                onChange={(e) => handleInputChange('plan.therapeutic', e.target.value)}
                placeholder="Medicamentos, dosis, vía, duración. Medidas no farmacológicas..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="followUp">Seguimiento</Label>
              <Textarea
                id="followUp"
                value={formData.plan.followUp}
                onChange={(e) => handleInputChange('plan.followUp', e.target.value)}
                placeholder="Próxima cita, criterios de reconsulta, educación al paciente..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={generateSOAPNote} className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Generar Nota SOAP
        </Button>
      </div>

      {/* Generated Note */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Nota Generada</h3>
          {generatedNote && (
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          )}
        </div>
        
        {generatedNote ? (
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {generatedNote}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>La nota SOAP aparecerá aquí una vez generada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}