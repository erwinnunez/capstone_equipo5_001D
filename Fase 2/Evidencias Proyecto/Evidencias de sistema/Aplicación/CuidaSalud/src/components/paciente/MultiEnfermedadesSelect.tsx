import { useRef, useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
const ENFERMEDADES_LIST = [
  "Hipertensión",
  "Diabetes",
  "Dislipidemia",
  "Obesidad",
  "Asma",
  "Enfermedad renal crónica",
  "Cáncer",
  "Otra"
];

export default function MultiEnfermedadesSelect({ value, onChange }: { value: string[]; onChange: (arr: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = () => setOpen(o => !o);
  const handleCheck = (enf: string) => {
    if (value.includes(enf)) onChange(value.filter(e => e !== enf));
    else onChange([...value, enf]);
  };
  const remove = (enf: string) => onChange(value.filter(e => e !== enf));

  return (
    <div ref={ref} className="relative">
      <button type="button" className="w-full border rounded px-3 py-2 bg-white text-sm text-left" onClick={toggle}>
        {value.length === 0 ? "Selecciona enfermedades" : value.join(", ")}
        <span className="float-right">▼</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow p-2 max-h-60 overflow-auto">
          {ENFERMEDADES_LIST.map(enf => (
            <label key={enf} className="flex items-center gap-2 py-1 cursor-pointer">
              <Checkbox checked={value.includes(enf)} onCheckedChange={() => handleCheck(enf)} />
              <span className="text-sm">{enf}</span>
            </label>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {[...new Set(value)].map(enf => (
            <span key={enf} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
              {enf}
              <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => remove(enf)} title="Quitar">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
