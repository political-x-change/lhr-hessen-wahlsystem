import { Suspense } from 'react';
import VotingForm from '@/components/VotingForm';

function VoteContent() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Abstimmung
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Wählen Sie Ihren Kandidaten
      </p>
      
      <VotingForm />
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Wichtige Hinweise:</h2>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Wählen Sie einen Kandidaten durch Klicken auf die Karte aus</li>
          <li>Sie können nur einmal abstimmen</li>
          <li>Ihre Stimme wird anonymisiert gespeichert</li>
        </ul>
      </div>
    </>
  );
}

export default function VotePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Suspense fallback={<div>Laden...</div>}>
            <VoteContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
