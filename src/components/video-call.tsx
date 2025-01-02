'use client'

import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { X, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface VideoCallProps {
  socket: Socket
  recipientId: string
  recipientName: string
  recipientImage: string
  onClose: () => void
  isIncoming: boolean
  incomingSignal?: any
}

export default function VideoCall({
  socket,
  recipientId,
  recipientName,
  recipientImage,
  onClose,
  isIncoming,
  incomingSignal,
}: VideoCallProps) {
  const { data: session } = useSession()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const startCall = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        localStreamRef.current = stream

        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Create peer connection
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        const peer = new RTCPeerConnection(configuration)
        peerRef.current = peer

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          if (localStreamRef.current) {
            peer.addTrack(track, localStreamRef.current)
          }
        })

        // Handle incoming tracks
        peer.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        // Handle ICE candidates
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              recipientId: recipientId,
              candidate: event.candidate,
            })
          }
        }

        // Handle incoming call
        if (isIncoming && incomingSignal) {
          await peer.setRemoteDescription(new RTCSessionDescription(incomingSignal))
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)
          socket.emit('accept-call', {
            callerId: recipientId,
            answer: answer,
          })
        } else {
          // Create and send offer for outgoing call
          const offer = await peer.createOffer()
          await peer.setLocalDescription(offer)
          socket.emit('call-user', {
            recipientId: recipientId,
            offer: offer,
            callerInfo: {
              name: session?.user?.name || 'Unknown',
              image: session?.user?.image || '/images/unknown.png',
            },
          })
        }

        // Listen for ICE candidates
        socket.on('ice-candidate', async ({ candidate }) => {
          try {
            if (peerRef.current) {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
            }
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        })

        // Listen for call accepted
        socket.on('call-accepted', async ({ answer }) => {
          try {
            if (peerRef.current) {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
            }
          } catch (error) {
            console.error('Error setting remote description:', error)
          }
        })

        // Listen for call rejected
        socket.on('call-rejected', () => {
          cleanupCall()
          onClose()
        })

        // Listen for call ended
        socket.on('call-ended', () => {
          cleanupCall()
          onClose()
        })
      } catch (error) {
        console.error('Error starting call:', error)
        onClose()
      }
    }

    startCall()

    return () => cleanupCall()
  }, [socket, recipientId, isIncoming, incomingSignal, session?.user?.name, session?.user?.image, onClose])

  const cleanupCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close()
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-3 py-2 md:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <img
            src={recipientImage}
            alt={recipientName}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full"
          />
          <span className="text-white font-medium text-sm md:text-base">{recipientName}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 p-1 md:p-2"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Video container */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote video (full screen) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-16 md:bottom-4 right-2 md:right-4 w-28 md:w-48 aspect-[4/3] bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-2 py-3 md:p-4 flex justify-center items-center space-x-3 md:space-x-4">
        <button
          onClick={toggleMute}
          className={`p-2 md:p-3 rounded-full ${
            isMuted ? 'bg-red-500' : 'bg-gray-700'
          } transition-colors active:scale-95 transform`}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-2 md:p-3 rounded-full ${
            isVideoOff ? 'bg-red-500' : 'bg-gray-700'
          } transition-colors active:scale-95 transform`}
        >
          {isVideoOff ? (
            <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 md:p-3 rounded-full bg-red-500 transition-colors hover:bg-red-600 active:scale-95 transform"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
