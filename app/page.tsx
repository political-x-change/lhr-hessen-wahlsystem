import RegisterForm from '@/components/RegisterForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            LHR Hessen Wahlsystem
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Registrieren Sie sich für die Abstimmung
          </p>
          
          <RegisterForm />
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Diese Anwendung erfüllt die Anforderungen der DSGVO. 
              Ihre Daten werden sicher und anonymisiert verarbeitet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
