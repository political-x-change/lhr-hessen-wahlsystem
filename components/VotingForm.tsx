'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VotingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Kein gültiger Token gefunden. Bitte verwenden Sie den Link aus Ihrer E-Mail.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, candidateName, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten');
      } else {
        setMessage(data.message);
        setVoted(true);
        setCandidateName('');
        setDescription('');
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (voted) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold">{message}</p>
          <p className="mt-2">Sie werden in wenigen Sekunden weitergeleitet...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
        {error || 'Laden...'}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-2">
          Name des Kandidaten / der Kandidatin
        </label>
        <input
          type="text"
          id="candidateName"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="z.B. Leo G."
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Format: &quot;Vorname N.&quot; (z.B. &quot;Leo G.&quot;, &quot;Maria K.&quot;)
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Beschreibung
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={140}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          placeholder="Kurze Beschreibung des Kandidaten / der Kandidatin (max. 140 Zeichen)"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {description.length}/140 Zeichen
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Wird gesendet...' : 'Stimme abgeben'}
      </button>
    </form>
  );
}
