'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettings } from '@/app/(site)/dashboard/settings/actions';

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
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--staff-muted)' }}>{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl p-4 focus:outline-none focus:border-[var(--staff-accent)] transition-colors"
        style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
      />
    </div>
  );

  const TextareaField = ({ label, name, defaultValue, rows = 4, placeholder = '' }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--staff-muted)' }}>{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl p-4 focus:outline-none focus:border-[var(--staff-accent)] transition-colors resize-none"
        style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      
      {/* COMPANY INFO */}
      <section className="backdrop-blur-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="text-[var(--staff-accent)]">01.</span> Company Information
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
      <section className="backdrop-blur-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="text-[var(--staff-accent)]">02.</span> About Page Content
        </h2>
        
        <div className="space-y-8">
          <TextareaField label="Mission Statement" name="missionStatement" defaultValue={initialData.missionStatement} />

          {/* STATS ARRAY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--staff-muted)' }}>Company Stats</label>
              <button type="button" onClick={addStat} className="text-[var(--staff-accent)] text-xs font-bold hover:underline">+ ADD STAT</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="rounded-xl p-4 relative group" style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)' }}>
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
                      className="w-full bg-transparent border-b pb-1 font-bold focus:outline-none focus:border-[var(--staff-accent)]"
                      style={{ borderColor: 'var(--staff-border)', color: 'var(--staff-text)' }}
                    />
                    <input 
                      type="text" 
                      value={stat.label} 
                      onChange={(e) => handleStatsChange(index, 'label', e.target.value)}
                      placeholder="Label (e.g. Years)"
                      className="w-full bg-transparent border-b pb-1 text-sm focus:outline-none focus:border-[var(--staff-accent)]"
                      style={{ borderColor: 'var(--staff-border)', color: 'var(--staff-muted)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VALUES ARRAY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--staff-muted)' }}>Core Values</label>
              <button type="button" onClick={addValue} className="text-[var(--staff-accent)] text-xs font-bold hover:underline">+ ADD VALUE</button>
            </div>
            <div className="space-y-4">
              {values.map((val: any, index: number) => (
                <div key={index} className="rounded-xl p-6 relative group" style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)' }}>
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
                      className="w-full bg-transparent border-b pb-2 text-[var(--staff-accent)] font-bold text-lg focus:outline-none focus:border-[var(--staff-accent)]"
                      style={{ borderColor: 'var(--staff-border)' }}
                    />
                     <textarea 
                      value={val.description} 
                      onChange={(e) => handleValuesChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full bg-transparent border-b pb-2 focus:outline-none focus:border-[var(--staff-accent)] resize-none"
                      style={{ borderColor: 'var(--staff-border)', color: 'var(--staff-muted)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRAND VOICE */}
      <section className="backdrop-blur-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="text-[var(--staff-accent)]">03.</span> Brand Voice (AI Persona)
        </h2>
        <div className="space-y-6">
          <TextareaField label="Writing Style" name="brandVoice" defaultValue={initialData.brandVoice} rows={6} />
          <TextareaField label="Tone Notes" name="brandTone" defaultValue={initialData.brandTone} rows={4} />
          <TextareaField label="Words to Avoid" name="brandAvoid" defaultValue={initialData.brandAvoid} rows={4} />
        </div>
      </section>

      {/* ADMIN PREFERENCES */}
      <section className="backdrop-blur-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="text-[var(--staff-accent)]">04.</span> Admin Preferences
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--staff-muted)' }}>Light Mode Theme</label>
            <select
              name="themePreference"
              defaultValue={initialData?.themePreference || 'candlelight'}
              className="w-full rounded-xl p-4 focus:outline-none focus:border-[var(--staff-accent)] transition-colors appearance-none"
              style={{ backgroundColor: 'var(--staff-surface-alt)', border: '1px solid var(--staff-border)', color: 'var(--staff-text)' }}
            >
              <option value="candlelight">Candlelight (Warm & Ambient)</option>
              <option value="original">Original (High Contrast White)</option>
            </select>
          </div>
        </div>
      </section>

      {/* AUTOMATIONS & WARRANTY */}
      <section className="backdrop-blur-md rounded-3xl p-8 shadow-xl" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="text-[var(--staff-accent)]">05.</span> Automations & Warranty
        </h2>
        <div className="space-y-6">
          <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors hover:bg-black/5" style={{ border: '1px solid var(--staff-border)' }}>
             <input 
               type="checkbox" 
               name="warrantyEnableNotifications" 
               defaultChecked={initialData?.warranty?.enableNotifications}
               className="w-5 h-5 rounded accent-[var(--staff-accent)]" 
             />
             <div className="flex flex-col">
                <span className="font-bold text-sm" style={{ color: 'var(--staff-text)' }}>Enable 11-Month Warranty Checkup Emails</span>
                <span className="text-xs" style={{ color: 'var(--staff-muted)' }}>Automatically emails customers a month before their 1-year labor warranty expires.</span>
             </div>
          </label>
          <TextareaField 
             label="Warranty Email Template" 
             name="warrantyEmailTemplate" 
             defaultValue={initialData?.warranty?.notificationEmailTemplate} 
             rows={4} 
             placeholder="Use {{client}} and {{project}} as placeholders."
          />
        </div>
      </section>

      {/* ACTION BAR */}
      <div className="sticky bottom-8 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center justify-between" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
        <div className="text-sm" style={{ color: 'var(--staff-muted)' }}>
          Changes will reflect immediately across the site.
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            bg-[var(--staff-accent)] text-[var(--staff-surface-alt)] font-black uppercase tracking-widest py-3 px-8 rounded-xl
            hover:shadow-[0_0_20px_var(--staff-accent)] transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
}
