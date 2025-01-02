'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import { callRingSound, callEndSound } from '@/utils/sound'
import dynamic from 'next/dynamic'
import { useCallStore } from '@/store/call-store'

// Dynamically import VideoCall component
const VideoCall = dynamic(() => import('./video-call'), {
  ssr: false,
})

let socket: Socket | null = null

export default function CallHandler() {
  const { data: session } = useSession()
  const { isInCall, incomingCall, setIsInCall, setIncomingCall, resetCall } = useCallStore()

  useEffect(() => {
    if (!session?.user?.id) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    console.log('Connecting to socket URL:', socketUrl)
    
    try {
      socket = io(socketUrl)

      // Join private room
      socket.emit('join', session.user.id)
      console.log('Joined room with user ID:', session.user.id)

      // Listen for incoming calls
      socket.on('incoming-call', ({ from, offer, callerName, callerImage }) => {
        console.log('Incoming call from:', callerName)
        setIncomingCall({ from, offer, callerName, callerImage })
        callRingSound.play()
      })

      // Listen for call ended
      socket.on('call-ended', () => {
        console.log('Call ended')
        resetCall()
        callRingSound.stop()
        callEndSound.play()
      })

      socket.on('connect', () => {
        console.log('Socket connected')
      })

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

    } catch (error) {
      console.error('Socket setup error:', error)
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
      callRingSound.stop()
    }
  }, [session?.user?.id, setIncomingCall, resetCall])

  const acceptCall = () => {
    if (!incomingCall || !socket) return
    console.log('Accepting call from:', incomingCall.callerName)
    callRingSound.stop()
    setIsInCall(true)
    socket.emit('accept-call', { 
      callerId: incomingCall.from,
      answer: {} // Your WebRTC answer will go here
    })
  }

  const rejectCall = () => {
    if (!incomingCall || !socket) return
    console.log('Rejecting call from:', incomingCall.callerName)
    callRingSound.stop()
    socket.emit('reject-call', { callerId: incomingCall.from })
    resetCall()
  }

  const endCall = () => {
    if (!incomingCall || !socket) return
    console.log('Ending call with:', incomingCall.callerName)
    callRingSound.stop()
    callEndSound.play()
    socket.emit('end-call', { recipientId: incomingCall.from })
    resetCall()
  }

  if (!incomingCall && !isInCall) return null

  if (isInCall && socket && incomingCall) {
    return (
      <VideoCall
        socket={socket}
        recipientId={incomingCall.from}
        recipientName={incomingCall.callerName}
        recipientImage={incomingCall.callerImage}
        onClose={endCall}
        isIncoming={true}
        incomingSignal={incomingCall.offer}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Image
              src={incomingCall?.callerImage || '/images/unknown.png'}
              alt={incomingCall?.callerName || 'Caller'}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-500 p-2 rounded-full animate-pulse">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{incomingCall?.callerName || 'Unknown'}</h3>
            <p className="text-gray-500">Incoming video call...</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={rejectCall}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCall}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
