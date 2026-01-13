import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white">
            xolinks.me
          </h1>
          <p className="text-2xl text-gray-300">
            Your personalized link-in-bio platform
          </p>
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Create a beautiful page with all your important links. Share one link everywhere.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          No credit card required
        </p>
      </div>
    </div>
  );
}
