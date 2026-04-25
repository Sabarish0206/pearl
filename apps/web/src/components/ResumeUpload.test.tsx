import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeUpload from './ResumeUpload';

// Helper to create a mock file
const createFile = (name: string, type: string, size = 1000) => {
  const file = new File(['resume'], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
};

describe('ResumeUpload UI', () => {
  const apiUrl = '/mock-upload';
  const originalXMLHttpRequest = globalThis.XMLHttpRequest;
  let mockXhr;

  const getHiddenFileInput = (): HTMLInputElement => {
    const selectBtn = screen.getByRole('button', { name: /select file/i });
    const input = selectBtn.parentElement?.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (!input) throw new Error('Hidden file input not found near Select File button');
    return input;
  };
  beforeEach(() => {
    // Mock XMLHttpRequest for upload progress simulation
    mockXhr = jest.fn(() => ({
      open: jest.fn(),
      send: jest.fn(function () { this.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 }); this.status = 200; this.responseText = JSON.stringify({ url: 'uploaded-url.pdf' }); setTimeout(() => this.onload(), 0); }),
      setRequestHeader: jest.fn(),
      upload: {},
      onload: null,
      onerror: null,
    }));
    // @ts-expect-error - Assigning mock to globalThis.XMLHttpRequest which TypeScript doesn't recognize
    globalThis.XMLHttpRequest = mockXhr;
  });
  afterEach(() => {
    globalThis.XMLHttpRequest = originalXMLHttpRequest;
    jest.clearAllMocks();
  });

  it('renders drag-drop and button', () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select File/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Resume/i })).toBeInTheDocument();
  });

  it('selects a valid PDF file', async () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    // Simulate file input
    const fileInput = getHiddenFileInput();
    const file = createFile('resume.pdf', 'application/pdf', 1024);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText(/KB/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove file/i })).toBeInTheDocument();
  });

  it('rejects bad file type', async () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    const fileInput = getHiddenFileInput();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [createFile('invalid.png', 'image/png')] } });
    });
    expect(await screen.findByText(/File type not allowed/)).toBeInTheDocument();
    expect(screen.queryByText('invalid.png')).not.toBeInTheDocument();
  });

  it('rejects file over 4 MB', async () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    const bigFile = createFile('big.pdf', 'application/pdf', 5 * 1024 * 1024);
    const fileInput = getHiddenFileInput();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });
    expect(await screen.findByText(/File size exceeds 4 MB/)).toBeInTheDocument();
  });

  it('fires upload and calls onUploadComplete on success', async () => {
    const callback = jest.fn();
    render(<ResumeUpload uploadUrl={apiUrl} studentId={42} onUploadComplete={callback} />);
    const file = createFile('resume.doc', 'application/msword');
    const fileInput = getHiddenFileInput();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Upload Resume/i }));
    });
    // Upload UI is async; depending on timing, it may jump straight to success.
    expect(
      await screen.findByText((content) => /Uploading\.{3}|Resume uploaded successfully\./i.test(content))
    ).toBeInTheDocument();
    await waitFor(() => expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      fileName: 'resume.doc', studentId: 42, uploadedUrl: 'uploaded-url.pdf'
    })));
    expect(await screen.findByText(/success/i)).toBeInTheDocument();
  });

  it('removes a file after adding', async () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    const file = createFile('resume.pdf', 'application/pdf');
    const fileInput = getHiddenFileInput();
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Remove file/i }));
    expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument();
  });

  it('handles drag & drop', async () => {
    render(<ResumeUpload uploadUrl={apiUrl} />);
    const dropArea = screen.getByRole('region', { name: 'Upload Resume' });
    const file = createFile('resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    await act(async () => {
      fireEvent.drop(dropArea, {
        dataTransfer: {
          files: [file],
        },
      });
    });
    expect(screen.getByText('resume.docx')).toBeInTheDocument();
  });
});
