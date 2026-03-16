import ResumeUpload from '../../components/ResumeUpload';

export default function ResumeUploadDemo() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Resume Upload Component Demo</h1>
      <ResumeUpload 
        uploadUrl="/api/upload" 
        studentId="test-student-123"
        onUploadComplete={(result) => {
          console.log('Upload complete:', result);
          if (result?.error) {
            alert('Error: ' + result.error);
          } else {
            alert('Success! File: ' + result?.fileName);
          }
        }}
      />
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Demo Info</h3>
        <p>This is a demo page showing the ResumeUpload component.</p>
        <p><strong>Upload URL:</strong> /api/upload</p>
        <p><strong>Student ID:</strong> test-student-123</p>
      </div>
    </div>
  );
}
