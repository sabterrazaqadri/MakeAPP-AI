import InputForm from "./components/InputForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-700">
          AI App Generator
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Type in simple English to generate a frontend app using React + Tailwind CSS
        </p>
        <InputForm />
        <p className="text-sm text-gray-500 mt-3">
          <strong>Examples:</strong><br />
          - Create a portfolio with hero, about, and contact section<br />
          - Build a landing page for a bakery with 3 menu items
        </p>
      </div>
    </main>
  );
}
