import { Suspense } from 'react';
import VotingForm from '@/components/VotingForm';

function VoteContent() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Abstimmung
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Geben Sie Ihre Stimme ab
      </p>
      
      <VotingForm />
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-2">Wichtige Hinweise:</h2>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Der Name muss im Format &quot;Vorname N.&quot; eingegeben werden (z.B. &quot;Leo G.&quot;)</li>
          <li>Die Beschreibung darf maximal 140 Zeichen lang sein</li>
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
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Suspense fallback={<div>Laden...</div>}>
            <VoteContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
