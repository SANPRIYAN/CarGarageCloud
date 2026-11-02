import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateCar, useDeleteCar } from '../../hooks/useCars';

export function CarCard({ car, currentUser }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);

  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();

  const currentUserId = currentUser?.sub || currentUser?.uid || currentUser?.id;
  // Strict ownership check: only the owner who posted the car can edit or delete
  const isOwner = Boolean(
    currentUserId && (
      car.ownerId === currentUserId ||
      car.garageId === currentUserId ||
      (car.ownerName && currentUser?.name && car.ownerName === currentUser.name && car.ownerName !== 'Dropbox Sync') ||
      (car.ownerName && currentUser?.email && car.ownerName === currentUser.email)
    )
  );
  
  // Fallback for older cars that might not have an ownerName
  const displayName = car.ownerName || 'Unknown User';

  const handleUpdate = async () => {
    if (!make.trim() || !model.trim()) return;
    const carId = car.id || car._id;
    await updateCar.mutateAsync({ carId, updates: { make, model } });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      await deleteCar.mutateAsync(car);
    }
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 flex flex-col">
      <div className="h-48 relative overflow-hidden bg-slate-800 flex-shrink-0">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-800 to-slate-900">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium tracking-wider uppercase">No photo yet</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
        
        {/* Creator Badge on Photo */}
        <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span className="text-[11px] font-semibold text-slate-200">
            Creator: <strong className="text-white">{car.ownerName || 'Driver'}</strong>
          </span>
        </div>
      </div>
      
      <div className="p-5 z-10 flex-grow flex flex-col justify-between">
        {isEditing ? (
          <div className="flex flex-col gap-2 mb-4">
            <input 
              value={make} 
              onChange={e => setMake(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 text-white rounded-lg px-3 py-1 text-sm focus:border-purple-500 outline-none"
              placeholder="Make"
            />
            <input 
              value={model} 
              onChange={e => setModel(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 text-white rounded-lg px-3 py-1 text-sm focus:border-purple-500 outline-none"
              placeholder="Model"
            />
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="font-extrabold text-2xl text-white tracking-tight group-hover:text-purple-300 transition-colors duration-300 drop-shadow-md">
              {car.make}
            </h3>
            <p className="text-slate-300 font-medium text-lg drop-shadow-md">{car.model}</p>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 mb-2">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Added by: <span className="text-purple-300 font-medium">{car.ownerName || 'Driver'}</span></span>
            </div>
            
            <button 
              onClick={() => navigate(`/car/${car.id}`)}
              className="mt-3 w-full py-2 px-4 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600 hover:to-blue-600 text-purple-200 hover:text-white border border-purple-500/30 flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        )}

        {isOwner && (
          <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
            {isEditing ? (
              <>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Save
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setMake(car.make); setModel(car.model); }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-1.5 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 bg-red-900/30 hover:bg-red-500 text-red-400 hover:text-white py-1.5 rounded-lg text-sm font-semibold transition-colors border border-red-900/50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
