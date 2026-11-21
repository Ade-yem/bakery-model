/**
 * @file Business Profile page enabling authorized administrators to view, edit,
 * and validate business organization details and branding assets.
 */

import React, { useState } from 'react';
import { Save, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { Button } from '../../../components/shared/Button';
import { CLIENT_PERMISSIONS, hasClientPermission } from '../permissions';
import { AdminPageHeader } from '../../platform-admin/AdminPageHeader';

export function BusinessProfilePage(): React.ReactElement {
  const { currentBusiness, updateBusinessProfile, actor } = useTenant();

  const canEdit = hasClientPermission(actor, CLIENT_PERMISSIONS.PROFILE_EDIT);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentBusiness.name,
    email: currentBusiness.email,
    phone: currentBusiness.phone,
    address: currentBusiness.address,
    businessType: currentBusiness.businessType,
    registrationNumber: currentBusiness.registrationNumber || '',
    logoUrl: currentBusiness.logoUrl || '',
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL for preview simulation
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFeedback({ type: 'error', message: 'Business name, email, and phone number are required.' });
      return;
    }

    updateBusinessProfile(formData);
    setIsEditing(false);
    setFeedback({ type: 'success', message: 'Business profile successfully updated.' });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCancel = () => {
    setFormData({
      name: currentBusiness.name,
      email: currentBusiness.email,
      phone: currentBusiness.phone,
      address: currentBusiness.address,
      businessType: currentBusiness.businessType,
      registrationNumber: currentBusiness.registrationNumber || '',
      logoUrl: currentBusiness.logoUrl || '',
    });
    setIsEditing(false);
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl space-y-6 font-sans">
      {/* 1. Standardized Platform Admin Page Header */}
      <AdminPageHeader
        title="Business Profile & Identity"
        description="Configure your commercial bakery name, contact channels, and official registration."
        action={
          canEdit && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-verdigris hover:bg-verdigris-lift text-flour text-sm font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-verdigris"
            >
              <span>Edit Business Profile</span>
            </button>
          ) : undefined
        }
      />

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-[#8C1D18]/10 text-[#8C1D18] border border-[#8C1D18]/20'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9D3C0] shadow-xs space-y-6">
        {/* Brand Logo Upload / Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#D9D3C0]/40">
          <div className="relative">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Business Brand Logo"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[#0B5C63]/20 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-[#0B5C63] text-[#F6F3EA] flex items-center justify-center font-black text-2xl shadow-sm">
                {formData.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label
                htmlFor="logo-file-input"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#0B5C63] text-white shadow-md hover:bg-[#0F7480] transition-colors cursor-pointer"
                title="Upload brand logo"
              >
                <Upload size={14} />
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUploadSim}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-extrabold text-base text-[#10201F]">{formData.name}</h3>
            <p className="text-xs text-[#10201F]/60">
              Workspace Identifier: <code className="font-mono font-bold text-[#0B5C63]">{currentBusiness.id}</code>
            </p>
            {isEditing && (
              <p className="text-2xs text-[#10201F]/50">
                Recommended: Square PNG or WebP image at least 256x256px.
              </p>
            )}
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Business Legal Name *
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Business Type *
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Official Email Address *
            </label>
            <input
              type="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              disabled={!isEditing}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Headquarters / Operating Address *
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Registration Number (RC / BN)
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="e.g. RC-1849204"
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#F6F3EA]/40 text-xs sm:text-sm text-[#10201F] disabled:opacity-80 focus:outline-none focus:border-[#0B5C63] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#10201F]/70 mb-1.5">
              Member Since
            </label>
            <input
              type="text"
              disabled
              value={new Date(currentBusiness.createdAt).toLocaleDateString()}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D9D3C0] bg-[#EFE9D9]/40 text-xs sm:text-sm text-[#10201F]/60"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9D3C0]/40">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel Changes
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<Save size={14} />}
              iconPosition="left"
            >
              Save Profile Updates
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
