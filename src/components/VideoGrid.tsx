import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  Wifi,
  Volume2,
} from 'lucide-react';
import type { UserRole } from '../types';

interface Participant {
  userId: string;
  userName: string;
  userRole: UserRole;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

interface VideoGridProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  participants: Participant[];
  socket?: any;
  interviewId: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  currentUserId,
  currentUserName,
  currentUserRole,
  participants,
  socket,
  interviewId,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera and mic with graceful permission handling
  useEffect(() => {
    let mounted = true;

    async function setupLocalMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          if (mounted) {
            localStreamRef.current = stream;
            setHasMediaPermission(true);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err) {
        console.warn('[WebRTC] Local camera/mic unavailable in this context, running simulated streams.');
        if (mounted) {
          setHasMediaPermission(false);
        }
      }
    }

    setupLocalMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !nextState));
    }
    socket?.emit('media-state-change', {
      interviewId,
      isMuted: nextState,
      isVideoOff,
      isScreenSharing,
    });
  };

  const toggleVideo = () => {
    const nextState = !isVideoOff;
    setIsVideoOff(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !nextState));
    }
    socket?.emit('media-state-change', {
      interviewId,
      isMuted,
      isVideoOff: nextState,
      isScreenSharing,
    });
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
          socket?.emit('media-state-change', {
            interviewId,
            isMuted,
            isVideoOff,
            isScreenSharing: true,
          });
        }
      } catch (err) {
        console.warn('Screen share canceled or failed', err);
      }
    } else {
      setIsScreenSharing(false);
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
        screenVideoRef.current.srcObject = null;
      }
      socket?.emit('media-state-change', {
        interviewId,
        isMuted,
        isVideoOff,
        isScreenSharing: false,
      });
    }
  };

  // Find other participant if connected
  const otherParticipant = participants.find((p) => p.userId !== currentUserId);

  return (
    <div className="flex h-full flex-col justify-between p-3 bg-slate-950 border-r border-slate-800 select-none">
      {/* Top Header: Session & Status */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">Session Call</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <Wifi className="h-3 w-3" />
          <span className="font-mono">WebRTC Active</span>
        </div>
      </div>

      {/* Video Streams Container */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Remote participant video window */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group shadow-md">
          {otherParticipant ? (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="relative mb-2">
                <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-300 shadow-lg">
                  {otherParticipant.userName.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <Volume2 className="h-2.5 w-2.5 text-white animate-pulse" />
                </div>
              </div>
              <p className="text-xs font-semibold text-white">{otherParticipant.userName}</p>
              <p className="text-[11px] text-slate-400 capitalize">{otherParticipant.userRole}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2 border border-slate-700/50">
                <Users className="h-5 w-5 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-slate-300">Waiting for peer...</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentUserRole === 'candidate' ? 'Interviewer will join shortly' : 'Candidate will join shortly'}
              </p>
            </div>
          )}

          {/* Participant Label Tag */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] text-slate-300">
            {otherParticipant ? otherParticipant.userName : 'Remote Peer'}
          </div>
        </div>

        {/* Local user video window */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group shadow-md">
          {hasMediaPermission && !isVideoOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover mirror"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-slate-900 to-slate-950">
              <div className="h-14 w-14 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-lg font-bold text-indigo-300 mb-2 shadow-inner">
                {currentUserName.charAt(0)}
              </div>
              <p className="text-xs font-medium text-white">{currentUserName} (You)</p>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {isVideoOff ? 'Camera muted' : 'Audio stream active'}
              </span>
            </div>
          )}

          {/* Local user status overlay */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5">
            <span>You ({currentUserRole})</span>
            {isMuted && <MicOff className="h-3 w-3 text-rose-400" />}
          </div>
        </div>

        {/* Screen share container if enabled */}
        {isScreenSharing && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-indigo-500/50">
            <video ref={screenVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-indigo-600/90 text-[10px] font-medium text-white">
              Your Screen Sharing
            </div>
          </div>
        )}
      </div>

      {/* Media Action Bar */}
      <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-center gap-2">
        <button
          onClick={toggleMic}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
            isVideoOff
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800'
          }`}
          title={isVideoOff ? 'Enable camera' : 'Disable camera'}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
            isScreenSharing
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800'
          }`}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
