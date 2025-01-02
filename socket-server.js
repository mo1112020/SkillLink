const { Server } = require('socket.io')
const express = require('express')
const http = require('http')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Store connected users
const users = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Handle user joining
  socket.on('join', (userId) => {
    users.set(userId, socket.id)
    console.log('User joined:', userId)
  })

  // Handle private messages
  socket.on('private message', ({ content, sender, receiver, recipientId }) => {
    const recipientSocketId = users.get(recipientId)
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private message', {
        content,
        sender,
        receiver,
        createdAt: new Date(),
      })
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId)
        break
      }
    }
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.SOCKET_PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
