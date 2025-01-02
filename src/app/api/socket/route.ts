import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

const connectedUsers = new Map<string, string>()

if (!global.io) {
  global.io = new Server({
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })
}

export async function GET() {
  if (!global.io.httpServer?.listening) {
    const port = parseInt(process.env.SOCKET_PORT || '3001')
    global.io.listen(port)

    global.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join', (userId: string) => {
        console.log('User joined:', userId)
        connectedUsers.set(userId, socket.id)
        socket.userId = userId
      })

      socket.on('private message', async (data) => {
        const recipientSocket = connectedUsers.get(data.recipientId)
        if (recipientSocket) {
          global.io.to(recipientSocket).emit('private message', data)
        }
      })

      // Video call events
      socket.on('call-user', async (data) => {
        console.log('Call user event:', data)
        const recipientSocket = connectedUsers.get(data.recipientId)
        if (recipientSocket) {
          console.log('Emitting incoming call to:', recipientSocket)
          global.io.to(recipientSocket).emit('incoming-call', {
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
          global.io.to(callerSocket).emit('call-accepted', {
            answer: data.answer,
            from: socket.userId
          })
        }
      })

      socket.on('reject-call', (data) => {
        console.log('Reject call event:', data)
        const callerSocket = connectedUsers.get(data.callerId)
        if (callerSocket) {
          global.io.to(callerSocket).emit('call-rejected', {
            from: socket.userId
          })
        }
      })

      socket.on('ice-candidate', (data) => {
        console.log('ICE candidate event:', data)
        const recipientSocket = connectedUsers.get(data.recipientId)
        if (recipientSocket) {
          global.io.to(recipientSocket).emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.userId
          })
        }
      })

      socket.on('end-call', (data) => {
        console.log('End call event:', data)
        const recipientSocket = connectedUsers.get(data.recipientId)
        if (recipientSocket) {
          global.io.to(recipientSocket).emit('call-ended', {
            from: socket.userId
          })
        }
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        if (socket.userId) {
          connectedUsers.delete(socket.userId)
        }
      })
    })
  }

  return NextResponse.json({ success: true })
}
