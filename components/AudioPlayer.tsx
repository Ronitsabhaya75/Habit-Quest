"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'

// Store audio state in global scope to persist between page navigations
interface GlobalAudioState {
  playing: boolean;
  youtubePlayer: any | null;
  audioElement: HTMLAudioElement | null;
  initialized: boolean;
}

const globalAudioState: GlobalAudioState = {
  playing: false,
  youtubePlayer: null,
  audioElement: null,
  initialized: false
};

// Backup audio URL in case YouTube fails
const FALLBACK_AUDIO_URL = '/audio/background-music.mp3'
// Set maximum volume (0-100 for YouTube, 0-1 for HTML Audio)
const DEFAULT_VOLUME = 85

const AudioPlayer = () => {
  // Set default state to unmuted to ensure music plays by default
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('muted') === 'true' } catch { return false }
  })
  const mutedRef = useRef<boolean>(muted)
  const [player, setPlayer] = useState<any>(globalAudioState.youtubePlayer)
  const [error, setError] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isUnmounting, setIsUnmounting] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(globalAudioState.audioElement)
  const youtubeLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const continuityCheckRef = useRef<NodeJS.Timeout | null>(null)
  const wasPlayingRef = useRef<boolean>(globalAudioState.playing)
  
  // https://www.youtube.com/watch?v=8vOZYwsm8X0&ab_channel=lofigeek 
  // Updated YouTube video ID to the specified music track
  // "UDVtMYqUAyw" is the original ID, replaced with the user's preferred track
  const videoId = "8vOZYwsm8X0" // Relaxing music from Musictag channel
  
  // Check every few seconds that audio is still playing and restart if needed
  const startContinuityCheck = () => {
    if (continuityCheckRef.current) clearInterval(continuityCheckRef.current);
    continuityCheckRef.current = setInterval(() => {
      if (isUnmounting || mutedRef.current) return;
      
      if (usingFallback && audioRef.current) {
        // If audio is paused or ended, restart it
        if (audioRef.current.paused || audioRef.current.ended) {
          console.log("Detected paused audio, restarting playback");
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => console.error("Error restarting audio:", err));
          globalAudioState.playing = true;
        }
      } else if (player) {
        // Check if YouTube player is playing
        try {
          const state = player.getPlayerState();
          // Only restart if not playing and user hasn't interacted
          if (state !== 1 && !error) { // 1 = playing
            console.log("Detected stopped YouTube playback, restarting");
            player.playVideo();
            globalAudioState.playing = true;
          }
        } catch (err) {
          console.error("Error checking YouTube player state:", err);
        }
      }
    }, 5000); // Check every 5 seconds instead of 10
  };
  
  // Check page visibility to keep playing when tab is visible
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !mutedRef.current) {
      // When page becomes visible again and not muted, ensure playback
      if (usingFallback && audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(err => console.error("Error resuming audio:", err));
          globalAudioState.playing = true;
        }
      } else if (player) {
        try {
          const state = player.getPlayerState();
          if (state !== 1) { // 1 = playing
            player.playVideo();
            globalAudioState.playing = true;
          }
        } catch (err) {
          console.error("Error resuming YouTube playback:", err);
        }
      }
    }
  };
  
  // Move initFallbackAudio to component level
  const initFallbackAudio = () => {
    try {
      if (isUnmounting) return;
      
      console.log("Using fallback audio player");
      setUsingFallback(true);
      
      // Create an audio element if it doesn't exist or use the global one
      if (!audioRef.current && !globalAudioState.audioElement) {
        const audio = new Audio(FALLBACK_AUDIO_URL);
        audio.loop = true; // Enable looping directly
        audio.volume = DEFAULT_VOLUME / 100; // Convert to 0-1 range
        
        // Add event listener for when audio ends (as a backup to loop property)
        audio.addEventListener('ended', () => {
          if (audio && !isUnmounting) {
            audio.currentTime = 0;
            audio.play().catch((err: Error) => {
              console.error("Error restarting audio:", err);
              // Don't keep trying to play if there's a persistent error
              if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
                setError(true);
              }
            });
          }
        });
        
        // Add error handling for the fallback too
        audio.onerror = () => {
          console.error("Fallback audio failed to load");
          setError(true);
        };
        
        // Store references
        audioRef.current = audio;
        globalAudioState.audioElement = audio;
      } else if (globalAudioState.audioElement && !audioRef.current) {
        // Use existing global audio element
        audioRef.current = globalAudioState.audioElement;
      }
    } catch (err) {
      console.error("Error initializing fallback audio:", err);
      setError(true);
    }
  };

  // Initialize audio player (YouTube or fallback)
  useEffect(() => {
    // If the audio has already been initialized globally, don't reinitialize
    if (globalAudioState.initialized) {
      console.log("Audio already initialized, using existing state");
      setPlayer(globalAudioState.youtubePlayer);
      setUsingFallback(!!globalAudioState.audioElement);
      
      // Resume playback if it was playing before
      if (globalAudioState.playing && !mutedRef.current) {
        if (globalAudioState.audioElement) {
          globalAudioState.audioElement.play().catch((err: Error) => console.error("Error resuming audio:", err));
        } else if (globalAudioState.youtubePlayer && typeof globalAudioState.youtubePlayer.playVideo === 'function') {
          globalAudioState.youtubePlayer.playVideo();
        }
      }
      
      // Start continuity check
      startContinuityCheck();
      
      return;
    }

    let ytPlayer: any = null;
    
    // Initialize YouTube player
    const initYouTubePlayer = () => {
      try {
        // Create YouTube player container if it doesn't exist
        if (!document.getElementById('youtube-audio-container')) {
          const container = document.createElement('div')
          container.id = 'youtube-audio-container'
          // Position off-screen but still rendered
          container.style.position = 'fixed'
          container.style.left = '-1000px'
          container.style.top = '0'
          container.innerHTML = '<div id="youtube-player"></div>'
          document.body.appendChild(container)
        }
        
        // Set a timeout to fall back if YouTube doesn't load within 5 seconds
        youtubeLoadTimeoutRef.current = setTimeout(() => {
          console.warn("YouTube API load timeout - switching to fallback");
          initFallbackAudio();
        }, 5000);
        
        // Initialize YouTube iframe API
        if (!(window as any).YT) {
          const tag = document.createElement('script')
          tag.src = "https://www.youtube.com/iframe_api"
          tag.onerror = () => {
            console.error("Failed to load YouTube iframe API");
            if (youtubeLoadTimeoutRef.current) {
              clearTimeout(youtubeLoadTimeoutRef.current);
            }
            initFallbackAudio();
          };
          
          const firstScriptTag = document.getElementsByTagName('script')[0]
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
        } else {
          // YouTube API already loaded
          if (youtubeLoadTimeoutRef.current) {
            clearTimeout(youtubeLoadTimeoutRef.current);
          }
          initYouTubePlayerInstance();
        }
      } catch (err) {
        console.error("Error initializing YouTube player:", err);
        initFallbackAudio();
      }
    };
    
    // Function called when YouTube API is ready
    const initYouTubePlayerInstance = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        console.log("Creating YouTube player");
        
        try {
          ytPlayer = new (window as any).YT.Player('youtube-player', {
            videoId: videoId,
            width: 1,
            height: 1,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              loop: 1,
              playlist: videoId, // Required for looping
              mute: 0,
              origin: window.location.origin
            },
            events: {
              onReady: (event: any) => {
                if (youtubeLoadTimeoutRef.current) {
                  clearTimeout(youtubeLoadTimeoutRef.current);
                }
                console.log("YouTube player ready");
                setPlayer(ytPlayer);
                // Store globally
                globalAudioState.youtubePlayer = ytPlayer;
                globalAudioState.initialized = true;
                
                setError(false);
                if (!mutedRef.current) {
                  event.target.setVolume(DEFAULT_VOLUME);
                  event.target.playVideo();
                  globalAudioState.playing = true;
                  startContinuityCheck();
                } else {
                  event.target.pauseVideo();
                  globalAudioState.playing = false;
                }
              },
              onStateChange: (event: any) => {
                // If video ended, restart
                if (event.data === (window as any).YT.PlayerState.ENDED) {
                  event.target.playVideo();
                  globalAudioState.playing = true;
                }
                // If video was paused, restart (unless muted)
                else if (event.data === (window as any).YT.PlayerState.PAUSED && !mutedRef.current) {
                  setTimeout(() => {
                    if (!isUnmounting) {
                      event.target.playVideo();
                      globalAudioState.playing = true;
                    }
                  }, 1000);
                }
                // Update global playing state
                else if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  globalAudioState.playing = true;
                }
              },
              onError: (event: any) => {
                console.error("YouTube player error:", event.data);
                // Switch to fallback if YouTube errors
                initFallbackAudio();
              }
            }
          });
        } catch (err) {
          console.error("Error creating YouTube player instance:", err);
          initFallbackAudio();
        }
      } else {
        console.error("YouTube API not available");
        initFallbackAudio();
      }
    };
    
    // Only initialize new player if one doesn't already exist
    if (!globalAudioState.initialized) {
      initYouTubePlayer();
    }
    
    // Handle API ready event
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API ready");
      if (youtubeLoadTimeoutRef.current) {
        clearTimeout(youtubeLoadTimeoutRef.current);
      }
      initYouTubePlayerInstance();
    };
    
    // Mark as initialized
    globalAudioState.initialized = true;
    
    // Cleanup function - note we're not destroying the players,
    // just cleaning up this component instance
    return () => {
      setIsUnmounting(true);
      
      if (youtubeLoadTimeoutRef.current) {
        clearTimeout(youtubeLoadTimeoutRef.current);
      }
      
      if (continuityCheckRef.current) {
        clearInterval(continuityCheckRef.current);
      }
      
      // Don't destroy the YouTube player or audio element on unmount
      // Just keep track of the playing state
      if (globalAudioState.youtubePlayer) {
        wasPlayingRef.current = globalAudioState.playing;
      }
      
      // @ts-ignore
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId, muted]);

  // Set up page visibility listener
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also add navigation event listeners
    const handleBeforeUnload = () => {
      // Save current state before page unload
      localStorage.setItem('audioState', JSON.stringify({
        playing: globalAudioState.playing,
        muted: mutedRef.current,
        time: usingFallback && audioRef.current ? audioRef.current.currentTime : 0
      }));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Set up next.js router event handlers (handle client-side navigation)
    if (typeof window !== "undefined") {
      function handleRouteChange() {
        // Don't stop the music, just preserve state
        wasPlayingRef.current = globalAudioState.playing;
      }
      
      function handleRouteComplete() {
        // Resume playback if it was playing before navigation
        if (wasPlayingRef.current && !mutedRef.current) {
          setTimeout(() => {
            if (usingFallback && audioRef.current) {
              audioRef.current.play().catch((err: Error) => console.error("Error resuming audio after navigation:", err));
              globalAudioState.playing = true;
            } else if (globalAudioState.youtubePlayer) {
              try {
                globalAudioState.youtubePlayer.playVideo();
                globalAudioState.playing = true;
              } catch (err) {
                console.error("Error resuming YouTube after navigation:", err);
              }
            }
          }, 300);
        }
      }
      
      // Check if Next.js router events are available
      const router = (window as any).next?.router;
      if (router && router.events) {
        router.events.on('routeChangeStart', handleRouteChange);
        router.events.on('routeChangeComplete', handleRouteComplete);
      }
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        if (router && router.events) {
          router.events.off('routeChangeStart', handleRouteChange);
          router.events.off('routeChangeComplete', handleRouteComplete);
        }
      };
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [usingFallback]);
  
  useEffect(() => {
    mutedRef.current = muted
    // Update localStorage
    try { localStorage.setItem('muted', String(muted)) } catch {}
  }, [muted])

  useEffect(() => {
    if (usingFallback) {
      if (audioRef.current) {
        if (muted) {
          audioRef.current.pause();
          globalAudioState.playing = false;
        } else {
          audioRef.current.volume = DEFAULT_VOLUME / 100;
          audioRef.current.play().catch((err: Error) => console.error("Error playing audio:", err));
          globalAudioState.playing = true;
        }
      }
    } else if (player) {
      try {
        if (muted) {
          player.pauseVideo();
          globalAudioState.playing = false;
        } else {
          player.unMute();
          player.playVideo();
          player.setVolume(DEFAULT_VOLUME);
          globalAudioState.playing = true;
        }
      } catch (err) {
        console.error("Error muting/unmuting YouTube player:", err);
        initFallbackAudio();
      }
    }
  }, [muted, player, usingFallback]);
  
  // Play fallback audio after user interaction (if needed)
  const handleUserInteraction = () => {
    if (error && audioRef.current) {
      audioRef.current.volume = DEFAULT_VOLUME / 100;
      audioRef.current.play().then(() => {
        setError(false);
        globalAudioState.playing = true;
      }).catch((err: Error) => {
        console.error("Failed to play audio after user interaction:", err);
      });
    }
  };
  
  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    
    // On mute, clear the auto-restart interval
    if (newMuted && continuityCheckRef.current) {
      clearInterval(continuityCheckRef.current);
    } else if (!newMuted) {
      // When unmuting, start the continuity check again
      startContinuityCheck();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50" onClick={handleUserInteraction}>
      <div className="bg-[#1a2332] rounded-lg p-2 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={toggleMute}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {error && (
            <AlertTriangle className="absolute -top-2 -right-2 h-4 w-4 text-red-500" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Add type definition for the YouTube API function
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    next?: any;
  }
}

export default AudioPlayer
