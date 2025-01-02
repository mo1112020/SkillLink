'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { predefinedAvatars, predefinedSkills } from '@/data/predefined'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(session?.user?.name || '')
  const [bio, setBio] = useState('')
  const [skillsToShare, setSkillsToShare] = useState('')
  const [skillsToLearn, setSkillsToLearn] = useState('')
  const [profileImage, setProfileImage] = useState(session?.user?.image || '')
  const [showAvatarSelection, setShowAvatarSelection] = useState(false)
  const [showSkillsModal, setShowSkillsModal] = useState(false)
  const [selectedSkillType, setSelectedSkillType] = useState<'share' | 'learn'>('share')
  const [selectedCategory, setSelectedCategory] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return
      try {
        const response = await fetch(`/api/users/${session.user.id}`)
        if (!response.ok) throw new Error('Failed to fetch user data')
        
        const userData = await response.json()
        setName(userData.name || '')
        setBio(userData.bio || '')
        setSkillsToShare(userData.skillsToShare?.map((skill: any) => skill.name).join(', ') || '')
        setSkillsToLearn(userData.skillsToLearn?.map((skill: any) => skill.name).join(', ') || '')
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Error loading user data')
        setLoading(false)
      }
    }
    fetchUserData()
  }, [session])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      setProfileImage(data.url)
      setShowAvatarSelection(false)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error uploading image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
          skillsToShare: skillsToShare
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill)
            .map(name => ({ name })),
          skillsToLearn: skillsToLearn
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill)
            .map(name => ({ name })),
          image: profileImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Update failed')
      }
      
      const updatedUser = await response.json()
      
      await update({
        ...session,
        user: {
          ...session.user,
          name,
          image: profileImage,
        },
      })

      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Error updating settings')
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const selectPredefinedAvatar = (url: string) => {
    setProfileImage(url)
    setShowAvatarSelection(false)
  }

  const addSkill = (skill: string) => {
    if (selectedSkillType === 'share') {
      const skills = new Set(skillsToShare.split(',').map(s => s.trim()).filter(s => s))
      skills.add(skill)
      setSkillsToShare(Array.from(skills).join(', '))
    } else {
      const skills = new Set(skillsToLearn.split(',').map(s => s.trim()).filter(s => s))
      skills.add(skill)
      setSkillsToLearn(Array.from(skills).join(', '))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Profile Image Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAvatarSelection(prev => !prev)}
                className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Choose Avatar
              </button>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 block"
                >
                  Upload New
                </label>
              </div>
            </div>
          </div>
          
          {/* Predefined Avatars Modal */}
          {showAvatarSelection && (
            <div className="mt-4 grid grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow">
              {predefinedAvatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => selectPredefinedAvatar(avatar.url)}
                  className="relative h-20 w-20 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition-colors"
                >
                  <Image
                    src={avatar.url}
                    alt={avatar.alt}
                    width={80}
                    height={80}
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name and Bio */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="skillsToShare" className="block text-sm font-medium text-gray-700">Skills to Share</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                id="skillsToShare"
                value={skillsToShare}
                onChange={(e) => setSkillsToShare(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedSkillType('share')
                  setShowSkillsModal(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="skillsToLearn" className="block text-sm font-medium text-gray-700">Skills to Learn</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                id="skillsToLearn"
                value={skillsToLearn}
                onChange={(e) => setSkillsToLearn(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedSkillType('learn')
                  setShowSkillsModal(true)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Skills Selection Modal */}
        {showSkillsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Select Skills to {selectedSkillType === 'share' ? 'Share' : 'Learn'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSkillsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Category Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(predefinedSkills).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`p-2 text-sm rounded-md ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                {selectedCategory && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                    {predefinedSkills[selectedCategory as keyof typeof predefinedSkills].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="p-2 text-sm bg-gray-50 rounded-md hover:bg-gray-100"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
