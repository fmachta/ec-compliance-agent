import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function SettingsModal({ apiKey, onSave, onClear, onClose }: Props) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="settings-key" className="text-sm font-medium">
              Gemini API Key
            </label>
            <div className="relative">
              <Input
                id="settings-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                const trimmed = key.trim();
                if (trimmed) {
                  sessionStorage.setItem('gemini_api_key', trimmed);
                  onSave(trimmed);
                }
              }}
              disabled={!key.trim()}
            >
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={onClear}
          >
            Remove Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Reusable gear icon SVG */
export function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
