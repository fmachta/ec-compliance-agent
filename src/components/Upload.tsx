import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: { 'application/pdf': ['.pdf'] },
      maxFiles: 1,
      multiple: false,
      maxSize: 10 * 1024 * 1024,
    });

  const rejectionError =
    fileRejections.length > 0
      ? fileRejections[0].errors[0]?.message || 'Invalid file'
      : null;

  const displayError = error || rejectionError;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-xl border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Upload Contract</CardTitle>
          <CardDescription>
            Drag and drop your export control contract (PDF)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
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
                  Drop your contract here...
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium">
                    Drag & drop your export contract PDF
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
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

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Your document is processed locally in the browser and analyzed by
            Gemini Flash Lite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
