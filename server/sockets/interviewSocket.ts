import { Server, Socket } from 'socket.io';
import { ChatMessageModel, InterviewModel } from '../models/index.js';

interface RoomUser {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

// In-memory room state: room -> Set of RoomUsers
const activeRooms = new Map<string, Map<string, RoomUser>>();
// Room code buffer cache: room -> { [problemId: string]: { code: string; language: string } }
const roomCodeBuffers = new Map<string, Record<string, { code: string; language: string }>>();
// Room timer state: room -> { startTime: number; durationMinutes: number }
const roomTimers = new Map<string, { startTime: number; durationMinutes: number }>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentUserInfo: RoomUser | null = null;

    // 1. Join Interview Room
    socket.on('join-room', async ({ interviewId, userId, userName, userRole }) => {
      currentRoomId = interviewId;
      currentUserInfo = {
        socketId: socket.id,
        userId,
        userName,
        userRole,
        isMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
      };

      socket.join(interviewId);

      if (!activeRooms.has(interviewId)) {
        activeRooms.set(interviewId, new Map());
      }
      const roomUsers = activeRooms.get(interviewId)!;
      roomUsers.set(socket.id, currentUserInfo);

      // Initialize room timer if not yet active
      if (!roomTimers.has(interviewId)) {
        const interview = await InterviewModel.findById(interviewId);
        const duration = interview ? interview.duration : 60;
        roomTimers.set(interviewId, {
          startTime: Date.now(),
          durationMinutes: duration,
        });
      }

      // Send initial room snapshot to joining user
      const usersList = Array.from(roomUsers.values());
      const existingBuffers = roomCodeBuffers.get(interviewId) || {};
      const timerState = roomTimers.get(interviewId);

      // Fetch recent chat history
      const chats = await ChatMessageModel.find({ interviewId });
      chats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      socket.emit('room-joined-success', {
        users: usersList,
        codeBuffers: existingBuffers,
        timer: timerState,
        chatHistory: chats.slice(-50),
      });

      // Broadcast new participant presence to others in the room
      socket.to(interviewId).emit('user-joined', {
        user: currentUserInfo,
        users: usersList,
      });

      console.log(`[Socket] User ${userName} (${userRole}) joined room ${interviewId}`);
    });

    // 2. Collaborative Code Synchronization
    socket.on('code-change', ({ interviewId, problemId, code, language }) => {
      if (!roomCodeBuffers.has(interviewId)) {
        roomCodeBuffers.set(interviewId, {});
      }
      const buffer = roomCodeBuffers.get(interviewId)!;
      buffer[problemId] = { code, language };

      // Broadcast code update to everyone else in the room
      socket.to(interviewId).emit('code-update', {
        problemId,
        code,
        language,
        senderId: currentUserInfo?.userId,
        senderName: currentUserInfo?.userName,
      });
    });

    // Language Change
    socket.on('language-change', ({ interviewId, problemId, language, starterCode }) => {
      if (!roomCodeBuffers.has(interviewId)) {
        roomCodeBuffers.set(interviewId, {});
      }
      const buffer = roomCodeBuffers.get(interviewId)!;
      buffer[problemId] = {
        code: starterCode || buffer[problemId]?.code || '',
        language,
      };

      socket.to(interviewId).emit('language-update', {
        problemId,
        language,
        code: buffer[problemId].code,
        senderName: currentUserInfo?.userName,
      });
    });

    // 3. Real-Time Chat
    socket.on('send-chat-message', async ({ interviewId, message }) => {
      if (!currentUserInfo || !message?.trim()) return;

      const chatDoc = await ChatMessageModel.create({
        interviewId,
        senderId: currentUserInfo.userId,
        senderName: currentUserInfo.userName,
        senderRole: currentUserInfo.userRole as any,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });

      io.to(interviewId).emit('new-chat-message', chatDoc);
    });

    // 4. Notes Synchronization
    socket.on('notes-update', ({ interviewId, notes, isShared }) => {
      socket.to(interviewId).emit('notes-synced', {
        notes,
        isShared,
        updatedBy: currentUserInfo?.userName,
      });
    });

    // 5. Code Execution Broadcast (e.g. "Alex Rivera is running test cases...")
    socket.on('code-executing', ({ interviewId, problemId, status }) => {
      socket.to(interviewId).emit('code-execution-status', {
        problemId,
        status,
        userName: currentUserInfo?.userName,
      });
    });

    // 6. WebRTC Peer-to-Peer Signaling (Video/Audio/Screen Share)
    socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        senderSocketId: socket.id,
        senderUser: currentUserInfo,
        offer,
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        senderSocketId: socket.id,
        answer,
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Media track state changes (mute / video off / screenshare)
    socket.on('media-state-change', ({ interviewId, isMuted, isVideoOff, isScreenSharing }) => {
      if (currentUserInfo && currentRoomId) {
        currentUserInfo.isMuted = isMuted;
        currentUserInfo.isVideoOff = isVideoOff;
        currentUserInfo.isScreenSharing = isScreenSharing;

        socket.to(interviewId).emit('user-media-state-changed', {
          socketId: socket.id,
          userId: currentUserInfo.userId,
          isMuted,
          isVideoOff,
          isScreenSharing,
        });
      }
    });

    // 7. Disconnection / Cleanup
    socket.on('disconnect', () => {
      if (currentRoomId && activeRooms.has(currentRoomId)) {
        const roomUsers = activeRooms.get(currentRoomId)!;
        roomUsers.delete(socket.id);

        const remainingUsers = Array.from(roomUsers.values());
        socket.to(currentRoomId).emit('user-left', {
          socketId: socket.id,
          user: currentUserInfo,
          users: remainingUsers,
        });

        if (roomUsers.size === 0) {
          activeRooms.delete(currentRoomId);
        }
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}
