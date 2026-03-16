import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, deleteJobReq } from '../../api/job.api';
import type { JobRequirementRow } from '@pearl/common';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PortalLayout from '../../components/PortalLayout';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import './JobListings.css';

export default function JobListings() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRequirementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job requirement?')) return;
    setDeletingId(id);
    try {
      await deleteJobReq(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success('Job deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PortalLayout title="Job Listings">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="jl-header">
        <div>
          <h2 className="jl-title">Job Listings</h2>
          <p className="jl-sub">{jobs.length} job requirement(s) posted</p>
        </div>
        <button className="jl-btn-add" onClick={() => navigate('/recruiter/jobs/new')}>
          <AddIcon fontSize="small" /> Post Job
        </button>
      </div>

      {loading ? (
        <div className="jl-loading"><div className="jl-spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="jl-empty">
          <p>No job listings yet.</p>
          <button className="jl-btn-add" onClick={() => navigate('/recruiter/jobs/new')}>+ Create First Job</button>
        </div>
      ) : (
        <div className="jl-grid">
          {jobs.map((job) => (
            <div key={job.id} className="jl-card">
              <div className="jl-card-header">
                <div>
                  <h3 className="jl-job-title">{job.title}</h3>
                  <p className="jl-company">{job.companyName}</p>
                </div>
                <span className={`jl-status ${job.isActive ? 'active' : 'closed'}`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>

              <p className="jl-description">{job.description.slice(0, 120)}{job.description.length > 120 ? '…' : ''}</p>

              <div className="jl-meta-row">
                {job.minCgpa != null && <span className="jl-meta-pill">Min CGPA: {job.minCgpa}</span>}
                {job.salaryLpa != null && <span className="jl-meta-pill green">₹{job.salaryLpa} LPA</span>}
                {job.deadline && <span className="jl-meta-pill orange">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                <span className="jl-meta-pill">{job.requiredSkills.length} skills</span>
              </div>

              <div className="jl-dept-row">
                {job.eligibleDepts.slice(0, 2).map((d, i) => <span key={i} className="jl-dept-chip">{d}</span>)}
                {job.eligibleDepts.length > 2 && <span className="jl-dept-chip more">+{job.eligibleDepts.length - 2} more</span>}
              </div>

              <div className="jl-card-actions">
                <button className="jl-shortlist-btn" onClick={() => navigate(`/recruiter/jobs/${job.id}/candidates`)}>
                  <PeopleIcon fontSize="small" /> View Shortlist
                </button>
                <button className="jl-delete-btn" onClick={() => handleDelete(job.id)} disabled={deletingId === job.id}>
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
