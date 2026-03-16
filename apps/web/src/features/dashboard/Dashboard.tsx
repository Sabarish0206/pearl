import { useAuthStore } from '../../stores/authStore';
import PortalLayout from '../../components/PortalLayout';
import StudentDashboard from '../student/StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';

export default function Dashboard() {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'STUDENT';

  return (
    <PortalLayout title="Dashboard">
      {isStudent ? <StudentDashboard /> : <RecruiterDashboard />}
    </PortalLayout>
  );
}
