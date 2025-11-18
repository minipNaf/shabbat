import { useState, useEffect } from 'react';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShabbatTip {
  id: string;
  content: string;
  category: string | null;
}

export function AdminTipsManagement() {
  const [tips, setTips] = useState<ShabbatTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTip, setNewTip] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTips();
  }, []);

  async function loadTips() {
    try {
      const { data, error } = await supabase
        .from('shabbat_tips')
        .select('id, content, category')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTips(data || []);
    } catch (error) {
      console.error('Error loading tips:', error);
      setMessage({ type: 'error', text: 'Failed to load tips' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTip() {
    if (!newTip.trim()) {
      setMessage({ type: 'error', text: 'Tip content cannot be empty' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('shabbat_tips')
        .insert([
          {
            content: newTip,
            category: newCategory || null,
          },
        ]);

      if (error) throw error;

      setNewTip('');
      setNewCategory('');
      setMessage({ type: 'success', text: 'Tip added successfully!' });
      await loadTips();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding tip:', error);
      setMessage({ type: 'error', text: 'Failed to add tip' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTip(id: string) {
    if (!confirm('Are you sure you want to delete this tip?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shabbat_tips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTips(tips.filter((t) => t.id !== id));
      setMessage({ type: 'success', text: 'Tip deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting tip:', error);
      setMessage({ type: 'error', text: 'Failed to delete tip' });
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl w-full space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Shabbat Tips</h2>

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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add New Tip</h3>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tip Content
          </label>
          <textarea
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            placeholder="Enter a Shabbat tip..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Category (optional)
          </label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g., Food, Traditions, Wellness"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAddTip}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isSaving ? 'Adding...' : 'Add Tip'}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Existing Tips ({tips.length})</h3>

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading tips...</p>
        ) : tips.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tips yet. Add your first one!</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex justify-between items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-gray-100 break-words">{tip.content}</p>
                  {tip.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Category: {tip.category}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTip(tip.id)}
                  className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
