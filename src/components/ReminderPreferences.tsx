import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../utils/userId';

interface ReminderPreference {
  advance_minutes: number;
  channels: string[];
  phone_number: string | null;
  email_address: string | null;
  is_enabled: boolean;
}

export function ReminderPreferences() {
  const [preferences, setPreferences] = useState<ReminderPreference>({
    advance_minutes: 10,
    channels: ['push'],
    phone_number: '',
    email_address: '',
    is_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const userId = getUserId();
      const { data, error } = await supabase
        .from('user_reminder_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          advance_minutes: data.advance_minutes,
          channels: data.channels || ['push'],
          phone_number: data.phone_number || '',
          email_address: data.email_address || '',
          is_enabled: data.is_enabled !== false,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setIsLoading(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (preferences.channels.includes('sms') && !preferences.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required for SMS notifications';
    }

    if (preferences.channels.includes('email') && !preferences.email_address?.trim()) {
      newErrors.email_address = 'Email is required for email notifications';
    }

    if (preferences.channels.includes('email') && preferences.email_address?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(preferences.email_address)) {
        newErrors.email_address = 'Invalid email address';
      }
    }

    if (preferences.channels.includes('sms') && preferences.phone_number?.trim()) {
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(preferences.phone_number)) {
        newErrors.phone_number = 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const userId = getUserId();
      const { error } = await supabase
        .from('user_reminder_preferences')
        .upsert(
          {
            user_id: userId,
            advance_minutes: preferences.advance_minutes,
            channels: preferences.channels,
            phone_number: preferences.phone_number || null,
            email_address: preferences.email_address || null,
            is_enabled: preferences.is_enabled,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setIsSaving(false);
    }
  }

  function toggleChannel(channel: string) {
    setPreferences((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-gray-600 dark:text-gray-400">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
          <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reminder Settings</h2>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm flex items-gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Remind me before candle-lighting
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 15].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setPreferences({ ...preferences, advance_minutes: minutes })}
                className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                  preferences.advance_minutes === minutes
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Notification Channels
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels.includes('push')}
                onChange={() => toggleChannel('push')}
                className="w-4 h-4 rounded"
              />
              <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Bell className="w-4 h-4" />
                Push Notification
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels.includes('email')}
                onChange={() => toggleChannel('email')}
                className="w-4 h-4 rounded"
              />
              <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Mail className="w-4 h-4" />
                Email
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.channels.includes('sms')}
                onChange={() => toggleChannel('sms')}
                className="w-4 h-4 rounded"
              />
              <span className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <MessageSquare className="w-4 h-4" />
                SMS
              </span>
            </label>
          </div>
        </div>

        {preferences.channels.includes('email') && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={preferences.email_address}
              onChange={(e) => setPreferences({ ...preferences, email_address: e.target.value })}
              placeholder="your@email.com"
              className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email_address ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.email_address && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email_address}</p>
            )}
          </div>
        )}

        {preferences.channels.includes('sms') && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={preferences.phone_number}
              onChange={(e) => setPreferences({ ...preferences, phone_number: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className={`w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone_number ? 'ring-2 ring-red-500' : ''
              }`}
            />
            {errors.phone_number && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.phone_number}</p>
            )}
          </div>
        )}

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.is_enabled}
              onChange={(e) => setPreferences({ ...preferences, is_enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {preferences.is_enabled ? 'Reminders enabled' : 'Reminders disabled'}
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
