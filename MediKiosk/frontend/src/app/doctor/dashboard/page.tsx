'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../../lib/i18n-context';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AudioHelper } from '../../../components/common/AudioHelper';
import {
  Search,
  Stethoscope,
  User,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Pill,
  Activity,
  AlertCircle,
  ArrowRight,
  LayoutDashboard,
  Users,
  ClipboardList,
  AlertTriangle,
  Settings,
  ChevronRight,
  Phone,
  Eye,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeNav, setActiveNav] = useState<'dashboard' | 'patients' | 'consultations' | 'reports' | 'alerts' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('9876543210');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>({
    full_name: 'Ramesh Kumar',
    date_of_birth: '1958-05-15',
    gender: 'Male',
    blood_group: 'B+',
    phone_number: '+91 98765 43210',
    emergency_contact: '+91 98765 43211 (Son - Amit)',
    matched_identity_type: 'MOBILE',
    matched_identifier: '+91 98765 43210',
    onboarding_completed: true,
  });
  const [searchMessage, setSearchMessage] = useState<string>('');
  const [selectedPatient360, setSelectedPatient360] = useState<any>(null);

  const doctorName = user?.doctor_profile?.full_name || 'Dr. Rajesh Sharma';
  const specialization = user?.doctor_profile?.specialization || 'General Medicine & Family Health';
  const hospital = user?.doctor_profile?.hospital_clinic || 'City Health Clinic';

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchMessage('');

    try {
      const res = await api.searchPatient(searchQuery);
      if (res.found && res.patient) {
        setSearchResult(res.patient);
        setSearchMessage(res.message);
      } else {
        setSearchResult(null);
        setSearchMessage(res.message);
      }
    } catch (err: any) {
      setSearchMessage(err.message || 'Lookup failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const recentPatients = [
    {
      id: '1',
      name: 'Ramesh Kumar',
      age: 68,
      gender: 'Male',
      phone: '+91 98765 43210',
      abha: '91-1234-5678-9012',
      condition: 'Type 2 Diabetes, Hypertension',
      status: 'Active',
      lastVisit: 'Today, 10:30 AM',
      hasAlert: true,
      alertText: 'Chest discomfort noted in triage intake',
    },
    {
      id: '2',
      name: 'Sunita Devi',
      age: 54,
      gender: 'Female',
      phone: '+91 98111 22334',
      abha: '91-9876-5432-1098',
      condition: 'Hypothyroidism',
      status: 'Review Pending',
      lastVisit: 'Yesterday',
      hasAlert: false,
    },
    {
      id: '3',
      name: 'Anand Verma',
      age: 42,
      gender: 'Male',
      phone: '+91 97222 33445',
      abha: '91-4567-8901-2345',
      condition: 'Bronchial Asthma',
      status: 'Stable',
      lastVisit: '26 Aug 2026',
      hasAlert: false,
    },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn pb-24 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CLINICAL SIDEBAR */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-slate-900 truncate">{doctorName}</h2>
                <p className="text-xs text-slate-500 truncate">{specialization}</p>
                <p className="text-[11px] text-teal-700 font-semibold truncate mt-0.5">{hospital}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-sm font-medium">
              <button
                onClick={() => setActiveNav('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeNav === 'dashboard'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNav('patients')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeNav === 'patients'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Patients</span>
              </button>

              <button
                onClick={() => setActiveNav('consultations')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeNav === 'consultations'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Consultations</span>
              </button>

              <button
                onClick={() => setActiveNav('reports')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeNav === 'reports'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveNav('alerts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                  activeNav === 'alerts'
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Alerts</span>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                  3
                </span>
              </button>

              <Link
                href="/settings"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN CLINICAL CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Clinical Overview
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Good morning, {doctorName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Today's clinical schedule and patient triage queue.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>OPD Active</span>
              </span>
            </div>
          </div>

          {/* Today's Overview Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Today's Patients
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">24</span>
                <span className="text-xs text-teal-700 font-medium">+4 scheduled</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Pending Reviews
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">8</span>
                <span className="text-xs text-sky-700 font-medium">Lab & OCR</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
                Urgent Alerts
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-rose-800">3</span>
                <span className="text-xs text-rose-700 font-medium">Triage Red-Flags</span>
              </div>
            </div>
          </div>

          {/* Patient Lookup Card */}
          <Card className="p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Search Patient</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Lookup medical records strictly by Mobile Number or ABHA ID.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter Mobile (+91 98765 43210) or ABHA ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  className="text-base"
                />
              </div>
              <Button
                type="submit"
                size="md"
                isLoading={isSearching}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="sm:w-auto"
              >
                Lookup Patient
              </Button>
            </form>

            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500">
              <span className="font-medium">Quick Demo Search:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('9876543210');
                  handleSearch();
                }}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                Ramesh Kumar (9876543210)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('91-1234-5678-9012');
                  handleSearch();
                }}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                ABHA: 91-1234-5678-9012
              </button>
            </div>

            {searchMessage && (
              <p className="text-xs text-slate-600 pt-1 font-medium">{searchMessage}</p>
            )}
          </Card>

          {/* Searched Patient Quick Card */}
          {searchResult && (
            <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/40 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                    {searchResult.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {searchResult.full_name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {searchResult.gender || 'Male'} · DOB: {searchResult.date_of_birth || '1958-05-15'} · Blood: <strong className="text-rose-700">{searchResult.blood_group || 'B+'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="md"
                    onClick={() => setSelectedPatient360(searchResult)}
                    rightIcon={<Eye className="w-4 h-4" />}
                  >
                    Open 360° Clinical View
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-teal-200/80 text-xs">
                <div>
                  <span className="text-slate-500 block">Identifier</span>
                  <span className="font-semibold text-slate-900 block">{searchResult.matched_identifier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Identity Type</span>
                  <span className="font-semibold text-slate-900 block">{searchResult.matched_identity_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Contact</span>
                  <span className="font-semibold text-slate-900 block">{searchResult.emergency_contact || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verification Status</span>
                  <StatusBadge status="PATIENT_VERIFIED" label="Patient Verified" />
                </div>
              </div>
            </div>
          )}

          {/* Recent Patients Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Patients</h2>
                <p className="text-xs text-slate-500">Patients evaluated or admitted recently</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Age / Sex</th>
                    <th className="py-3 px-4">Key Conditions</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Consultation</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {p.age}y / {p.gender}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <span>{p.condition}</span>
                        {p.hasAlert && (
                          <span className="block text-[11px] text-rose-700 font-semibold mt-0.5">
                            ⚠️ {p.alertText}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={p.status === 'Active' ? 'ACTIVE' : 'NEEDS_REVIEW'}
                          label={p.status}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {p.lastVisit}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedPatient360(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-white text-teal-700 font-semibold text-xs transition-colors"
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* 360-DEGREE CLINICAL PATIENT MODAL */}
      {selectedPatient360 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-fadeIn">
            {/* Header Strip */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold text-white">
                    {selectedPatient360.full_name || selectedPatient360.name}
                  </h3>
                  <Badge variant="teal">360° Health Profile</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  ABHA: 91-1234-5678-9012 · Phone: {selectedPatient360.phone || selectedPatient360.matched_identifier} · Blood: B+ · Age: 68
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient360(null)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clinical Content Sections */}
            <div className="p-6 space-y-6">
              {/* Provenance Legend */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-semibold text-slate-600">Provenance Indicators:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status="PATIENT_REPORTED" />
                  <StatusBadge status="DOCUMENT_EXTRACTED" />
                  <StatusBadge status="PATIENT_VERIFIED" />
                  <StatusBadge status="DOCTOR_VERIFIED" />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <span>Health Conditions</span>
                  </h4>
                  <span className="text-xs text-slate-500">2 recorded</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Type 2 Diabetes Mellitus</span>
                      <StatusBadge status="PATIENT_VERIFIED" />
                    </div>
                    <p className="text-xs text-slate-600">Diagnosed: 2021 · Active</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Essential Hypertension</span>
                      <StatusBadge status="PATIENT_VERIFIED" />
                    </div>
                    <p className="text-xs text-slate-600">Diagnosed: 2019 · Active</p>
                  </div>
                </div>
              </div>

              {/* Current Medicines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Pill className="w-4 h-4 text-amber-700" />
                    <span>Current Medications</span>
                  </h4>
                  <span className="text-xs text-slate-500">3 active</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-900">Metformin 500 mg</span>
                      <span className="text-slate-500 block text-xs">1 tablet twice daily after meals (Diabetes)</span>
                    </div>
                    <StatusBadge status="DOCUMENT_EXTRACTED" label="Prescription Extracted" />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-slate-900">Amlodipine 5 mg</span>
                      <span className="text-slate-500 block text-xs">1 tablet morning (Blood pressure)</span>
                    </div>
                    <StatusBadge status="DOCUMENT_EXTRACTED" label="Prescription Extracted" />
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Recorded Allergies</span>
                </h4>
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-rose-950">Penicillin</span>
                    <span className="text-rose-800 block text-xs">Skin rash · Moderate severity</span>
                  </div>
                  <StatusBadge status="PATIENT_REPORTED" />
                </div>
              </div>

              {/* Lab Results */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-700" />
                  <span>Recent Lab Investigations</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">HbA1c</span>
                      <span className="font-bold text-slate-900">6.8 %</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">Ref: 4.0 - 5.6 % · 12 Aug 2026</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Fasting Blood Sugar</span>
                      <span className="font-bold text-slate-900">118 mg/dL</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">Ref: 70 - 100 mg/dL · 12 Aug 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedPatient360(null)}
              >
                Close
              </Button>
              <Button
                size="md"
                onClick={() => {
                  alert('Consultation note template generated for ' + (selectedPatient360.full_name || selectedPatient360.name));
                  setSelectedPatient360(null);
                }}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Start Consultation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
