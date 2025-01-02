import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initSocket = (server: NetServer) => {
  if (!(server as any).io) {
    console.log('*First use, starting socket.io')

    const io = new SocketIOServer(server, {
      path: '/api/socket',
      transports: ['polling'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
    })

    io.on('connection', (socket) => {
      console.log('Client connected')

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })

      socket.on('message', (data) => {
        io.emit('message', data)
      })

      socket.on('postLiked', (data) => {
        io.emit('postLiked', data)
      })

      socket.on('postDeleted', (data) => {
        io.emit('postDeleted', data)
      })

      socket.on('postUpdated', (data) => {
        io.emit('postUpdated', data)
      })
    })

    ;(server as any).io = io
  }

  return (server as any).io
}
