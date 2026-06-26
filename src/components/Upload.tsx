import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
}

export default function Upload({ onUpload }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError(null);

      const file = accepted[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be under 10 MB.');
        return;
      }

      onUpload(file);
    },
    [onUpload],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  // Show rejection errors
  const rejectionError =
    fileRejections.length > 0
      ? fileRejections[0].errors[0]?.message || 'Invalid file'
      : null;

  const displayError = error || rejectionError;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-4">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="text-5xl">📄</div>
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">
                Drop your contract here...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  Drag & drop your export contract PDF
                </p>
                <p className="text-sm text-gray-400">or click to browse</p>
              </>
            )}
          </div>
        </div>

        {displayError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {displayError}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Upload a single-page export control contract (PDF, max 10 MB).
          <br />
          Your document is processed locally in the browser and sent to Gemini
          for analysis.
        </p>
      </div>
    </div>
  );
}
