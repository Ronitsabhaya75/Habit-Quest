"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'

// Backup audio URL in case YouTube fails
const FALLBACK_AUDIO_URL = '/audio/background-music.mp3'
// Set maximum volume (0-100 for YouTube, 0-1 for HTML Audio)
const DEFAULT_VOLUME = 100

const AudioPlayer = () => {
  const [muted, setMuted] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const [error, setError] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const youtubeLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const continuityCheckRef = useRef<NodeJS.Timeout | null>(null)
  
  // YouTube video ID extracted from the URL
  const videoId = "UDVtMYqUAyw"
  
  // Initialize audio player (YouTube or fallback)
  useEffect(() => {
    let ytPlayer: any = null;
    let isUnmounting = false;
    
    // Create a local audio element for the fallback
    const initFallbackAudio = () => {
      try {
        if (isUnmounting) return;
        
        console.log("Using fallback audio player");
        setUsingFallback(true);
        
        // Create an audio element if it doesn't exist
        if (!audioRef.current) {
          audioRef.current = new Audio(FALLBACK_AUDIO_URL);
          audioRef.current.loop = true;
          audioRef.current.volume = DEFAULT_VOLUME / 100; // Convert to 0-1 range
          
          // Add event listener for when audio ends (as a backup to loop property)
          audioRef.current.addEventListener('ended', () => {
            if (audioRef.current && !isUnmounting) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(err => console.error("Error restarting audio:", err));
            }
          });
          
          // Add error handling for the fallback too
          audioRef.current.onerror = () => {
            console.error("Fallback audio failed to load");
            setError(true);
          };
        }
        
        // Try to play the fallback audio
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Auto-play prevented for fallback audio:", error);
            // We'll require user interaction to play
            setError(true);
          });
        }
      } catch (err) {
        console.error("Error initializing fallback audio:", err);
        setError(true);
      }
    };
    
    // Check every 10 seconds that audio is still playing and restart if needed
    const startContinuityCheck = () => {
      if (continuityCheckRef.current) {
        clearInterval(continuityCheckRef.current);
      }
      
      continuityCheckRef.current = setInterval(() => {
        if (isUnmounting) return;
        
        if (usingFallback && audioRef.current) {
          // If audio is paused or ended, restart it
          if (audioRef.current.paused || audioRef.current.ended) {
            console.log("Detected paused audio, restarting playback");
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.error("Error restarting audio:", err));
          }
        } else if (player) {
          // Check if YouTube player is playing
          try {
            const state = player.getPlayerState();
            // If not playing, restart
            if (state !== 1) { // 1 = playing
              console.log("Detected stopped YouTube playback, restarting");
              player.playVideo();
            }
          } catch (err) {
            console.error("Error checking YouTube player state:", err);
          }
        }
      }, 10000); // Check every 10 seconds
    };
    
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
                event.target.setVolume(DEFAULT_VOLUME); // Set to higher volume
                event.target.playVideo();
                setPlayer(ytPlayer);
                setError(false);
                startContinuityCheck(); // Start periodic checks
              },
              onStateChange: (event: any) => {
                // If video ended, restart
                if (event.data === (window as any).YT.PlayerState.ENDED) {
                  event.target.playVideo();
                }
                // If video was paused, restart (unless muted)
                else if (event.data === (window as any).YT.PlayerState.PAUSED && !muted) {
                  setTimeout(() => {
                    if (!isUnmounting) event.target.playVideo();
                  }, 1000);
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
    
    // Start initialization
    initYouTubePlayer();
    
    // Handle API ready event
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API ready");
      if (youtubeLoadTimeoutRef.current) {
        clearTimeout(youtubeLoadTimeoutRef.current);
      }
      initYouTubePlayerInstance();
    };
    
    // Cleanup function
    return () => {
      isUnmounting = true;
      
      if (youtubeLoadTimeoutRef.current) {
        clearTimeout(youtubeLoadTimeoutRef.current);
      }
      
      if (continuityCheckRef.current) {
        clearInterval(continuityCheckRef.current);
      }
      
      if (ytPlayer) {
        try {
          ytPlayer.stopVideo();
          ytPlayer.destroy();
        } catch (err) {
          console.error("Error during YouTube player cleanup:", err);
        }
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const container = document.getElementById('youtube-audio-container');
      if (container) {
        document.body.removeChild(container);
      }
      
      // @ts-ignore
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId, muted]);
  
  // Handle muting/unmuting
  useEffect(() => {
    if (usingFallback) {
      // Handle fallback audio muting
      if (audioRef.current) {
        audioRef.current.muted = muted;
        if (!muted) {
          audioRef.current.volume = DEFAULT_VOLUME / 100; // Set to higher volume when unmuting
        }
      }
    } else if (player) {
      // Handle YouTube player muting
      try {
        if (muted) {
          player.mute();
        } else {
          player.unMute();
          player.setVolume(DEFAULT_VOLUME);
        }
      } catch (err) {
        console.error("Error muting/unmuting YouTube player:", err);
      }
    }
  }, [muted, player, usingFallback]);
  
  // Play fallback audio after user interaction (if needed)
  const handleUserInteraction = () => {
    if (error && audioRef.current) {
      audioRef.current.volume = DEFAULT_VOLUME / 100;
      audioRef.current.play().then(() => {
        setError(false);
      }).catch(err => {
        console.error("Failed to play audio after user interaction:", err);
      });
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
    // Also handle user interaction for fallback audio
    handleUserInteraction();
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {error ? (
        <Button 
          onClick={handleUserInteraction}
          variant="outline"
          size="icon"
          className="rounded-full bg-[#1a2332] border-[#2a3343] text-yellow-500 hover:bg-[#2a3343]"
          title="Click to enable audio"
        >
          <AlertTriangle className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="rounded-full bg-[#1a2332] border-[#2a3343] text-white hover:bg-[#2a3343]"
          title={muted ? "Unmute music" : "Mute music"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

// Add type definition for the YouTube API function
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

export default AudioPlayer 