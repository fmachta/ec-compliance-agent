import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SampleContracts from './SampleContracts';

interface Props {
  onUpload: (file: File) => void;
  onSampleSelect: (text: string, label: string) => void;
}

export default function Upload({ onUpload, onSampleSelect }: Props) {
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

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { 'application/pdf': ['.pdf'] },
      maxFiles: 1,
      multiple: false,
      maxSize: 10 * 1024 * 1024,
    });

  const rootProps = getRootProps();

  // Intercept drops: if it's a sample contract (text data), handle it directly.
  // Otherwise pass through to react-dropzone's handler.
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const text = e.dataTransfer.getData('text/plain');
      const label = e.dataTransfer.getData('application/x-sample-contract');
      if (text && label) {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        onSampleSelect(text, label);
      }
      // For real files, react-dropzone's rootProps.onDrop handles it
    },
    [onSampleSelect],
  );

  const rejectionError =
    fileRejections.length > 0
      ? fileRejections[0].errors[0]?.message || 'Invalid file'
      : null;

  const displayError = error || rejectionError;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="shadow-xl border-muted">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Upload Contract</CardTitle>
            <CardDescription>
              Drag and drop an export control contract, or pick a sample below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...rootProps}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                isDragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-3">
                <div className="text-5xl">📄</div>
                {isDragActive ? (
                  <p className="text-lg font-medium text-primary">
                    Drop here to analyze...
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      Drop a PDF here, or drag a sample from below
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse your files
                    </p>
                  </>
                )}
              </div>
            </div>

            {displayError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {displayError}
              </div>
            )}
          </CardContent>
        </Card>

        <SampleContracts onSelect={onSampleSelect} />
      </div>
    </div>
  );
}
