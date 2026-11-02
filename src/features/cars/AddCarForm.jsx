import { useState } from 'react';
import { useCreateCar, useCarImageUpload } from '../../hooks/useCars';

export function AddCarForm({ user }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | error
  const [errorMsg, setErrorMsg] = useState('');

  const createCar = useCreateCar();
  const uploadImage = useCarImageUpload();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    const userId = user?.sub || user?.uid || 'driver';
    const garageId = userId;
    const ownerId = userId;
    const ownerName = user?.name || user?.nickname || user?.displayName || user?.email || 'Driver';

    const createResult = await createCar.mutateAsync({ garageId, ownerId, ownerName, make, model });
    if (!createResult.success) {
      setStatus('error');
      setErrorMsg(createResult.error);
      return;
    }

    const carId = createResult.data;

    if (file) {
      const uploadResult = await uploadImage.mutateAsync({ carId, garageId, ownerName, file, make, model });
      if (!uploadResult.success) {
        setStatus('error');
        setErrorMsg(`Car saved, but image upload failed: ${uploadResult.error}`);
        return;
      }
    }

    setStatus('idle');
    setMake('');
    setModel('');
    setFile(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 w-full p-6 rounded-3xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10"
    >
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Add a Car</h2>
        <p className="text-sm text-slate-400 mt-1">Include a new vehicle in your garage</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Make
        </label>
        <input
          className="rounded-xl px-4 py-3 bg-slate-900/50 border border-slate-700 text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-slate-500"
          placeholder="e.g. Porsche"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Model
        </label>
        <input
          className="rounded-xl px-4 py-3 bg-slate-900/50 border border-slate-700 text-white outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder-slate-500"
          placeholder="e.g. 911 GT3"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Photo <span className="text-red-400 normal-case font-normal">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 file:transition-colors file:cursor-pointer w-full bg-slate-900/50 rounded-xl border border-slate-700"
        />
      </div>

      {status === 'error' && (
        <div className="text-sm rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          <p>{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="mt-2 w-full rounded-xl px-4 py-3.5 font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:scale-[1.02] active:scale-[0.98]"
      >
        {status === 'saving' ? 'Saving...' : 'Add to Garage'}
      </button>
    </form>
  );
}


