'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Candidate {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
}

export default function VotingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
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

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/candidates');
        const data = await response.json();
        
        if (response.ok) {
          setCandidates(data.candidates);
        } else {
          setError('Fehler beim Laden der Kandidaten');
        }
      } catch {
        setError('Netzwerkfehler beim Laden der Kandidaten');
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedCandidateId) {
      setError('Bitte wählen Sie einen Kandidaten aus');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, candidateId: selectedCandidateId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten');
      } else {
        setMessage(data.message);
        setVoted(true);
        
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

  if (loadingCandidates) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Kandidaten werden geladen...</p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center">
        Keine Kandidaten verfügbar
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Wählen Sie einen Kandidaten:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidateId(candidate.id)}
              className={`
                cursor-pointer rounded-lg border-2 p-4 transition-all
                ${
                  selectedCandidateId === candidate.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {candidate.image_url && (
                <div className="mb-3 w-full h-32 bg-gray-200 rounded-lg overflow-hidden relative">
                  <Image
                    src={candidate.image_url}
                    alt={candidate.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {candidate.name}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {candidate.description}
              </p>
              
              {selectedCandidateId === candidate.id && (
                <div className="mt-3 flex items-center text-blue-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Ausgewählt</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !token || !selectedCandidateId}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Wird gesendet...' : 'Stimme abgeben'}
      </button>
    </form>
  );
}
