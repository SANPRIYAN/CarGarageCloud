import { Routes, Route } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
import { AddCarForm } from './features/cars/AddCarForm';
import { CarList } from './features/cars/CarList';
import { CarDetailsPage } from './pages/CarDetailsPage';

function GarageHome({ user }) {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-blue-400">
          Personal Garage
        </h1>
        <p className="text-slate-400 mt-1 font-medium">
          Welcome back, <span className="text-purple-300 font-semibold">{user?.displayName || user?.name || 'Driver'}</span>. Manage your vehicle collection.
        </p>
      </div>

      {/* Main Garage Layout */}
      <main className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-1/3 xl:w-1/4 sticky top-24">
          <AddCarForm user={user} />
        </aside>
        <section className="w-full lg:w-2/3 xl:w-3/4">
          <CarList user={user} />
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      {({ user, logout }) => (
        <Routes>
          <Route path="/" element={<GarageHome user={user} />} />
          <Route path="/car/:carId" element={<CarDetailsPage user={user} />} />
          <Route path="/car/:carId/details" element={<CarDetailsPage user={user} />} />
        </Routes>
      )}
    </AuthWrapper>
  );
}

export default App;
