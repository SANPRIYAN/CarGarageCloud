import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carService } from '../services/firestore/carService';
import {
  fetchCarDetails,
  createCarDetails,
  updateCarDetails,
  deleteCarDetails,
} from '../services/carDetailsApi';

export function CarDetailsPage() {
  const { carId } = useParams();
  const navigate = useNavigate();

  // Core Data States
  const [carDoc, setCarDoc] = useState(null); // Firestore base car record
  const [details, setDetails] = useState(null); // MongoDB Atlas vehicle profile
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | '404' | '500'
  const [errorMessage, setErrorMessage] = useState('');

  // UI Modes & Toggles
  const [mode, setMode] = useState('view'); // 'view' | 'edit' | 'create'
  const [expandedView, setExpandedView] = useState(false); // Collapsible Section 4 View Details toggle
  const [showAdvancedForm, setShowAdvancedForm] = useState(false); // Collapsible Section 3 Form toggle
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionStatus, setActionStatus] = useState({ loading: false, success: null, error: null });

  // Form State matching Schema
  const [formData, setFormData] = useState(getInitialFormData());

  function getInitialFormData(firestoreCar = null, mongoDetails = null) {
    return {
      manufacturer: mongoDetails?.manufacturer || firestoreCar?.make || '',
      model: mongoDetails?.model || firestoreCar?.model || '',
      variant: mongoDetails?.variant || '',
      year: mongoDetails?.year || '',
      engine: mongoDetails?.engine || '',
      transmission: mongoDetails?.transmission || '',
      fuelType: mongoDetails?.fuelType || '',
      horsepower: mongoDetails?.horsepower || '',
      topSpeed: mongoDetails?.topSpeed || '',
      mileage: mongoDetails?.mileage || '',
      seating: mongoDetails?.seating || '',
      color: mongoDetails?.color || '',
      awards: mongoDetails?.awards ? mongoDetails.awards.join(', ') : '',
      safetyRating: mongoDetails?.safetyRating || '',
      achievements: {
        bestSellingYear: mongoDetails?.achievements?.bestSellingYear || '',
        motorsport: mongoDetails?.achievements?.motorsport ? mongoDetails.achievements.motorsport.join(', ') : '',
        popularFeatures: mongoDetails?.achievements?.popularFeatures ? mongoDetails.achievements.popularFeatures.join(', ') : '',
      },
      history: {
        launchYear: mongoDetails?.history?.launchYear || '',
        countryOfOrigin: mongoDetails?.history?.countryOfOrigin || '',
        famousUses: mongoDetails?.history?.famousUses ? mongoDetails.history.famousUses.join(', ') : '',
        specialEditions: mongoDetails?.history?.specialEditions ? mongoDetails.history.specialEditions.join(', ') : '',
        summary: mongoDetails?.history?.summary || '',
      },
      specifications: {
        dimensions: mongoDetails?.specifications?.dimensions || '',
        weight: mongoDetails?.specifications?.weight || '',
        fuelTankCapacity: mongoDetails?.specifications?.fuelTankCapacity || '',
        bootSpace: mongoDetails?.specifications?.bootSpace || '',
        groundClearance: mongoDetails?.specifications?.groundClearance || '',
      },
      galleryImages: mongoDetails?.galleryImages ? mongoDetails.galleryImages.join(', ') : '',
    };
  }

  // Load Firestore car & MongoDB details
  const loadData = async () => {
    setLoading(true);
    setErrorState(null);
    setErrorMessage('');

    try {
      // 1. Fetch Firestore base record (if available)
      const firestoreRes = await carService.getById(carId);
      let currentFirestoreCar = null;
      if (firestoreRes.success && firestoreRes.data) {
        currentFirestoreCar = firestoreRes.data;
        setCarDoc(currentFirestoreCar);
      }

      // 2. Fetch MongoDB extended details
      try {
        const mongoData = await fetchCarDetails(carId);
        setDetails(mongoData);
        setFormData(getInitialFormData(currentFirestoreCar, mongoData));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setDetails(null);
          setErrorState('404');
          setErrorMessage(err.response.data?.message || 'No details found for this car.');
        } else {
          console.error('Server error fetching car details:', err);
          setErrorState('500');
          setErrorMessage(err.response?.data?.message || 'Server error fetching car details.');
        }
      }
    } catch (err) {
      console.error('Error loading car:', err);
      setErrorState('500');
      setErrorMessage('Server error fetching car details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (carId) {
      loadData();
    }
  }, [carId]);

  function handleStartCreate() {
    setFormData(getInitialFormData(carDoc, null));
    setShowAdvancedForm(false);
    setErrorState(null);
    setMode('create');
  }

  function handleStartEdit() {
    setFormData(getInitialFormData(carDoc, details));
    setShowAdvancedForm(false);
    setMode('edit');
  }

  function handleCancelForm() {
    setActionStatus({ loading: false, success: null, error: null });
    setMode('view');
  }

  // Generic Form Handlers
  function handleTopChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleNestedChange(section, field, value) {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  // Submit Handler (Create or Update)
  async function handleSubmitForm(e) {
    e.preventDefault();
    setActionStatus({ loading: true, success: null, error: null });

    const payload = {
      manufacturer: formData.manufacturer,
      model: formData.model,
      variant: formData.variant,
      year: formData.year ? Number(formData.year) : undefined,
      engine: formData.engine,
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      horsepower: formData.horsepower ? Number(formData.horsepower) : undefined,
      topSpeed: formData.topSpeed ? Number(formData.topSpeed) : undefined,
      mileage: formData.mileage ? Number(formData.mileage) : undefined,
      seating: formData.seating ? Number(formData.seating) : undefined,
      color: formData.color,
      awards: formData.awards ? formData.awards.split(',').map((s) => s.trim()).filter(Boolean) : [],
      safetyRating: formData.safetyRating,
      achievements: {
        bestSellingYear: formData.achievements.bestSellingYear ? Number(formData.achievements.bestSellingYear) : undefined,
        motorsport: formData.achievements.motorsport ? formData.achievements.motorsport.split(',').map((s) => s.trim()).filter(Boolean) : [],
        popularFeatures: formData.achievements.popularFeatures ? formData.achievements.popularFeatures.split(',').map((s) => s.trim()).filter(Boolean) : [],
      },
      history: {
        launchYear: formData.history.launchYear ? Number(formData.history.launchYear) : undefined,
        countryOfOrigin: formData.history.countryOfOrigin,
        famousUses: formData.history.famousUses ? formData.history.famousUses.split(',').map((s) => s.trim()).filter(Boolean) : [],
        specialEditions: formData.history.specialEditions ? formData.history.specialEditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        summary: formData.history.summary,
      },
      specifications: {
        dimensions: formData.specifications.dimensions,
        weight: formData.specifications.weight ? Number(formData.specifications.weight) : undefined,
        fuelTankCapacity: formData.specifications.fuelTankCapacity ? Number(formData.specifications.fuelTankCapacity) : undefined,
        bootSpace: formData.specifications.bootSpace ? Number(formData.specifications.bootSpace) : undefined,
        groundClearance: formData.specifications.groundClearance ? Number(formData.specifications.groundClearance) : undefined,
      },
      galleryImages: formData.galleryImages ? formData.galleryImages.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      let savedDetails;
      if (mode === 'create') {
        savedDetails = await createCarDetails(carId, payload);
      } else {
        savedDetails = await updateCarDetails(carId, payload);
      }

      setDetails(savedDetails);
      setErrorState(null);
      setActionStatus({
        loading: false,
        success: mode === 'create' ? 'Car details created successfully!' : 'Car details updated successfully!',
        error: null,
      });
      setMode('view');
    } catch (err) {
      console.error('Error saving car details:', err);
      const apiErr = err.response?.data?.message || 'Server error updating car details.';
      setActionStatus({ loading: false, success: null, error: apiErr });
    }
  }

  // Delete Handler
  async function handleConfirmDelete() {
    setActionStatus({ loading: true, success: null, error: null });

    try {
      await deleteCarDetails(carId);
      setDetails(null);
      setIsDeleting(false);
      setErrorState('404');
      setErrorMessage('No details found for this car.');
      setActionStatus({
        loading: false,
        success: 'Car details removed from MongoDB successfully.',
        error: null,
      });
      setMode('view');
    } catch (err) {
      console.error('Error deleting car details:', err);
      const apiErr = err.response?.data?.message || 'Server error deleting car details.';
      setActionStatus({ loading: false, success: null, error: apiErr });
      setIsDeleting(false);
    }
  }

  // 1. Loading Spinner State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Fetching car details...</p>
      </div>
    );
  }

  // 2. Distinct 500 Server Error State
  if (errorState === '500' && mode === 'view') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-red-500/30 backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">500 - Server Error</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMessage || 'Server error fetching car details.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadData}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-slate-700 text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors text-sm"
            >
              Back to Garage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compute Display Headers & Attributes
  const manufacturerName = details?.manufacturer || carDoc?.make || 'Unknown Manufacturer';
  const modelName = details?.model || carDoc?.model || 'Car Details';
  const heroImage = carDoc?.imageUrl || details?.galleryImages?.[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop';
  const displayYear = details?.year || carDoc?.year || '';
  const displayFuel = details?.fuelType || 'N/A';
  const displayHP = details?.horsepower ? `${details.horsepower} HP` : 'N/A';
  const displayColor = details?.color || 'N/A';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium transition-all text-slate-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Garage
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              Car ID: {carId}
            </span>
          </div>
        </div>

        {/* Action Notifications */}
        {actionStatus.success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
            <p className="text-sm font-medium">{actionStatus.success}</p>
            <button onClick={() => setActionStatus((s) => ({ ...s, success: null }))} className="text-emerald-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}
        {actionStatus.error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-between">
            <p className="text-sm font-medium">{actionStatus.error}</p>
            <button onClick={() => setActionStatus((s) => ({ ...s, error: null }))} className="text-red-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* HERO SECTION */}
        <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md mb-8 p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
          <div className="w-full lg:w-1/2 h-72 sm:h-80 rounded-2xl overflow-hidden relative shadow-lg bg-slate-800">
            <img
              src={heroImage}
              alt={`${manufacturerName} ${modelName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  {manufacturerName}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Creator: <strong className="text-white">{carDoc?.ownerName || 'Driver'}</strong>
                </span>
              </div>

              {details && mode === 'view' && (
                <div className="flex gap-2">
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => setIsDeleting(true)}
                    className="px-4 py-1.5 rounded-xl bg-red-900/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold transition-all shadow-md"
                  >
                    Delete Details
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              {manufacturerName} {modelName}
            </h1>
            
            {details?.variant && (
              <p className="text-lg text-purple-400 font-semibold mb-4">
                {details.variant} {displayYear && `(${displayYear})`}
              </p>
            )}

            {/* Essential Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-4 mt-2">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Year</span>
                <span className="text-base font-bold text-white">{displayYear || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Fuel Type</span>
                <span className="text-base font-bold text-white">{displayFuel}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Horsepower</span>
                <span className="text-base font-bold text-white">{displayHP}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Color</span>
                <span className="text-base font-bold text-white">{displayColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Distinct 404 Not Found State (Section 4 & Contract 2.8) */}
        {errorState === '404' && mode === 'view' && (
          <div className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center flex flex-col items-center justify-center my-8">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No details found for this car.</h2>
            <p className="text-slate-400 text-sm max-w-md mb-6">
              No MongoDB details document exists matching car ID <span className="font-mono text-purple-300">{carId}</span>. You can create one now.
            </p>
            <button
              onClick={handleStartCreate}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg hover:scale-105"
            >
              Add Car Details
            </button>
          </div>
        )}

        {/* FORM VIEW: CREATE / EDIT (Section 3: Simplified Form) */}
        {(mode === 'create' || mode === 'edit') && (
          <form onSubmit={handleSubmitForm} className="space-y-6 my-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-purple-500/30 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {mode === 'create' ? 'Add Car Details' : 'Edit Car Details'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">MongoDB Document ID: <span className="font-mono text-purple-300">{carId}</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Essential Fields (Always Visible) */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">Essential Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => handleTopChange('manufacturer', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleTopChange('model', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleTopChange('year', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Fuel Type</label>
                    <input
                      type="text"
                      value={formData.fuelType}
                      onChange={(e) => handleTopChange('fuelType', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Horsepower</label>
                    <input
                      type="number"
                      value={formData.horsepower}
                      onChange={(e) => handleTopChange('horsepower', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Color</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleTopChange('color', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 Collapsible Toggle Button */}
              <div className="my-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedForm((prev) => !prev)}
                  className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl text-xs font-bold border border-purple-500/30 transition-all"
                >
                  {showAdvancedForm ? '▲ Hide extra details' : '▼ Add more details'}
                </button>
              </div>

              {/* Collapsed Advanced Fields */}
              {showAdvancedForm && (
                <div className="space-y-6 pt-4 border-t border-white/10">
                  
                  {/* Basic Advanced */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Variant</label>
                      <input
                        type="text"
                        value={formData.variant}
                        onChange={(e) => handleTopChange('variant', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Engine</label>
                      <input
                        type="text"
                        value={formData.engine}
                        onChange={(e) => handleTopChange('engine', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Transmission</label>
                      <input
                        type="text"
                        value={formData.transmission}
                        onChange={(e) => handleTopChange('transmission', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Top Speed (km/h)</label>
                      <input
                        type="number"
                        value={formData.topSpeed}
                        onChange={(e) => handleTopChange('topSpeed', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Mileage (km/l)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.mileage}
                        onChange={(e) => handleTopChange('mileage', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Seating Capacity</label>
                      <input
                        type="number"
                        value={formData.seating}
                        onChange={(e) => handleTopChange('seating', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Achievements & Recognition */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Achievements & Recognition</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Awards (comma separated)</label>
                        <input
                          type="text"
                          value={formData.awards}
                          onChange={(e) => handleTopChange('awards', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                          placeholder="e.g. Car of the Year 2023, Best Driver Car"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Safety Rating</label>
                        <input
                          type="text"
                          value={formData.safetyRating}
                          onChange={(e) => handleTopChange('safetyRating', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                          placeholder="e.g. 5 Star NCAP"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Best Selling Year</label>
                        <input
                          type="number"
                          value={formData.achievements.bestSellingYear}
                          onChange={(e) => handleNestedChange('achievements', 'bestSellingYear', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Motorsport Highlights (comma separated)</label>
                        <input
                          type="text"
                          value={formData.achievements.motorsport}
                          onChange={(e) => handleNestedChange('achievements', 'motorsport', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Specifications</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Dimensions</label>
                        <input
                          type="text"
                          value={formData.specifications.dimensions}
                          onChange={(e) => handleNestedChange('specifications', 'dimensions', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                          placeholder="4500mm x 1800mm x 1450mm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Weight (kg)</label>
                        <input
                          type="number"
                          value={formData.specifications.weight}
                          onChange={(e) => handleNestedChange('specifications', 'weight', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Fuel Tank Capacity (L)</label>
                        <input
                          type="number"
                          value={formData.specifications.fuelTankCapacity}
                          onChange={(e) => handleNestedChange('specifications', 'fuelTankCapacity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interesting Facts & History */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Interesting Facts & History</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Launch Year</label>
                        <input
                          type="number"
                          value={formData.history.launchYear}
                          onChange={(e) => handleNestedChange('history', 'launchYear', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Country of Origin</label>
                        <input
                          type="text"
                          value={formData.history.countryOfOrigin}
                          onChange={(e) => handleNestedChange('history', 'countryOfOrigin', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Summary / Description</label>
                      <textarea
                        rows={3}
                        value={formData.history.summary}
                        onChange={(e) => handleNestedChange('history', 'summary', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-purple-500 outline-none"
                        placeholder="Write a short historical overview or summary..."
                      />
                    </div>
                  </div>

                  {/* Gallery Image URLs */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="text-xs text-slate-400 block mb-1 uppercase font-semibold">Gallery Images (comma separated URLs)</label>
                    <input
                      type="text"
                      value={formData.galleryImages}
                      onChange={(e) => handleTopChange('galleryImages', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                      placeholder="https://image1.jpg, https://image2.jpg"
                    />
                  </div>

                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10 mt-6">
                <button
                  type="submit"
                  disabled={actionStatus.loading}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  {actionStatus.loading ? 'Saving...' : (mode === 'create' ? 'Save Details' : 'Update Details')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* DETAILS DISPLAY VIEW (Sections 2.8 & Section 4 Collapsible Display) */}
        {details && mode === 'view' && (
          <div className="space-y-8 my-8">

            {/* Toggle Section 4 details */}
            <div className="flex justify-center my-4">
              <button
                type="button"
                onClick={() => setExpandedView((prev) => !prev)}
                className="px-6 py-3 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-2xl text-sm font-bold border border-purple-500/40 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>{expandedView ? 'Hide details' : 'Show more details'}</span>
                <svg className={`w-4 h-4 transition-transform ${expandedView ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {expandedView && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Grid 1: Vehicle Information & Specifications Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Card 1: Vehicle Information */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Vehicle Information
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      <div><span className="text-slate-400 block text-xs">Manufacturer</span><span className="font-semibold text-white">{details.manufacturer || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Model</span><span className="font-semibold text-white">{details.model || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Variant</span><span className="font-semibold text-white">{details.variant || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Year</span><span className="font-semibold text-white">{details.year || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Engine</span><span className="font-semibold text-white">{details.engine || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Transmission</span><span className="font-semibold text-white">{details.transmission || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Fuel Type</span><span className="font-semibold text-white">{details.fuelType || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Horsepower</span><span className="font-semibold text-white">{details.horsepower ? `${details.horsepower} HP` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Top Speed</span><span className="font-semibold text-white">{details.topSpeed ? `${details.topSpeed} km/h` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Mileage</span><span className="font-semibold text-white">{details.mileage ? `${details.mileage} km/l` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Seating Capacity</span><span className="font-semibold text-white">{details.seating || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Color</span><span className="font-semibold text-white">{details.color || 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Card 2: Achievements & Recognition */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Achievements & Recognition
                    </h2>
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs mb-1">Awards</span>
                        {details.awards?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {details.awards.map((award, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                                🏆 {award}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-slate-500 italic">None specified</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 block text-xs">Safety Rating</span>
                          <span className="font-semibold text-white">{details.safetyRating || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs">Best Selling Year</span>
                          <span className="font-semibold text-white">{details.achievements?.bestSellingYear || 'N/A'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-xs mb-1">Motorsport Highlights</span>
                        {details.achievements?.motorsport?.length > 0 ? (
                          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                            {details.achievements.motorsport.map((m, idx) => (
                              <li key={idx}>{m}</li>
                            ))}
                          </ul>
                        ) : <span className="text-slate-500 text-xs italic">N/A</span>}
                      </div>

                      <div>
                        <span className="text-slate-400 block text-xs mb-1">Popular Features</span>
                        {details.achievements?.popularFeatures?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {details.achievements.popularFeatures.map((feat, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                                {feat}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-slate-500 text-xs italic">N/A</span>}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Grid 2: Specifications & Interesting Facts Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Card 3: Specifications */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Specifications
                    </h2>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      <div><span className="text-slate-400 block text-xs">Dimensions</span><span className="font-semibold text-white">{details.specifications?.dimensions || 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Weight</span><span className="font-semibold text-white">{details.specifications?.weight ? `${details.specifications.weight} kg` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Fuel Tank Capacity</span><span className="font-semibold text-white">{details.specifications?.fuelTankCapacity ? `${details.specifications.fuelTankCapacity} L` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Boot Space</span><span className="font-semibold text-white">{details.specifications?.bootSpace ? `${details.specifications.bootSpace} L` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 block text-xs">Ground Clearance</span><span className="font-semibold text-white">{details.specifications?.groundClearance ? `${details.specifications.groundClearance} mm` : 'N/A'}</span></div>
                    </div>
                  </div>

                  {/* Card 4: Interesting Facts */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Interesting Facts
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 block text-xs">Launch Year</span>
                          <span className="font-semibold text-white">{details.history?.launchYear || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-xs">Country of Origin</span>
                          <span className="font-semibold text-white">{details.history?.countryOfOrigin || 'N/A'}</span>
                        </div>
                      </div>

                      {details.history?.famousUses?.length > 0 && (
                        <div>
                          <span className="text-slate-400 block text-xs mb-1">Famous Uses</span>
                          <div className="flex flex-wrap gap-1.5">
                            {details.history.famousUses.map((use, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {details.history?.specialEditions?.length > 0 && (
                        <div>
                          <span className="text-slate-400 block text-xs mb-1">Special Editions</span>
                          <div className="flex flex-wrap gap-1.5">
                            {details.history.specialEditions.map((ed, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                                {ed}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {details.history?.summary && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-slate-400 block text-xs mb-1">Summary</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{details.history.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Section 5: Responsive Image Gallery */}
                {details.galleryImages?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Vehicle Image Gallery
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {details.galleryImages.map((imgUrl, idx) => (
                        <div key={idx} className="h-48 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 group relative">
                          <img
                            src={imgUrl}
                            alt={`Gallery asset ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* DELETE MODAL */}
        {isDeleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-800 border border-red-500/40 shadow-2xl text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Vehicle Details?</h3>
              <p className="text-slate-300 text-xs mb-6">
                This will delete only the extended MongoDB details document for car <span className="font-mono text-purple-300">{carId}</span>. Firebase primary car records remain untouched.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionStatus.loading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {actionStatus.loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
