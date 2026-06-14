import DashboardLayout from '../layout/DashboardLayout';
import Loader from './Loader';

/** Keeps sidebar/nav visible while page data or chunks load. */
export default function PageLoader({ role = 'applicant' }) {
  return (
    <DashboardLayout role={role}>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader />
      </div>
    </DashboardLayout>
  );
}
