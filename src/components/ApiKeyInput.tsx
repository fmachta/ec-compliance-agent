import { useState } from 'react';

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
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            EC Compliance Agent
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            AI-powered export control contract analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-gray-700"
            >
              Gemini API Key
            </label>
            <div className="relative mt-1">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Continue
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          Your key is stored in browser memory only.
          <br />
          It is never saved, logged, or sent anywhere except directly to
          Google's API.
          <br />
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Get a free key at Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
}
