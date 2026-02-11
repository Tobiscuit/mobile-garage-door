'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettings } from '@/app/(site)/dashboard/settings/actions';
import Image from 'next/image';

interface SettingsFormProps {
  initialData: any;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for complex fields (Arrays)
  const [stats, setStats] = useState(initialData.stats || []);
  const [values, setValues] = useState(initialData.values || []);

  const handleStatsChange = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  const addStat = () => {
    setStats([...stats, { value: '', label: '' }]);
  };

  const removeStat = (index: number) => {
    const newStats = stats.filter((_: any, i: number) => i !== index);
    setStats(newStats);
  };

  const handleValuesChange = (index: number, field: string, value: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: value };
    setValues(newValues);
  };

  const addValue = () => {
    setValues([...values, { title: '', description: '' }]);
  };

  const removeValue = (index: number) => {
    const newValues = values.filter((_: any, i: number) => i !== index);
    setValues(newValues);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Append JSON strings for array fields
      formData.append('stats', JSON.stringify(stats));
      formData.append('values', JSON.stringify(values));

      await updateSettings(formData);
      router.refresh();
      // Optionally show success toast/message here
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Optionally show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, name, defaultValue, type = 'text', placeholder = '' }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl p-4 text-[#f7f9fb] focus:outline-none focus:border-[#f1c40f] transition-colors"
      />
    </div>
  );

  const TextareaField = ({ label, name, defaultValue, rows = 4, placeholder = '' }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-[#2c3e50] border border-[#ffffff10] rounded-xl p-4 text-[#f7f9fb] focus:outline-none focus:border-[#f1c40f] transition-colors resize-none"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      
      {/* COMPANY INFO */}
      <section className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <span className="text-[#f1c40f]">01.</span> Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Business Name" name="companyName" defaultValue={initialData.companyName} />
          <InputField label="24/7 Hotline" name="phone" defaultValue={initialData.phone} />
          <InputField label="Support Email" name="email" defaultValue={initialData.email} type="email" />
          <InputField label="License Number" name="licenseNumber" defaultValue={initialData.licenseNumber} />
          <InputField label="Liability Insurance" name="insuranceAmount" defaultValue={initialData.insuranceAmount} />
          <InputField label="BBB Rating" name="bbbRating" defaultValue={initialData.bbbRating} />
        </div>
      </section>

      {/* ABOUT PAGE CONTENT */}
      <section className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <span className="text-[#f1c40f]">02.</span> About Page Content
        </h2>
        
        <div className="space-y-8">
          <TextareaField label="Mission Statement" name="missionStatement" defaultValue={initialData.missionStatement} />

          {/* STATS ARRAY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider">Company Stats</label>
              <button type="button" onClick={addStat} className="text-[#f1c40f] text-xs font-bold hover:underline">+ ADD STAT</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="bg-[#2c3e50] border border-[#ffffff10] rounded-xl p-4 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeStat(index)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={stat.value} 
                      onChange={(e) => handleStatsChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g. 15+)"
                      className="w-full bg-transparent border-b border-[#ffffff10] pb-1 text-[#f7f9fb] font-bold focus:outline-none focus:border-[#f1c40f]"
                    />
                    <input 
                      type="text" 
                      value={stat.label} 
                      onChange={(e) => handleStatsChange(index, 'label', e.target.value)}
                      placeholder="Label (e.g. Years)"
                      className="w-full bg-transparent border-b border-[#ffffff10] pb-1 text-[#bdc3c7] text-sm focus:outline-none focus:border-[#f1c40f]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VALUES ARRAY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#bdc3c7] uppercase tracking-wider">Core Values</label>
              <button type="button" onClick={addValue} className="text-[#f1c40f] text-xs font-bold hover:underline">+ ADD VALUE</button>
            </div>
            <div className="space-y-4">
              {values.map((val: any, index: number) => (
                <div key={index} className="bg-[#2c3e50] border border-[#ffffff10] rounded-xl p-6 relative group">
                   <button 
                    type="button" 
                    onClick={() => removeValue(index)}
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                     <input 
                      type="text" 
                      value={val.title} 
                      onChange={(e) => handleValuesChange(index, 'title', e.target.value)}
                      placeholder="Value Title"
                      className="w-full bg-transparent border-b border-[#ffffff10] pb-2 text-[#f1c40f] font-bold text-lg focus:outline-none focus:border-[#f1c40f]"
                    />
                     <textarea 
                      value={val.description} 
                      onChange={(e) => handleValuesChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full bg-transparent border-b border-[#ffffff10] pb-2 text-[#bdc3c7] focus:outline-none focus:border-[#f1c40f] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRAND VOICE */}
      <section className="bg-[#34495e]/50 backdrop-blur-md border border-[#ffffff08] rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <span className="text-[#f1c40f]">03.</span> Brand Voice (AI Persona)
        </h2>
        <div className="space-y-6">
          <TextareaField label="Writing Style" name="brandVoice" defaultValue={initialData.brandVoice} rows={6} />
          <TextareaField label="Tone Notes" name="brandTone" defaultValue={initialData.brandTone} rows={4} />
          <TextareaField label="Words to Avoid" name="brandAvoid" defaultValue={initialData.brandAvoid} rows={4} />
        </div>
      </section>

      {/* ACTION BAR */}
      <div className="sticky bottom-8 bg-[#2c3e50]/90 backdrop-blur-xl border border-[#ffffff10] p-4 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="text-[#bdc3c7] text-sm">
          Changes will reflect immediately across the site.
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            bg-[#f1c40f] text-[#2c3e50] font-black uppercase tracking-widest py-3 px-8 rounded-xl
            hover:shadow-[0_0_20px_rgba(241,196,15,0.4)] transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
}
