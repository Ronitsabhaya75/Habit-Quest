"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const scrambledWords = [
  { word: 'focus', meaning: 'The center of interest or activity.' },
  { word: 'discipline', meaning: 'Training to act in accordance with rules.' },
  { word: 'habit', meaning: 'A regular practice, especially one that is hard to give up.' },
  { word: 'routine', meaning: 'A sequence of actions regularly followed.' },
  { word: 'goal', meaning: 'The object of a person\'s ambition or effort.' },
  { word: 'mindfulness', meaning: 'The quality of being conscious or aware of something.' },
  { word: 'exercise', meaning: 'Activity requiring physical effort.' },
  { word: 'journaling', meaning: 'The act of writing in a journal.' },
  { word: 'gratitude', meaning: 'The quality of being thankful.' },
  { word: 'consistency', meaning: 'Conformity in the application of something.' },
  { word: 'positivity', meaning: 'The practice of being positive.' },
  { word: 'planning', meaning: 'The process of making plans.' },
  { word: 'reading', meaning: 'The action or skill of reading written or printed matter.' },
  { word: 'hydration', meaning: 'The process of causing something to absorb water.' },
  { word: 'nutrition', meaning: 'The process of providing or obtaining food.' },
  { word: 'walking', meaning: 'The activity of going for walks.' },
  { word: 'learning', meaning: 'The acquisition of knowledge or skills.' },
  { word: 'sleep', meaning: 'A condition of body and mind which typically recurs for several hours every night.' },
  { word: 'reflection', meaning: 'Serious thought or consideration.' },
  { word: 'meditation', meaning: 'The action of meditating.' },
  { word: 'visualization', meaning: 'The formation of a mental image.' },
  { word: 'affirmation', meaning: 'The action or process of affirming something.' },
  { word: 'decluttering', meaning: 'Removing unnecessary items from an untidy place.' },
  { word: 'organization', meaning: 'The action of organizing something.' },
  { word: 'accountability', meaning: 'The fact of being responsible for actions.' },
  { word: 'breathing', meaning: 'The process of taking air into and expelling it from the lungs.' },
  { word: 'structure', meaning: 'The arrangement of and relations between parts.' },
  { word: 'balance', meaning: 'An even distribution of weight enabling someone to remain upright.' },
  { word: 'selfcare', meaning: 'The practice of taking action to preserve health.' },
  { word: 'practice', meaning: 'Repeated exercise in an activity.' },
  { word: 'skill', meaning: 'The ability to do something well.' },
  { word: 'motivation', meaning: 'The reason for acting in a particular way.' },
  { word: 'awareness', meaning: 'Knowledge or perception of a situation or fact.' },
  { word: 'action', meaning: 'The process of doing something.' },
  { word: 'patience', meaning: 'The capacity to accept delay without getting angry.' },
  { word: 'growth', meaning: 'The process of increasing in size or development.' },
  { word: 'challenge', meaning: 'A call to take part in a contest or competition.' },
  { word: 'energy', meaning: 'The strength required for sustained activity.' },
  { word: 'intention', meaning: 'A thing intended; an aim or plan.' },
  { word: 'commitment', meaning: 'The state of being dedicated to a cause.' },
  { word: 'support', meaning: 'Giving assistance to someone.' },
  { word: 'kindness', meaning: 'The quality of being friendly and considerate.' },
  { word: 'confidence', meaning: 'The feeling of self-assurance.' },
  { word: 'tracking', meaning: 'Observing the progress of something.' },
  { word: 'scheduling', meaning: 'Planning when something should happen.' },
  { word: 'goalsetting', meaning: 'The process of identifying objectives.' },
  { word: 'mindset', meaning: 'The established set of attitudes held by someone.' },
  { word: 'resilience', meaning: 'The capacity to recover quickly.' },
  { word: 'adaptability', meaning: 'Being able to adjust to new conditions.' },
  { word: 'simplicity', meaning: 'The quality of being easy to understand.' },
  { word: 'efficiency', meaning: 'Achieving maximum productivity.' },
  { word: 'reward', meaning: 'A thing given in recognition.' },
  { word: 'effort', meaning: 'A vigorous or determined attempt.' },
  { word: 'achievement', meaning: 'A thing done successfully.' },
  { word: 'review', meaning: 'Evaluation of performance.' },
  { word: 'habitloop', meaning: 'Cue-Routine-Reward cycle.' },
  { word: 'habitstack', meaning: 'Attaching new habits to existing ones.' },
  { word: 'trigger', meaning: 'Something that initiates behavior.' },
  { word: 'routinecheck', meaning: 'Assessing regular tasks.' },
  { word: 'reflectiontime', meaning: 'A period for introspection.' },
  { word: 'focuszone', meaning: 'A distraction-free time block.' },
  { word: 'winddown', meaning: 'Preparing to relax or sleep.' },
  { word: 'earlystart', meaning: 'Waking up early for a head start.' },
  { word: 'deepwork', meaning: 'Focused, undistracted work time.' },
  { word: 'sleeptrack', meaning: 'Monitoring sleep patterns.' },
  { word: 'watertrack', meaning: 'Tracking water intake.' },
  { word: 'positivethink', meaning: 'Optimistic and constructive thought process.' },
  { word: 'habitlog', meaning: 'A record of your habits.' },
  { word: 'selftalk', meaning: 'Talking to oneself positively or reflectively.' },
  { word: 'stretching', meaning: 'Gentle exercises to improve flexibility.' }
]

const generateMissingLetters = (word: string) =>
  word.split('').map((char, i) => (i % 2 === 0 ? char : '_')).join('')

const missingWords = scrambledWords.map(({ word, meaning }) => ({
  word,
  display: generateMissingLetters(word),
  meaning
}))

const shuffleArray = (array: any[]) => array.sort(() => Math.random() - 0.5)

export function WordScramblerGame() {
  const router = useRouter()
  const [tab, setTab] = useState<'scrambled' | 'missing'>('scrambled')
  const [round, setRound] = useState(1)
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState('')
  const [message, setMessage] = useState('')
  const [showMeaning, setShowMeaning] = useState(false)
  const [scrambled, setScrambled] = useState('')
  const [xp, setXP] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [currentSet, setCurrentSet] = useState<{word: string, meaning: string, display?: string}[]>([])
  const [showRoundMessage, setShowRoundMessage] = useState(false)
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false)

  const totalRounds = 3
  const questionsPerRound = 5
  const totalQuestions = totalRounds * questionsPerRound

  useEffect(() => {
    // Load XP from localStorage
    const savedXP = localStorage.getItem(`${tab}XP`)
    if (savedXP) {
      setXP(parseInt(savedXP))
    }

    const baseWords = tab === 'scrambled' ? scrambledWords : missingWords
    const randomized = shuffleArray([...baseWords]).slice(0, totalQuestions)
    setCurrentSet(randomized)
    setIndex(0)
    setGuess('')
    setShowMeaning(false)
    setMessage('')
    setAttempts(0)
    setMaxAttemptsReached(false)
    setShowRoundMessage(false)
    setRound(1)
  }, [tab])

  useEffect(() => {
    if (currentSet.length > 0 && index < currentSet.length) {
      setScrambled(
        tab === 'scrambled'
          ? scrambleWord(currentSet[index].word)
          : currentSet[index].display || ''
      )
    }
  }, [index, currentSet, tab])

  const scrambleWord = (word: string) => {
    const wordArray = word.split('')
    for (let i = wordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]]
    }
    return wordArray.join('')
  }

  const navigateBack = () => {
    router.push('/breakthrough-game')
  }

  const handleCheck = () => {
    if (maxAttemptsReached) return

    if (guess.trim().toLowerCase() === currentSet[index].word.toLowerCase()) {
      setMessage('✅ Correct!')
      setShowMeaning(true)
      const gainedXP = xp + 10
      setXP(gainedXP)
      localStorage.setItem(`${tab}XP`, gainedXP.toString())
      
      // Update total XP
      const scrambledXP = parseInt(localStorage.getItem('scrambledXP') || '0')
      const missingXP = parseInt(localStorage.getItem('missingXP') || '0')
      localStorage.setItem('totalWordGameXP', (scrambledXP + missingXP).toString())
    } else {
      const newAttempts = attempts + 1
      if (newAttempts >= 3) {
        setMessage(`❌ Incorrect! The correct word is: ${currentSet[index].word}`)
        setShowMeaning(true)
        setAttempts(3)
        setMaxAttemptsReached(true)
      } else {
        setMessage(`❌ Try Again! (${newAttempts}/3 attempts)`)
        setAttempts(newAttempts)
      }
    }
  }

  const handleNext = () => {
    const nextIndex = index + 1
    if (nextIndex % questionsPerRound === 0 && nextIndex < totalQuestions) {
      setShowRoundMessage(true)
      setTimeout(() => {
        setShowRoundMessage(false)
        moveToNextQuestion(nextIndex)
      }, 2000)
    } else if (nextIndex === totalQuestions) {
      setShowRoundMessage(true)
    } else {
      moveToNextQuestion(nextIndex)
    }
  }

  const moveToNextQuestion = (nextIndex: number) => {
    if (nextIndex < totalQuestions) {
      setIndex(nextIndex)
      setGuess('')
      setShowMeaning(false)
      setMessage('')
      setAttempts(0)
      setMaxAttemptsReached(false)
      setRound(Math.floor(nextIndex / questionsPerRound) + 1)
    }
  }

  const resetXP = () => {
    localStorage.setItem(`${tab}XP`, '0')
    setXP(0)
  }

  const resetTotalXP = () => {
    localStorage.setItem('scrambledXP', '0')
    localStorage.setItem('missingXP', '0')
    localStorage.setItem('totalWordGameXP', '0')
    setXP(0)
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-[#0E1A40] to-[#13294B] text-[#D0E7FF] p-4 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(50,255,192,0.1)_0%,transparent_70%),radial-gradient(circle_at_70%_70%,rgba(0,249,255,0.1)_0%,transparent_60%)] z-1"></div>
      
      {/* Stars */}
      <div className="absolute w-5 h-5 top-[10%] left-[10%] bg-[radial-gradient(circle,rgba(255,223,108,0.9)_0%,rgba(255,255,255,0)_70%)] rounded-full z-2 animate-[starGlow_4s_infinite_ease-in-out_0.5s] opacity-70"></div>
      <div className="absolute w-4 h-4 top-[25%] left-[25%] bg-[radial-gradient(circle,rgba(50,255,192,0.9)_0%,rgba(255,255,255,0)_70%)] rounded-full z-2 animate-[starGlow_3s_infinite_ease-in-out_1s] opacity-70"></div>
      <div className="absolute w-6 h-6 top-[15%] right-[30%] bg-[radial-gradient(circle,rgba(0,249,255,0.9)_0%,rgba(255,255,255,0)_70%)] rounded-full z-2 animate-[starGlow_5s_infinite_ease-in-out_0.2s] opacity-70"></div>
      <div className="absolute w-5 h-5 bottom-[20%] right-[15%] bg-[radial-gradient(circle,rgba(255,223,108,0.9)_0%,rgba(255,255,255,0)_70%)] rounded-full z-2 animate-[starGlow_4.5s_infinite_ease-in-out_0.7s] opacity-70"></div>

      <div className="text-center mb-4 relative z-10">
        <h1 className="text-2xl text-[#32FFC0] font-bold tracking-wider mb-1 animate-pulse">
          🔤 Word Scrambler Game
        </h1>
        <div className="text-sm bg-[rgba(14,26,64,0.6)] text-[#FFDF6C] font-semibold px-4 py-2 rounded-lg inline-block border border-[rgba(50,255,192,0.3)]">
          ⭐ {tab === 'scrambled' ? 'Scrambled' : 'Missing'} XP: {xp} | 🌟 Total XP: {parseInt(localStorage.getItem('totalWordGameXP') || '0')}
        </div>
        <div className="flex justify-center gap-2 my-3">
          <Button
            variant={tab === 'scrambled' ? 'default' : 'outline'}
            className={`min-w-[140px] ${tab === 'scrambled' ? 'bg-[rgba(50,255,192,0.3)] border-[#32FFC0]' : 'bg-[rgba(28,42,74,0.6)] border-[rgba(50,255,192,0.3)]'} font-mono`}
            onClick={() => setTab('scrambled')}
          >
            Scrambled
          </Button>
          <Button
            variant={tab === 'missing' ? 'default' : 'outline'}
            className={`min-w-[140px] ${tab === 'missing' ? 'bg-[rgba(50,255,192,0.3)] border-[#32FFC0]' : 'bg-[rgba(28,42,74,0.6)] border-[rgba(50,255,192,0.3)]'} font-mono`}
            onClick={() => setTab('missing')}
          >
            Missing Letters
          </Button>
        </div>
      </div>

      <Card className="bg-[rgba(14,26,64,0.8)] backdrop-blur-md w-full max-w-2xl border-[rgba(50,255,192,0.3)] shadow-lg z-10">
        <CardContent className="p-6 text-center">
          {showRoundMessage ? (
            <div className="text-2xl text-[#32FFC0] font-bold font-mono py-6 animate-pulse">
              {index + 1 === totalQuestions ? (
                <>
                  🎉 All Rounds Completed!
                  <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    <Button onClick={() => window.location.reload()}>Play Again</Button>
                    <Button variant="outline" onClick={() => router.push('/dashboard')}>Home</Button>
                    <Button variant="outline" onClick={navigateBack}>Back to Breakthrough</Button>
                  </div>
                </>
              ) : (
                <>🎉 Round {round} Complete!</>
              )}
            </div>
          ) : (
            <>
              <div className="bg-[rgba(28,42,74,0.6)] text-white px-3 py-2 rounded-lg mb-4 border border-[rgba(50,255,192,0.3)] text-sm font-semibold">
                🌀 Round {round} of {totalRounds} | ❓ Question {index % questionsPerRound + 1} of {questionsPerRound} | Attempt {Math.min(attempts + 1, 3)} of 3
              </div>
              <h3 className="text-lg mb-3 text-[#32FFC0] font-mono">
                {tab === 'scrambled' ? 'Unscramble this word:' : 'Fill in the missing letters:'}
              </h3>
              <div className="text-3xl my-4 text-[#FFDF6C] font-bold tracking-wider">
                {scrambled}
              </div>
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess..."
                disabled={maxAttemptsReached || showMeaning}
                className="w-4/5 mx-auto my-3 bg-[rgba(28,42,74,0.4)] border-[rgba(50,255,192,0.4)] text-center text-lg"
              />
              {!showMeaning && (
                <Button
                  className="mt-2 bg-[#00F9FF] hover:bg-[#32FFC0] text-black font-mono"
                  onClick={handleCheck}
                  disabled={maxAttemptsReached}
                >
                  Check Answer
                </Button>
              )}
              {message && (
                <div className={`text-lg my-3 font-semibold ${message.includes('Correct') ? 'text-[#32FFC0]' : 'text-[#FF5DA0]'}`}>
                  {message}
                </div>
              )}
              {showMeaning && (
                <div className="bg-[rgba(28,42,74,0.6)] text-white p-4 rounded-lg my-4 border border-[rgba(50,255,192,0.3)]">
                  <strong className="block text-lg text-[#FFDF6C] mb-2">{currentSet[index].word}</strong>
                  {currentSet[index].meaning}
                  <Button 
                    className="w-full mt-4 bg-[#00F9FF] hover:bg-[#32FFC0] text-black font-mono"
                    onClick={handleNext}
                  >
                    Next Word
                  </Button>
                </div>
              )}
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <Button variant="outline" onClick={navigateBack}>Return to Breakthrough</Button>
                <Button variant="outline" className="text-[#FFDF6C]" onClick={resetXP}>Reset {tab} XP</Button>
                <Button variant="outline" className="text-[#FF5DA0]" onClick={resetTotalXP}>Reset All XP</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}