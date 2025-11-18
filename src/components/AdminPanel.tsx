import { useState } from 'react';
import { Mail, Settings, AlertCircle } from 'lucide-react';
import { AdminTipsManagement } from './AdminTipsManagement';

type AdminTab = 'tips' | 'email-test';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('tips');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSendTestEmail() {
    if (!testEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-shabbat-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            testMode: true,
            testEmail: testEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      setMessage({ type: 'success', text: 'Test email sent successfully!' });
      setTestEmail('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl w-full space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
          <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h2>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('tips')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'tips'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Tips Management
        </button>
        <button
          onClick={() => setActiveTab('email-test')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'email-test'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Email Test
        </button>
      </div>

      {activeTab === 'tips' && <AdminTipsManagement />}

      {activeTab === 'email-test' && (
        <div className="space-y-4">
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

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Send Test Email</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send a preview of the Friday Shabbat email to test the format and content.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSendTestEmail}
              disabled={isSending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
