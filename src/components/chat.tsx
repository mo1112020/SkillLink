'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { io, Socket } from 'socket.io-client'
import { Send, X, Loader2, ArrowLeft, Video, PhoneIncoming } from 'lucide-react'
import VideoCall from './video-call'
import { callRingSound, callEndSound } from '@/utils/sound'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    image: string
  }
  receiver: {
    _id: string
    name: string
    image: string
  }
  content: string
  createdAt: string
}

interface ChatProps {
  recipientId: string
  onClose: () => void
}

export default function Chat({ recipientId, onClose }: ChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [recipient, setRecipient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState<{ offer: any } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    setSocket(socketInstance)

    // Join private room
    if (session?.user?.id) {
      socketInstance.emit('join', session.user.id)
    }

    // Listen for new messages
    socketInstance.on('private message', (message: Message) => {
      if (message.sender._id === recipientId || message.receiver._id === recipientId) {
        setMessages(prev => [...prev, message])
      }
    })

    // Listen for incoming calls
    socketInstance.on('incoming-call', ({ from, offer }) => {
      if (from === recipientId) {
        setIncomingCall({ offer })
        // Start playing ring sound
        callRingSound.play()
      }
    })

    // Listen for call ended
    socketInstance.on('call-ended', () => {
      setIsInCall(false)
      setIncomingCall(null)
      // Stop ring sound and play end sound
      callRingSound.stop()
      callEndSound.play()
    })

    return () => {
      socketInstance.disconnect()
      // Cleanup sounds
      callRingSound.stop()
    }
  }, [session?.user?.id, recipientId])

  useEffect(() => {
    // Fetch recipient details
    const fetchRecipient = async () => {
      try {
        const response = await fetch(`/api/users/${recipientId}`)
        if (!response.ok) throw new Error('Failed to fetch recipient')
        const data = await response.json()
        setRecipient(data)
      } catch (error) {
        console.error('Error fetching recipient:', error)
      }
    }

    // Fetch chat history
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?recipientId=${recipientId}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    if (recipientId) {
      fetchRecipient()
      fetchMessages()
    }
  }, [recipientId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach(message => {
      const date = new Date(message.createdAt)
      const dateKey = date.toLocaleDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    return groups
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !session?.user?.id || sending) return

    try {
      setSending(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: recipientId,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      const message = await response.json()
      
      // Emit message to recipient
      socket.emit('private message', {
        ...message,
        recipientId,
      })

      setMessages(prev => [...prev, message])
      setNewMessage('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const startVideoCall = () => {
    if (!socket) return
    console.log('Starting video call with:', recipientId)
    setIsInCall(true)
    socket.emit('call-user', {
      recipientId,
      callerInfo: {
        name: session?.user?.name || 'Unknown',
        image: session?.user?.image || '/images/unknown.png',
      }
    })
  }

  const acceptCall = () => {
    callRingSound.stop()
    setIsInCall(true)
  }

  const rejectCall = () => {
    if (socket && incomingCall) {
      callRingSound.stop()
      socket.emit('reject-call', { recipientId })
      setIncomingCall(null)
    }
  }

  const endVideoCall = () => {
    callRingSound.stop()
    callEndSound.play()
    setIsInCall(false)
    setIncomingCall(null)
  }

  if (!recipient) return null

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex items-center">
            <Image
              src={recipient?.image || '/images/unknown.png'}
              alt={recipient?.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-3">
              <h3 className="font-semibold">{recipient?.name}</h3>
              {recipient?.isOnline && (
                <p className="text-xs text-green-500">Online</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={startVideoCall}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Start video call"
          >
            <Video className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, groupMessages]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {new Date(date).toLocaleDateString([], { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="space-y-2">
                  {groupMessages.map((message) => (
                    <div
                      key={`${message._id}-${message.createdAt}`}
                      className={`flex items-end space-x-2 ${
                        message.sender._id === session?.user?.id ? 'justify-end' : ''
                      }`}
                    >
                      {message.sender._id !== session?.user?.id && (
                        <div className="flex-shrink-0 w-7">
                          <Image
                            src={message.sender.image || '/images/unknown.png'}
                            alt={message.sender.name}
                            width={28}
                            height={28}
                            className="rounded-full mb-1"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          message.sender._id === session?.user?.id
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white border rounded-bl-none'
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap">{message.content}</p>
                        <span 
                          className={`text-xs mt-1 block ${
                            message.sender._id === session?.user?.id 
                              ? 'text-blue-100' 
                              : 'text-gray-400'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            ref={inputRef}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      {/* Video Call Modal */}
      {isInCall && socket && (
        <VideoCall
          socket={socket}
          recipientId={recipientId}
          recipientName={recipient.name}
          recipientImage={recipient.image}
          onClose={endVideoCall}
          isIncoming={!!incomingCall}
          incomingSignal={incomingCall?.offer}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <Image
                  src={recipient.image || '/images/unknown.png'}
                  alt={recipient.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-full">
                  <PhoneIncoming className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{recipient.name}</h3>
                <p className="text-gray-500">Incoming video call...</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={rejectCall}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
