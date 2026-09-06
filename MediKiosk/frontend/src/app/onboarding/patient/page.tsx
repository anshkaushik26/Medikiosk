'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '../../../lib/i18n-context';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { saveDraft, loadDraft, clearDraft } from '../../../lib/draft-storage';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AudioHelper } from '../../../components/common/AudioHelper';
import {
  User,
  HeartPulse,
  Pill,
  AlertTriangle,
  Users,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Activity,
  Check,
} from 'lucide-react';

type Step = 'PERSONAL' | 'CONDITIONS' | 'MEDICINES' | 'ALLERGIES' | 'FAMILY' | 'SURGERIES' | 'REVIEW';

interface ConditionItem {
  name: string;
  since: string;
  notes: string;
}

interface MedicineItem {
  name: string;
  dose: string;
  frequency: string;
  purpose: string;
}

interface AllergyItem {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
}

interface FamilyItem {
  relationship: 'Father' | 'Mother' | 'Sibling';
  condition: string;
  onset_age?: string;
}

interface SurgeryItem {
  procedure_name: string;
  year: string;
  hospital: string;
}

export default function PatientOnboardingInterviewPage() {
  const { t } = useTranslation();
  const { user, updatePatientProfile } = useAuth();
  const router = useRouter();

  // Current interview step
  const [currentStep, setCurrentStep] = useState<Step>('PERSONAL');

  // Step 1: Personal Details
  const [fullName, setFullName] = useState<string>(user?.patient_profile?.full_name || 'Ramesh Kumar');
  const [dob, setDob] = useState<string>(user?.patient_profile?.date_of_birth || '1958-05-15');
  const [gender, setGender] = useState<string>(user?.patient_profile?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState<string>(user?.patient_profile?.blood_group || 'B+');
  const [address, setAddress] = useState<string>(user?.patient_profile?.address || 'Sector 4, Rohini, New Delhi');
  const [emergencyContact, setEmergencyContact] = useState<string>(
    user?.patient_profile?.emergency_contact || '+91 98765 43211 (Son - Amit)'
  );

  // Step 2: Conditions
  const [hasNoConditions, setHasNoConditions] = useState<boolean>(false);
  const [conditions, setConditions] = useState<ConditionItem[]>([
    { name: 'Type 2 Diabetes Mellitus', since: '2021', notes: 'Managed with Metformin and diet' },
    { name: 'Essential Hypertension', since: '2019', notes: 'Monitored regularly' },
  ]);
  const [newConditionName, setNewConditionName] = useState<string>('');

  // Step 3: Daily Medicines
  const [hasNoMedicines, setHasNoMedicines] = useState<boolean>(false);
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: 'Metformin', dose: '500 mg', frequency: 'Twice daily after meals', purpose: 'Blood Sugar' },
    { name: 'Amlodipine', dose: '5 mg', frequency: 'Once daily morning', purpose: 'Blood Pressure' },
  ]);
  const [newMed, setNewMed] = useState<MedicineItem>({ name: '', dose: '', frequency: 'Once daily', purpose: '' });

  // Step 4: Allergies
  const [hasNoAllergies, setHasNoAllergies] = useState<boolean>(false);
  const [allergies, setAllergies] = useState<AllergyItem[]>([
    { allergen: 'Penicillin', severity: 'Moderate', reaction: 'Skin rash and itching' },
  ]);
  const [newAllergen, setNewAllergen] = useState<string>('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');

  // Step 5: Family Health History
  const [familyItems, setFamilyItems] = useState<FamilyItem[]>([
    { relationship: 'Father', condition: 'Heart Attack (CAD)', onset_age: 'Age 58' },
    { relationship: 'Mother', condition: 'Type 2 Diabetes', onset_age: 'Age 52' },
  ]);
  const [newFamilyRel, setNewFamilyRel] = useState<'Father' | 'Mother' | 'Sibling'>('Father');
  const [newFamilyCondition, setNewFamilyCondition] = useState<string>('');

  // Step 6: Past Surgeries
  const [hasNoSurgeries, setHasNoSurgeries] = useState<boolean>(false);
  const [surgeries, setSurgeries] = useState<SurgeryItem[]>([
    { procedure_name: 'Cataract Surgery (Right Eye)', year: '2022', hospital: 'City Eye Hospital, Delhi' },
  ]);
  const [newSurgeryName, setNewSurgeryName] = useState<string>('');
  const [newSurgeryYear, setNewSurgeryYear] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Common condition quick-select chips
  const commonConditions = [
    'Type 2 Diabetes',
    'Hypertension (High BP)',
    'Thyroid Disorder',
    'Bronchial Asthma',
    'Arthritis / Joint Pain',
    'Heart Disease',
    'High Cholesterol',
  ];

  // Common surgery quick-select chips
  const commonSurgeries = [
    'Appendectomy (Appendix)',
    'Cataract / Eye Surgery',
    'Gallbladder Removal',
    'Caesarean Section (C-Section)',
    'Knee / Hip Replacement',
    'Cardiac Stent / Angioplasty',
    'Hernia Repair',
  ];

  // Common drug allergy chips
  const commonAllergens = [
    'Penicillin / Amoxicillin',
    'Sulfa Drugs',
    'Aspirin / NSAIDs',
    'Paracetamol',
    'Peanuts / Nuts',
    'Dust / Pollen',
  ];

  // Steps definition for progress
  const stepsList = [
    { key: 'PERSONAL', label: '1. Personal Details' },
    { key: 'CONDITIONS', label: '2. Health Conditions' },
    { key: 'MEDICINES', label: '3. Medicines' },
    { key: 'ALLERGIES', label: '4. Allergies' },
    { key: 'FAMILY', label: '5. Family History' },
    { key: 'SURGERIES', label: '6. Past Surgeries' },
    { key: 'REVIEW', label: '7. Review & Confirm' },
  ];

  const currentStepIdx = stepsList.findIndex((s) => s.key === currentStep);
  const progressPercent = Math.round(((currentStepIdx + 1) / stepsList.length) * 100);

  // Handlers for adding items
  const addCondition = (name: string) => {
    if (!name.trim()) return;
    if (conditions.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setConditions([...conditions, { name, since: 'Recently', notes: '' }]);
    setHasNoConditions(false);
    setNewConditionName('');
  };

  const removeCondition = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const addMedicine = () => {
    if (!newMed.name.trim()) return;
    setMedicines([...medicines, { ...newMed }]);
    setHasNoMedicines(false);
    setNewMed({ name: '', dose: '', frequency: 'Once daily', purpose: '' });
  };

  const removeMedicine = (idx: number) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const addAllergy = (allergen: string) => {
    if (!allergen.trim()) return;
    if (allergies.some((a) => a.allergen.toLowerCase() === allergen.toLowerCase())) return;
    setAllergies([...allergies, { allergen, severity: newSeverity, reaction: 'Rash / Swelling' }]);
    setHasNoAllergies(false);
    setNewAllergen('');
  };

  const removeAllergy = (idx: number) => {
    setAllergies(allergies.filter((_, i) => i !== idx));
  };

  const addFamilyRecord = () => {
    if (!newFamilyCondition.trim()) return;
    setFamilyItems([...familyItems, { relationship: newFamilyRel, condition: newFamilyCondition }]);
    setNewFamilyCondition('');
  };

  const removeFamilyRecord = (idx: number) => {
    setFamilyItems(familyItems.filter((_, i) => i !== idx));
  };

  const addSurgery = (procName: string) => {
    if (!procName.trim()) return;
    if (surgeries.some((s) => s.procedure_name.toLowerCase() === procName.toLowerCase())) return;
    setSurgeries([...surgeries, { procedure_name: procName, year: newSurgeryYear || 'Past', hospital: '' }]);
    setHasNoSurgeries(false);
    setNewSurgeryName('');
    setNewSurgeryYear('');
  };

  const removeSurgery = (idx: number) => {
    setSurgeries(surgeries.filter((_, i) => i !== idx));
  };

  // Final submit: saves profile and generates structured records for all tabs
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Patient Profile
      await updatePatientProfile({
        full_name: fullName,
        date_of_birth: dob,
        gender: gender,
        blood_group: bloodGroup,
        address: address,
        emergency_contact: emergencyContact,
        onboarding_completed: true,
      });

      // 2. Persist Conditions
      if (!hasNoConditions) {
        for (const c of conditions) {
          try {
            await api.createCondition({
              condition_name: c.name,
              diagnosis_date: c.since.length === 4 ? `${c.since}-01-01` : undefined,
              notes: c.notes,
              status: 'Active',
            });
          } catch {
            // continue
          }
        }
      }

      // 3. Persist Medicines
      if (!hasNoMedicines) {
        for (const m of medicines) {
          try {
            await api.createMedication({
              medicine_name: m.name,
              dose: m.dose,
              frequency: m.frequency,
              purpose: m.purpose,
              status: 'Currently taking',
            });
          } catch {
            // continue
          }
        }
      }

      // 4. Persist Allergies
      if (!hasNoAllergies) {
        for (const a of allergies) {
          try {
            await api.createAllergy({
              allergen: a.allergen,
              severity: a.severity,
              reaction: a.reaction,
            });
          } catch {
            // continue
          }
        }
      }

      // 5. Persist Family History
      for (const f of familyItems) {
        try {
          await api.createFamily({
            relation: f.relationship,
            condition: f.condition,
            age_at_diagnosis: f.onset_age,
          });
        } catch {
          // continue
        }
      }

      // 6. Persist Surgeries
      if (!hasNoSurgeries) {
        for (const s of surgeries) {
          try {
            await api.createSurgery({
              procedure_name: s.procedure_name,
              surgery_date: s.year.length === 4 ? `${s.year}-01-01` : undefined,
              hospital: s.hospital,
            });
          } catch {
            // continue
          }
        }
      }

      clearDraft('patient_onboarding');
      clearDraft('patient_stage');
      router.push('/patient/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      router.push('/patient/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                New Patient Sign Up
              </span>
              <AudioHelper text={`Health Onboarding Interview. Step ${currentStepIdx + 1} of 7: ${stepsList[currentStepIdx].label}.`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Guided Health Intake Interview
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Answer simple questions to build your verified personal health record.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">Progress</span>
            <span className="text-lg font-black text-teal-800">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Chips (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {stepsList.map((st, i) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setCurrentStep(st.key as Step)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all ${
                currentStep === st.key
                  ? 'bg-teal-600 text-white shadow-xs'
                  : i < currentStepIdx
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: PERSONAL DETAILS */}
      {/* ============================================================ */}
      {currentStep === 'PERSONAL' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <span>Personal Details & Identity</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your identity information ensures verified clinical safety and emergency reach.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                        gender === g
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Blood Group
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      bloodGroup === bg
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Residential City / Full Address
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sector 4, Rohini, New Delhi"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Emergency Contact Name & Phone <span className="text-rose-500">*</span>
              </label>
              <Input
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. +91 98765 43211 (Son - Amit)"
                helperText="Hospital staff can call this person in an urgent situation."
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              size="lg"
              onClick={() => setCurrentStep('CONDITIONS')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Continue to Conditions
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 2: HEALTH CONDITIONS */}
      {/* ============================================================ */}
      {currentStep === 'CONDITIONS' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <span>Current Health Conditions & Diagnoses</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select any chronic conditions you have been diagnosed with by a doctor.
            </p>
          </div>

          {/* None button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setHasNoConditions(!hasNoConditions);
                if (!hasNoConditions) setConditions([]);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                hasNoConditions
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              ✓ I have no diagnosed chronic conditions
            </button>
          </div>

          {!hasNoConditions && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Tap to add common conditions:
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonConditions.map((cond) => {
                    const isAdded = conditions.some((c) => c.name.toLowerCase() === cond.toLowerCase());
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setConditions(conditions.filter((c) => c.name.toLowerCase() !== cond.toLowerCase()));
                          } else {
                            addCondition(cond);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isAdded
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom add */}
              <div className="flex gap-2">
                <Input
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                  placeholder="Other condition (e.g. Migraine, Glaucoma)"
                  className="text-sm"
                />
                <Button size="md" onClick={() => addCondition(newConditionName)}>
                  Add
                </Button>
              </div>

              {/* Added conditions list */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-600 block">Selected Conditions:</span>
                {conditions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No conditions selected yet.</p>
                ) : (
                  conditions.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                        <span className="text-xs text-slate-500">Active status</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCondition(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="lg" onClick={() => setCurrentStep('PERSONAL')} leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Back
            </Button>
            <Button size="lg" onClick={() => setCurrentStep('MEDICINES')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Continue to Medicines
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 3: DAILY MEDICINES */}
      {/* ============================================================ */}
      {currentStep === 'MEDICINES' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-600" />
              <span>Current Daily Medications</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              List any prescription or OTC medicines you take regularly.
            </p>
          </div>

          {/* None button */}
          <button
            type="button"
            onClick={() => {
              setHasNoMedicines(!hasNoMedicines);
              if (!hasNoMedicines) setMedicines([]);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              hasNoMedicines
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            ✓ I do not take any regular medicines
          </button>

          {!hasNoMedicines && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase">Add a medicine:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Medicine name (e.g. Metformin, Amlodipine)"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  />
                  <Input
                    placeholder="Dose (e.g. 500 mg, 5 mg)"
                    value={newMed.dose}
                    onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Frequency (e.g. Twice daily after meals)"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  />
                  <Input
                    placeholder="Purpose (e.g. Blood Sugar, BP)"
                    value={newMed.purpose}
                    onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  />
                </div>
                <Button size="md" onClick={addMedicine} rightIcon={<Plus className="w-4 h-4" />}>
                  Add Medicine to List
                </Button>
              </div>

              {/* Current medicines list */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Your Medicines:</span>
                {medicines.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No medicines listed yet.</p>
                ) : (
                  medicines.map((m, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{m.dose}</span>
                        </div>
                        <span className="text-xs text-slate-600 block mt-0.5">{m.frequency} {m.purpose ? `· For ${m.purpose}` : ''}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="lg" onClick={() => setCurrentStep('CONDITIONS')} leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Back
            </Button>
            <Button size="lg" onClick={() => setCurrentStep('ALLERGIES')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Continue to Allergies
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 4: ALLERGIES */}
      {/* ============================================================ */}
      {currentStep === 'ALLERGIES' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Drug Allergies & Sensitivities</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Crucial safety check so doctors avoid prescribing medications you are allergic to.
            </p>
          </div>

          {/* None button */}
          <button
            type="button"
            onClick={() => {
              setHasNoAllergies(!hasNoAllergies);
              if (!hasNoAllergies) setAllergies([]);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              hasNoAllergies
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            ✓ No Known Drug Allergies (NKDA)
          </button>

          {!hasNoAllergies && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Tap to add common allergens:
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergens.map((alg) => {
                    const isAdded = allergies.some((a) => a.allergen.toLowerCase() === alg.toLowerCase());
                    return (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setAllergies(allergies.filter((a) => a.allergen.toLowerCase() !== alg.toLowerCase()));
                          } else {
                            addAllergy(alg);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isAdded
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{alg}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom add */}
              <div className="flex gap-2">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Other allergy (e.g. Iodine, Latex)"
                  className="text-sm"
                />
                <Button size="md" onClick={() => addAllergy(newAllergen)}>
                  Add
                </Button>
              </div>

              {/* Added allergies */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Recorded Allergies:</span>
                {allergies.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No allergies recorded.</p>
                ) : (
                  allergies.map((a, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-rose-950 text-sm block">{a.allergen}</span>
                        <span className="text-xs text-rose-800">{a.severity} severity · {a.reaction}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAllergy(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="lg" onClick={() => setCurrentStep('MEDICINES')} leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Back
            </Button>
            <Button size="lg" onClick={() => setCurrentStep('FAMILY')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Continue to Family History
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 5: FAMILY HEALTH HISTORY */}
      {/* ============================================================ */}
      {currentStep === 'FAMILY' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Family Health History</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Knowing hereditary conditions in your parents or siblings helps doctors provide preventative advice.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Add family condition:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Relative</label>
                <select
                  value={newFamilyRel}
                  onChange={(e) => setNewFamilyRel(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Sibling">Brother / Sister</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Condition</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Heart Attack (CAD), Type 2 Diabetes, Stroke"
                    value={newFamilyCondition}
                    onChange={(e) => setNewFamilyCondition(e.target.value)}
                  />
                  <Button size="md" onClick={addFamilyRecord} rightIcon={<Plus className="w-4 h-4" />}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Common Conditions to Tap:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Heart Disease', 'Type 2 Diabetes', 'High BP', 'Stroke', 'Thyroid', 'Cancer'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => {
                      setFamilyItems([...familyItems, { relationship: newFamilyRel, condition: cond }]);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-purple-200 text-purple-800 hover:bg-purple-50"
                  >
                    + {newFamilyRel}: {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of family records */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 block">Recorded Family History:</span>
            {familyItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No family history recorded.</p>
            ) : (
              familyItems.map((f, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-purple-200 flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-900 text-xs uppercase px-2 py-0.5 bg-purple-50 rounded border border-purple-200">
                        {f.relationship}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{f.condition}</span>
                    </div>
                    {f.onset_age && <span className="text-xs text-slate-500 block mt-0.5">{f.onset_age}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFamilyRecord(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="lg" onClick={() => setCurrentStep('ALLERGIES')} leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Back
            </Button>
            <Button size="lg" onClick={() => setCurrentStep('SURGERIES')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Continue to Past Surgeries
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 6: PAST SURGERIES */}
      {/* ============================================================ */}
      {currentStep === 'SURGERIES' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-teal-600" />
              <span>Past Surgeries & Hospital Procedures</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Previous surgical operations or major hospital interventions.
            </p>
          </div>

          {/* None button */}
          <button
            type="button"
            onClick={() => {
              setHasNoSurgeries(!hasNoSurgeries);
              if (!hasNoSurgeries) setSurgeries([]);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              hasNoSurgeries
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            ✓ I have had no major surgeries
          </button>

          {!hasNoSurgeries && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Tap to add common procedures:
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSurgeries.map((surg) => {
                    const isAdded = surgeries.some((s) => s.procedure_name.toLowerCase() === surg.toLowerCase());
                    return (
                      <button
                        key={surg}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            setSurgeries(surgeries.filter((s) => s.procedure_name.toLowerCase() !== surg.toLowerCase()));
                          } else {
                            addSurgery(surg);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isAdded
                            ? 'bg-teal-50 border-teal-300 text-teal-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{surg}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom add */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <Input
                    placeholder="Other surgery (e.g. Gallbladder, Hernia)"
                    value={newSurgeryName}
                    onChange={(e) => setNewSurgeryName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Year (e.g. 2018)"
                    value={newSurgeryYear}
                    onChange={(e) => setNewSurgeryYear(e.target.value)}
                  />
                  <Button size="md" onClick={() => addSurgery(newSurgeryName)}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Added surgeries */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Recorded Surgeries:</span>
                {surgeries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No past surgeries recorded.</p>
                ) : (
                  surgeries.map((s, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{s.procedure_name}</span>
                        <span className="text-xs text-slate-500">Year: {s.year} {s.hospital ? `· ${s.hospital}` : ''}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSurgery(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="outline" size="lg" onClick={() => setCurrentStep('FAMILY')} leftIcon={<ArrowLeft className="w-5 h-5" />}>
              Back
            </Button>
            <Button size="lg" onClick={() => setCurrentStep('REVIEW')} rightIcon={<ArrowRight className="w-5 h-5" />}>
              Review Profile Summary
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* STEP 7: REVIEW & CONFIRM */}
      {/* ============================================================ */}
      {currentStep === 'REVIEW' && (
        <Card className="p-6 sm:p-8 space-y-6 animate-fadeIn border-2 border-teal-200">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Step 7 of 7: Review & Finalize</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Your Completed Health Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Please review your information below. Once confirmed, all records will be populated across your personal health dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Patient</span>
                <Badge variant="teal">Blood: {bloodGroup}</Badge>
              </div>
              <p className="text-lg font-black text-slate-900">{fullName}</p>
              <p className="text-xs text-slate-600">{gender} · DOB: {dob}</p>
              <p className="text-xs text-slate-600">Address: {address}</p>
              <p className="text-xs font-semibold text-rose-800">Emergency: {emergencyContact}</p>
            </div>

            {/* Conditions Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Health Conditions</span>
                <span className="text-xs font-bold text-slate-700">{conditions.length} Active</span>
              </div>
              {conditions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No chronic conditions.</p>
              ) : (
                <ul className="text-xs space-y-1 text-slate-800">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Medicines Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Medicines</span>
                <span className="text-xs font-bold text-amber-800">{medicines.length} Prescriptions</span>
              </div>
              {medicines.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No daily medicines.</p>
              ) : (
                <ul className="text-xs space-y-1 text-slate-800">
                  {medicines.map((m, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{m.name} ({m.dose}) · {m.frequency}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Allergies Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Allergies</span>
                <span className="text-xs font-bold text-rose-800">{allergies.length} Recorded</span>
              </div>
              {allergies.length === 0 ? (
                <p className="text-xs text-emerald-700 font-semibold">✓ No known drug allergies</p>
              ) : (
                <ul className="text-xs space-y-1 text-rose-900">
                  {allergies.map((a, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>{a.allergen} ({a.severity})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Family Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Family Health History</span>
                <span className="text-xs font-bold text-purple-800">{familyItems.length} Records</span>
              </div>
              {familyItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No family conditions listed.</p>
              ) : (
                <ul className="text-xs space-y-1 text-slate-800">
                  {familyItems.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <strong className="text-purple-900">{f.relationship}:</strong> {f.condition}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Surgeries Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Past Surgeries</span>
                <span className="text-xs font-bold text-teal-800">{surgeries.length} Procedures</span>
              </div>
              {surgeries.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No past surgeries.</p>
              ) : (
                <ul className="text-xs space-y-1 text-slate-800">
                  {surgeries.map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <span>{s.procedure_name} ({s.year})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep('SURGERIES')}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Back & Edit
            </Button>

            <Button
              size="xl"
              isLoading={isSubmitting}
              onClick={handleFinalSubmit}
              rightIcon={<CheckCircle2 className="w-6 h-6" />}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 font-bold px-10 shadow-lg shadow-teal-600/30"
            >
              Confirm & Open My Health Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
