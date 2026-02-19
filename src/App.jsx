import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AchievementToastProvider } from './components/AchievementToast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import FeedScreen from './screens/FeedScreen';
import PlayScreen from './screens/PlayScreen';
import ProfileScreen from './screens/ProfileScreen';
import FriendsScreen from './screens/FriendsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import DirectScreen from './screens/DirectScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AdminScreen from './screens/AdminScreen';
import AdminEventsScreen from './screens/AdminEventsScreen';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/feed" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />

      {/* Private routes with layout */}
      <Route path="/feed" element={<PrivateRoute><Layout><FeedScreen /></Layout></PrivateRoute>} />
      <Route path="/play" element={<PrivateRoute><Layout><PlayScreen /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><ProfileScreen /></Layout></PrivateRoute>} />
      <Route path="/profile/:userId" element={<PrivateRoute><Layout><ProfileScreen /></Layout></PrivateRoute>} />
      <Route path="/friends" element={<PrivateRoute><Layout><FriendsScreen /></Layout></PrivateRoute>} />
      <Route path="/leaderboard" element={<PrivateRoute><Layout><LeaderboardScreen /></Layout></PrivateRoute>} />
      <Route path="/direct" element={<PrivateRoute><Layout><DirectScreen /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><NotificationsScreen /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><Layout><AdminScreen /></Layout></PrivateRoute>} />
      <Route path="/admin/events" element={<PrivateRoute><Layout><AdminEventsScreen /></Layout></PrivateRoute>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/feed" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AchievementToastProvider>
            <AppRoutes />
          </AchievementToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
