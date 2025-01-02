'use client'

export function FeaturedSkills() {
  const featuredSkills = [
    {
      id: 1,
      name: 'Web Development',
      description: 'Learn modern web development technologies',
      teacherCount: 15,
      learnerCount: 45,
    },
    {
      id: 2,
      name: 'Digital Marketing',
      description: 'Master digital marketing strategies',
      teacherCount: 8,
      learnerCount: 32,
    },
    {
      id: 3,
      name: 'Graphic Design',
      description: 'Create stunning visual designs',
      teacherCount: 12,
      learnerCount: 38,
    },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
              <p className="text-gray-600 mb-4">{skill.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{skill.teacherCount} Teachers</span>
                <span>{skill.learnerCount} Learners</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
