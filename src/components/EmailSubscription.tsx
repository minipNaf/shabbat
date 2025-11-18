import { useState, useEffect } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserId } from '../utils/userId';

export function EmailSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  async function loadSubscriptionStatus() {
    try {
      const userId = getUserId();
      const { data, error } = await supabase
        .from('user_subscription_preferences')
        .select('subscribed_to_friday_email')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsSubscribed(data.subscribed_to_friday_email || false);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleSubscription() {
    setIsSaving(true);
    try {
      const userId = getUserId();
      const newStatus = !isSubscribed;

      const { error } = await supabase
        .from('user_subscription_preferences')
        .upsert(
          {
            user_id: userId,
            subscribed_to_friday_email: newStatus,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setIsSubscribed(newStatus);
      setMessage({
        type: 'success',
        text: newStatus ? 'Subscribed to Friday emails!' : 'Unsubscribed from Friday emails',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setMessage({ type: 'error', text: 'Failed to update subscription' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
          <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Friday Emails</h2>
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
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Digest</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Receive Shabbat times and tips every Friday at noon for your location.
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
            <span>Candle-lighting time for Friday</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
            <span>Havdala time for Saturday</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
            <span>Shabbat tips and inspiration</span>
          </p>
        </div>
      </div>

      <button
        onClick={handleToggleSubscription}
        disabled={isSaving}
        className={`w-full font-semibold py-3 rounded-lg transition-colors ${
          isSubscribed
            ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-400 text-gray-900 dark:text-gray-100'
        }`}
      >
        {isSaving ? 'Updating...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
      </button>
    </div>
  );
}
