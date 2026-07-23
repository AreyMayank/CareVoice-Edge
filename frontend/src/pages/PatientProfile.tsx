import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Heart, FileText, Save } from 'lucide-react';
import { Patient } from '../types';
import { api } from '../api/client';

export const PatientProfile: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<number>(78);
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadPatient() {
      try {
        const list = await api.getPatients();
        if (list.length > 0) {
          const p = list[0];
          setPatient(p);
          setFullName(p.full_name);
          setAge(p.age);
          setRoomNumber(p.room_number || '');
          setMedicalConditions(p.medical_conditions || '');
          setEmergencyContact(p.emergency_contact || '');
          setNotes(p.notes || '');
        }
      } catch (err) {
        console.error('Failed to load patient profile:', err);
      }
    }
    loadPatient();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updatePatient(patient.id, {
        full_name: fullName,
        age: Number(age),
        room_number: roomNumber,
        medical_conditions: medicalConditions,
        emergency_contact: emergencyContact,
        notes: notes,
      });
      setPatient(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Patient Profile & Health Details</h1>
          <p className="text-xs text-slate-400">Primary patient profile interacting with CareBot Edge Assistant</p>
        </div>
        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg animate-pulse">
            Profile Updated Successfully!
          </span>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center space-x-4 pb-5 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl gradient-bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
              {fullName.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{fullName || 'Patient Profile'}</h2>
              <p className="text-xs text-slate-400">Age: {age} • Room: {roomNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Full Name
              </label>
              <input
                id="input-patient-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Age</label>
              <input
                id="input-patient-age"
                type="number"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Room / Facility Location
              </label>
              <input
                id="input-patient-room"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                Emergency Contact Number
                <span className="ml-auto text-[10px] normal-case font-normal text-rose-400/90 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Auto API Call Target
                </span>
              </label>
              <input
                id="input-patient-contact"
                type="text"
                value={emergencyContact}
                placeholder="+1-555-019-2831"
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This designated phone number is automatically called via API when emergency mode is triggered.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Medical Conditions & Allergies
            </label>
            <textarea
              id="textarea-medical-conditions"
              rows={3}
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Caretaker Special Instructions & Voice Notes
            </label>
            <textarea
              id="textarea-patient-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              id="btn-save-patient-profile"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white gradient-bg-primary rounded-xl hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Update Patient Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
