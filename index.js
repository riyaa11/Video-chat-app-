const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
debug: true,
})
app.use('/peerjs', peerServer);
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId)
      socket.broadcast.to(roomId).emit('user-connected', userId)
      socket.on('message', (message) => {
        //send message to the same room
        io.to(roomId).emit('createMessage', message)
      })
      socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
      })
    })
  })
/*server.listen(3000,()=>{
    console.log("server is listening on port 3000")
})*/
server.listen(process.env.PORT||3030)