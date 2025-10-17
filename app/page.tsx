import RegisterForm from "@/components/RegisterForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-gray-200 py-8 px-4 lg:p-8 flex flex-col items-center">
          <img src="/lhr.png" alt="Logo des Landesheimrats Hessen" />
          <h1 className="text-3xl font-bold text-gray-900 my-2 text-center">
            Herzlich Willkommen
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Nimm an der Landesheimratswahl {new Date().getFullYear()} teil,
            indem du dich hier registrierst.
          </p>

          <RegisterForm />

          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-row w-full text-sm text-gray-500 gap-2 justify-center">
            Made with ❤️ by Political X Change
            <img
              src="/poxc.webp"
              alt="Political X Change Logo"
              className="mix-blend-multiply"
              width={20}
              height={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
