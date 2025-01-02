export function Hero() {
  return (
    <div className="text-center space-y-6 py-12">
      <h1 className="text-4xl font-bold">
        Share Your Skills, Learn from Others
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Connect with people who want to learn what you know, and learn from those who have the skills you want to acquire.
      </p>
      <div className="flex justify-center gap-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Start Teaching
        </button>
        <button className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50">
          Start Learning
        </button>
      </div>
    </div>
  )
}
