import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  onSubmit: (key: string) => void;
}

export default function ApiKeyInput({ onSubmit }: Props) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem('gemini_api_key', trimmed);
      onSubmit(trimmed);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border-muted">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            EC Compliance Agent
          </CardTitle>
          <CardDescription className="text-base">
            AI-powered export control contract analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                Gemini API Key
              </label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showKey ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!key.trim()}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
            Your key is stored in browser memory only.
            <br />
            It is never saved, logged, or sent anywhere except directly to
            Google's API.
            <br />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Get a free key at Google AI Studio
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
