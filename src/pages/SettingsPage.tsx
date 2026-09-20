import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Save, Wifi, WifiOff, RefreshCw, Send, ShieldCheck, Globe } from 'lucide-react';
import { sendToViaSocketWebhook } from '../services/viasocket';

export const SettingsPage: React.FC = () => {
  const { storeProfile, updateStoreProfile, resetToDemoData, showToast } = useStore();

  const [storeName, setStoreName] = useState(storeProfile.storeName);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [language, setLanguage] = useState(storeProfile.preferredLanguage);
  const [webhookUrl, setWebhookUrl] = useState(storeProfile.viasocketWebhookUrl);
  const [isLive, setIsLive] = useState(storeProfile.isLiveWebhookEnabled);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile({
      storeName,
      ownerName,
      phone,
      preferredLanguage: language,
      viasocketWebhookUrl: webhookUrl,
      isLiveWebhookEnabled: isLive,
    });
  };

  const handleTestPing = async () => {
    if (!webhookUrl.trim()) {
      showToast('Please enter a ViaSocket webhook URL first.', 'warning');
      return;
    }

    setIsTestingWebhook(true);
    try {
      await sendToViaSocketWebhook(webhookUrl.trim(), {
        source: 'expenso',
        input_type: 'text',
        raw_input: 'ViaSocket Ping Test from Expenso UI',
        language: 'hinglish',
        timestamp: new Date().toISOString(),
        store_id: 'store_rajesh_01',
        user_id: 'user_rajesh',
        metadata: { ping: true },
      });
      showToast('✓ Successfully received response from ViaSocket webhook!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Webhook ping failed';
      showToast(`Webhook ping: ${msg}. (Make sure CORS/endpoint is active)`, 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-800" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] tracking-tight">
            Store Profile & ViaSocket Settings
          </h1>
        </div>
        <p className="text-xs text-[#78716C] mt-0.5">
          Manage your kirana store information, reminder language, and live ViaSocket automation webhook
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Store Information Card */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E8E3D8] shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#57534E]">
            Store & Owner Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Store / Supermarket Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">WhatsApp / Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#57534E] mb-1">Preferred Reminder Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-sm font-semibold text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              >
                <option value="hinglish">Hinglish (Conversational)</option>
                <option value="hindi">Hindi (शुद्ध हिंदी)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* ViaSocket Automation Card */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E8E3D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#57534E]">
                ViaSocket Automation Webhook
              </h3>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-[#57534E]">
                {isLive ? 'Live Mode Active' : 'Demo Mode'}
              </span>
              <input
                type="checkbox"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
            </label>
          </div>

          <p className="text-xs text-[#78716C] leading-relaxed">
            Connect Expenso to your live ViaSocket workflow. When enabled, transactions and ledger photos are posted directly to your webhook to update your Google Sheet ledger. When disabled or offline, Expenso automatically uses its client-side smart Munim engine.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#57534E] mb-1">
              ViaSocket Webhook URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://flow.viasocket.com/webhook/..."
                className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D5CEC1] rounded-xl text-xs sm:text-sm font-mono text-[#1C1917] focus:bg-white focus:border-[#1C1917] outline-none"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isTestingWebhook}
                className="px-4 py-2.5 bg-[#F2EFE8] hover:bg-[#E5E0D4] text-[#1C1917] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTestingWebhook ? 'Testing...' : 'Test Ping'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#A8A29E] mt-1.5">
              Configurable via <code className="bg-[#FAF8F5] px-1 py-0.5 rounded text-[#57534E]">VITE_VIASOCKET_WEBHOOK_URL</code> or entered here directly.
            </p>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#F8F6F0] font-bold text-sm flex items-center gap-2 shadow-xs transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Store Settings</span>
          </button>

          <button
            type="button"
            onClick={resetToDemoData}
            className="py-3 px-4 rounded-xl text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Store Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
