'use client'

export function RecentPosts() {
  const recentPosts = [
    {
      id: 1,
      title: 'Getting Started with React',
      author: 'John Doe',
      authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      content: 'Learn the basics of React and start building modern web applications...',
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      title: 'Digital Marketing Tips',
      author: 'Jane Smith',
      authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      content: 'Essential digital marketing strategies for beginners...',
      likes: 18,
      comments: 5,
    },
    {
      id: 3,
      title: 'UI Design Principles',
      author: 'Mike Johnson',
      authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      content: 'Master the fundamentals of UI design with these key principles...',
      likes: 32,
      comments: 12,
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Recent Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={post.authorImage}
                    alt={post.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-500">{post.author}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{post.likes} Likes</span>
                  <span>{post.comments} Comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
