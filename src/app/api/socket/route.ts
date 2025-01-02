import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

declare global {
  var io: Server | undefined
}

const connectedUsers = new Map<string, string>()

// Initialize Socket.IO server if not already initialized
if (!global.io) {
  global.io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })
}

export async function GET() {
  // Ensure io is initialized
  const io = global.io
  if (!io) {
    return NextResponse.json(
      { error: 'Socket server not initialized' },
      { status: 500 }
    )
  }

  // Start server if not already listening
  if (!io.httpServer?.listening) {
    try {
      const port = parseInt(process.env.SOCKET_PORT || '3001')
      io.listen(port)
      console.log(`Socket server listening on port ${port}`)

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        socket.on('join', (userId: string) => {
          console.log('User joined:', userId)
          connectedUsers.set(userId, socket.id)
          socket.userId = userId
        })

        socket.on('private message', async (data) => {
          const recipientSocket = connectedUsers.get(data.recipientId)
          if (recipientSocket) {
            io.to(recipientSocket).emit('private message', {
              ...data,
              timestamp: new Date(),
            })
          }
        })

        // Video call events
        socket.on('call-user', async (data) => {
          console.log('Call user event:', data)
          const recipientSocket = connectedUsers.get(data.recipientId)
          if (recipientSocket) {
            console.log('Emitting incoming call to:', recipientSocket)
            io.to(recipientSocket).emit('incoming-call', {
              from: socket.userId,
              offer: data.offer,
              callerName: data.callerInfo.name,
              callerImage: data.callerInfo.image
            })
          } else {
            console.log('Recipient not found:', data.recipientId)
          }
        })

        socket.on('accept-call', (data) => {
          console.log('Accept call event:', data)
          const callerSocket = connectedUsers.get(data.callerId)
          if (callerSocket) {
            io.to(callerSocket).emit('call-accepted', {
              answer: data.answer,
              from: socket.userId
            })
          }
        })

        socket.on('reject-call', (data) => {
          console.log('Reject call event:', data)
          const callerSocket = connectedUsers.get(data.callerId)
          if (callerSocket) {
            io.to(callerSocket).emit('call-rejected', {
              from: socket.userId
            })
          }
        })

        socket.on('ice-candidate', (data) => {
          console.log('ICE candidate event:', data)
          const recipientSocket = connectedUsers.get(data.recipientId)
          if (recipientSocket) {
            io.to(recipientSocket).emit('ice-candidate', {
              candidate: data.candidate,
              from: socket.userId
            })
          }
        })

        socket.on('end-call', (data) => {
          console.log('End call event:', data)
          const recipientSocket = connectedUsers.get(data.recipientId)
          if (recipientSocket) {
            io.to(recipientSocket).emit('call-ended', {
              from: socket.userId
            })
          }
        })

        socket.on('disconnect', () => {
          if (socket.userId) {
            console.log('User disconnected:', socket.userId)
            connectedUsers.delete(socket.userId)
          }
        })
      })
    } catch (error) {
      console.error('Error starting socket server:', error)
      return NextResponse.json(
        { error: 'Failed to start socket server' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ status: 'Socket server running' })
}
