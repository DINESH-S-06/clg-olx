import React, { useState } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { reportProduct } from '../api';

const REPORT_REASONS = [
  'Spam or Misleading Information',
  'Scam or Fraudulent Ad',
  'Inappropriate or Offensive Content',
  'Item Already Sold / Unavailable',
  'Prohibited Campus Item',
  'Other Reason',
];

export default function ReportModal({
  product,
  isOpen,
  onClose,
  currentUser,
  onReportSuccess,
  onRequireAuth,
}) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      if (onRequireAuth) {
        onClose();
        onRequireAuth();
      } else {
        setError('Please sign in to submit a report.');
      }
      return;
    }

    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setLoading(true);
    try {
      const data = await reportProduct(product._id, {
        reason,
        details: details.trim(),
      });
      if (onReportSuccess) {
        onReportSuccess(data.message || 'Report submitted successfully.');
      }
      onClose();
      // Reset state
      setReason(REPORT_REASONS[0]);
      setDetails('');
    } catch (err) {
      console.error('Report submission error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to submit report. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <Flag className="w-4 h-4 fill-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#002f34]">Report Listing</h2>
              <p className="text-[11px] text-slate-500 font-medium">Keep our campus marketplace honest & secure</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Product Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                Ad
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#002f34] truncate">{product.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                ₹{Number(product.price || 0).toLocaleString('en-IN')} • Seller:{' '}
                <span className="font-semibold">{product.seller?.name || 'Student'}</span>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Why are you reporting this listing? <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-rose-400 bg-rose-50/60 text-rose-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={(e) => setReason(e.target.value)}
                    className="accent-rose-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context (e.g., incorrect price, fake contact number, already sold on WhatsApp)..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200/50 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all rounded-xl shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5 fill-white" />
              <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

