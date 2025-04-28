/* 
  Habit Building Quiz Game Component

  1. This is a React component that runs a multi-round habit knowledge quiz.
  2. It uses three rounds: Beginner, Intermediate, and Advanced.
  3. Questions are randomly shuffled and divided across the rounds.
  4. Users select answers from multiple-choice options and receive immediate feedback.
  5. Explanations are shown after each answer is checked.
  6. Scores are tracked both per round and overall.
  7. After each round, a summary card with performance feedback is shown.
  8. After the final round, a complete score summary and XP reward toast appears.
  9. Styled components like `Card`, `Badge`, and `Button` provide consistent UI.
 10. The `GameWrapper` component wraps the game and handles start/end layout.
 11. User interactions update the state using React's `useState` hook.
 12. The quiz discourages guessing by disabling answer changes after submission.
 13. Visual and color cues highlight right/wrong answers.
 14. Round logic is modular, enabling easy scalability of questions or levels.
 15. The UI is fully responsive with a sci-fi space-themed styling.
*/

"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { GameWrapper } from "./game-wrapper"
import { toast } from "../ui/use-toast"

const quizQuestions = [
  {
    question: "How long does it typically take to form a new habit?",
    options: ["7 days", "21 days", "66 days", "90 days"],
    correctAnswer: "66 days",
    explanation: "Research shows that on average it takes about 66 days for a new behavior to become automatic, though this can range from 18 to 254 days depending on the habit and the person."
  },
  {
    question: "What is 'habit stacking'?",
    options: ["Trying to form multiple habits at once", "Building a new habit onto an existing one", "Replacing bad habits with good ones", "Tracking habits with a calendar"],
    correctAnswer: "Building a new habit onto an existing one",
    explanation: "Habit stacking is a technique where you attach a new habit to an existing routine or habit, making it easier to remember and perform consistently."
  },
  {
    question: "Which component is NOT part of the 'Habit Loop'?",
    options: ["Cue", "Craving", "Response", "Willpower"],
    correctAnswer: "Willpower",
    explanation: "The Habit Loop consists of Cue, Craving, Response, and Reward. Willpower is a limited resource and not considered part of the automatic habit loop structure."
  },
  {
    question: "What is the '2-Minute Rule' for habit formation?",
    options: ["Take 2 minutes to plan your habits each day", "New habits should take less than 2 minutes to do", "Meditate for 2 minutes before starting a habit", "Wait 2 minutes when you feel an urge for a bad habit"],
    correctAnswer: "New habits should take less than 2 minutes to do",
    explanation: "The 2-Minute Rule suggests that new habits should be scaled down to take less than two minutes to perform, making them easier to start consistently."
  },
  {
    question: "Which strategy is most effective for maintaining habits?",
    options: ["Relying on motivation", "Using willpower", "Building systems and environment design", "Setting ambitious goals"],
    correctAnswer: "Building systems and environment design",
    explanation: "Systems and environment design create conditions where habits happen naturally, rather than relying on temporary motivation or limited willpower."
  },
  {
    question: "What is 'implementation intention'?",
    options: ["A specific plan for when and where to perform a habit", "The desire to complete a habit", "The reward you get after a habit", "A tracking system for habits"],
    correctAnswer: "A specific plan for when and where to perform a habit",
    explanation: "Implementation intention is a strategy where you decide beforehand exactly when and where you'll perform a habit, often structured as 'When X happens, I will do Y.'"
  },
  {
    question: "Which is NOT a key component of the WOOP method for habit formation?",
    options: ["Wish", "Outcome", "Obstacle", "Punishment"],
    correctAnswer: "Punishment",
    explanation: "WOOP stands for Wish, Outcome, Obstacle, Plan. It doesn't include punishment as a component, instead focusing on planning for obstacles."
  },
  {
    question: "What is considered the most important factor in habit formation?",
    options: ["Duration", "Consistency", "Intensity", "Complexity"],
    correctAnswer: "Consistency",
    explanation: "Consistency—performing a habit regularly, even if briefly—is more important than duration or intensity for forming lasting habits."
  },
  {
    question: "What does 'temptation bundling' refer to?",
    options: ["Combining something you want to do with something you need to do", "Removing temptations from your environment", "Listing all your temptations", "Rewarding yourself for resisting temptation"],
    correctAnswer: "Combining something you want to do with something you need to do",
    explanation: "Temptation bundling involves pairing an activity you enjoy (want to do) with one you're trying to form a habit around (need to do) to increase motivation."
  },
  {
    question: "What is the 'Seinfeld Strategy' for habit building?",
    options: ["Taking breaks between habits", "Never missing two days in a row", "Practicing habits in public", "Making jokes about your habits"],
    correctAnswer: "Never missing two days in a row",
    explanation: "Named after comedian Jerry Seinfeld, this strategy involves marking a calendar each day you perform your habit and not breaking the chain, especially not for two consecutive days."
  },
  {
    question: "According to habit research, what should you focus on changing first?",
    options: ["Your goals", "Your identity", "Your environment", "Your schedule"],
    correctAnswer: "Your identity",
    explanation: "Research suggests that identity-based habits are more likely to stick because behaviors that align with how we see ourselves are easier to maintain long-term."
  },
  {
    question: "What is 'habit friction'?",
    options: ["Conflict between two habits", "Resistance that makes performing a habit difficult", "The energy needed to start a habit", "Disagreement about which habits to form"],
    correctAnswer: "Resistance that makes performing a habit difficult",
    explanation: "Habit friction refers to any obstacle or resistance that makes it harder to perform a desired habit, which can be physical, mental, or environmental."
  },
  {
    question: "Which factor is LEAST important when choosing a habit to track?",
    options: ["Measurability", "Meaningfulness", "Simplicity", "Popularity"],
    correctAnswer: "Popularity",
    explanation: "The most effective habits to track are ones that are meaningful to you personally, measurable, and simple enough to perform consistently. Popularity among others is less relevant."
  },
  {
    question: "What is the 'plateau of latent potential' in habit formation?",
    options: ["The point where progress becomes visible after a period of invisible progress", "The maximum benefit a habit can provide", "The period when habit tracking is most effective", "The point where a habit becomes automatic"],
    correctAnswer: "The point where progress becomes visible after a period of invisible progress",
    explanation: "The plateau of latent potential describes how progress isn't always linear—there's often a period where work isn't visibly paying off before a breakthrough occurs."
  },
  {
    question: "What does 'habit-stacking' build upon?",
    options: ["Existing routines", "Written commitments", "Public declarations", "Negative reinforcement"],
    correctAnswer: "Existing routines",
    explanation: "Habit-stacking leverages existing routines as triggers for new habits, using the established behavior as a reliable cue."
  },
  {
    question: "Which is NOT recommended for tracking multiple habits?",
    options: ["Using a habit tracker app", "Creating a habit calendar", "Starting all new habits simultaneously", "Using a habit journal"],
    correctAnswer: "Starting all new habits simultaneously",
    explanation: "Starting multiple habits at once can overwhelm your capacity for change. It's generally better to establish one habit before adding others."
  },
  {
    question: "What's the recommended approach to habit failure?",
    options: ["Start over completely", "Never miss twice", "Change to an easier habit", "Add punishment for failure"],
    correctAnswer: "Never miss twice",
    explanation: "The 'never miss twice' rule acknowledges that occasional lapses happen but prevents them from becoming permanent breaks by getting back on track immediately."
  },
  {
    question: "What is a 'keystone habit'?",
    options: ["The most difficult habit to form", "A habit that leads to other positive habits", "The first habit you track each day", "A habit requiring a physical key or tool"],
    correctAnswer: "A habit that leads to other positive habits",
    explanation: "Keystone habits create a cascade effect, naturally leading to other positive changes and improvements in various life areas."
  },
  {
    question: "Which is most effective for building a new habit?",
    options: ["Setting stretch goals", "Creating a detailed plan", "Making it obvious and easy", "Using monetary rewards"],
    correctAnswer: "Making it obvious and easy",
    explanation: "Making a habit obvious (clear cue) and easy to perform (low friction) significantly increases the likelihood of consistent execution and eventual habit formation."
  },
  {
    question: "What's the recommended way to break a bad habit?",
    options: ["Use pure willpower", "Make it invisible, difficult, or unsatisfying", "Set penalties for each occurrence", "Focus only on building good habits instead"],
    correctAnswer: "Make it invisible, difficult, or unsatisfying",
    explanation: "Breaking habits works best by inverting the principles of building good habits: make them invisible (remove cues), difficult to do, and unsatisfying."
  },
  {
    question: "Which statement about habit tracking is FALSE?",
    options: ["Visual tracking can increase motivation", "Missing one day of tracking ruins progress", "Tracking can make progress tangible", "The act of tracking is itself a habit"],
    correctAnswer: "Missing one day of tracking ruins progress",
    explanation: "Missing a day of tracking doesn't ruin progress. The important thing is to resume tracking as soon as possible rather than abandoning the system entirely."
  },
  {
    question: "What is 'habit bundling'?",
    options: ["Tracking multiple habits together", "Combining habits with rewards", "Grouping similar habits", "Performing habits in a specific sequence"],
    correctAnswer: "Combining habits with rewards",
    explanation: "Habit bundling combines a habit you're trying to build with something enjoyable or rewarding to increase motivation and consistency."
  },
  {
    question: "According to research, which is most effective for long-term habit change?",
    options: ["Focusing on results", "Focusing on systems", "Setting bigger goals", "Public accountability"],
    correctAnswer: "Focusing on systems",
    explanation: "Research shows that focusing on building effective systems and processes leads to more sustainable habit change than focusing solely on outcomes or results."
  },
  {
    question: "What is the 'minimum viable effort' approach to habits?",
    options: ["Doing the bare minimum required", "Finding the easiest version of a habit", "Making habits so small they're hard to avoid", "Only tracking essential habits"],
    correctAnswer: "Making habits so small they're hard to avoid",
    explanation: "The minimum viable effort approach involves scaling habits down to the smallest possible action that still moves you toward your goal, making them nearly impossible to avoid."
  },
  {
    question: "Which factor is most important for habit tracking success?",
    options: ["Using digital tools", "The visual appeal of your tracker", "Consistency of tracking", "Tracking many metrics"],
    correctAnswer: "Consistency of tracking",
    explanation: "Consistent tracking, regardless of the method used, is the most important factor for successful habit formation and maintenance."
  },
  {
    question: "What is 'failure premortem' in habit formation?",
    options: ["Analyzing why past habits failed", "Predicting and planning for potential obstacles", "Calculating the cost of failure", "Reflecting after failing at a habit"],
    correctAnswer: "Predicting and planning for potential obstacles",
    explanation: "A failure premortem involves anticipating what might cause your habit to fail before you begin, then creating contingency plans for those scenarios."
  },
  {
    question: "Which is NOT an effective cue for triggering a habit?",
    options: ["Time of day", "Previous action", "Specific location", "Feeling motivated"],
    correctAnswer: "Feeling motivated",
    explanation: "Motivation fluctuates naturally and isn't reliable as a habit cue. Effective cues are consistent: time, location, preceding events, or emotional states."
  },
  {
    question: "What does the '20-Second Rule' for habits suggest?",
    options: ["Take 20 seconds to consider before acting", "Make good habits 20 seconds easier", "Count to 20 before starting", "Every habit takes 20 seconds to trigger"],
    correctAnswer: "Make good habits 20 seconds easier",
    explanation: "The 20-Second Rule suggests reducing the time barrier to good habits by 20 seconds and adding 20 seconds of friction to bad habits to significantly impact behavior."
  },
  {
    question: "What is 'precrastination' in habit context?",
    options: ["Planning habits far in advance", "The tendency to do easy tasks first", "Completing a habit before the scheduled time", "Preparing all materials for a habit beforehand"],
    correctAnswer: "The tendency to do easy tasks first",
    explanation: "Precrastination is the tendency to tackle easier, less important tasks first instead of prioritizing more impactful habits or behaviors."
  },
  {
    question: "Which approach is most effective for habit slips?",
    options: ["Doubling efforts the next day", "Adding a penalty system", "Using the two-day rule", "Complete restart of the habit"],
    correctAnswer: "Using the two-day rule",
    explanation: "The two-day rule—never missing a habit two days in a row—is most effective for preventing temporary slips from becoming permanent abandonment."
  },
  {
    question: "What is a 'commitment device' for habits?",
    options: ["A written contract with yourself", "A choice made in advance to restrict future options", "A habit tracking app", "A reward for completing habits"],
    correctAnswer: "A choice made in advance to restrict future options",
    explanation: "A commitment device is a choice you make in the present that locks in your behavior in the future, making it harder to deviate from your intended habit."
  },
  {
    question: "Which is NOT a principle of the 'Four Laws of Behavior Change'?",
    options: ["Make it obvious", "Make it attractive", "Make it immediate", "Make it variable"],
    correctAnswer: "Make it variable",
    explanation: "The Four Laws are: make it obvious, make it attractive, make it easy, and make it satisfying. Consistency, not variability, typically strengthens habits."
  },
  {
    question: "What is 'habit substitution'?",
    options: ["Replacing a habit with a different activity", "Alternating between two habits", "Taking breaks from habits", "Combining two habits"],
    correctAnswer: "Replacing a habit with a different activity",
    explanation: "Habit substitution involves keeping the same cue but replacing the habitual response with a new, more desirable behavior that provides a similar reward."
  },
  {
    question: "Which best describes the principle of habit 'atomic-ness'?",
    options: ["Habits that involve nuclear science", "Focusing on tiny, easy-to-do habits", "Habits that cannot be broken down further", "Explosive growth from small habits"],
    correctAnswer: "Focusing on tiny, easy-to-do habits",
    explanation: "Atomic habits are tiny behaviors that require minimal motivation and effort but can lead to significant results when repeated consistently over time."
  },
  {
    question: "What is 'reward prediction error' in habit formation?",
    options: ["Miscalculating how rewarding a habit will be", "Expecting rewards too quickly", "The gap between expected and actual rewards", "Forgetting to reward yourself"],
    correctAnswer: "The gap between expected and actual rewards",
    explanation: "Reward prediction error refers to the difference between the reward we expect and what we actually experience, which plays a key role in habit reinforcement."
  },
  {
    question: "Which is true about habit formation time?",
    options: ["All habits take 21 days to form", "Complex habits form faster than simple ones", "Habit formation time varies widely between individuals", "Most habits form within one week"],
    correctAnswer: "Habit formation time varies widely between individuals",
    explanation: "Research shows habit formation can take anywhere from 18 to 254 days, with significant variation based on the person, the habit, and circumstances."
  },
  {
    question: "What's the most effective way to maintain motivation for habits?",
    options: ["Watching motivational videos daily", "Using social approval and connection", "Setting higher standards", "Changing habits frequently"],
    correctAnswer: "Using social approval and connection",
    explanation: "Social connections, accountability, and approval tap into our fundamental human needs and provide sustainable motivation for maintaining habits."
  },
  {
    question: "Which is NOT a component of the 'Hook Model' for habit formation?",
    options: ["Trigger", "Action", "Variable reward", "Visualization"],
    correctAnswer: "Visualization",
    explanation: "The Hook Model consists of trigger, action, variable reward, and investment. Visualization, while helpful, is not part of this particular framework."
  },
  {
    question: "What does the 'Fogg Behavior Model' state is needed for a behavior?",
    options: ["Motivation, ability, and a trigger", "Willpower, environment, and support", "Consistency, reward, and tracking", "Identity, system, and goal"],
    correctAnswer: "Motivation, ability, and a trigger",
    explanation: "According to BJ Fogg, behavior requires motivation, ability, and a prompt/trigger to occur. All three must be present simultaneously."
  },
  {
    question: "What is 'ego depletion' in relation to habits?",
    options: ["The tendency to overestimate willpower", "Diminished willpower after exerting self-control", "Loss of identity from changing habits", "Reduced motivation from comparing to others"],
    correctAnswer: "Diminished willpower after exerting self-control",
    explanation: "Ego depletion refers to the theory that willpower is a limited resource that becomes depleted after exerting self-control, affecting subsequent habit performance."
  },
  {
    question: "Which habit tracking method is likely most effective for visual people?",
    options: ["Digital app with statistics", "Spreadsheet tracking", "Color-coded calendar system", "Written journal entries"],
    correctAnswer: "Color-coded calendar system",
    explanation: "Visual learners tend to benefit most from color-coding and spatial representations of data, making calendar systems particularly effective for them."
  },
  {
    question: "What is 'habit creep'?",
    options: ["When habits gradually take more time than planned", "Adding too many habits simultaneously", "When old habits return unexpectedly", "The slow improvement of habits over time"],
    correctAnswer: "When habits gradually take more time than planned",
    explanation: "Habit creep occurs when initially quick habits gradually expand to take more time and energy than originally intended, potentially leading to abandonment."
  },
  {
    question: "Which statement about habit frequency is most accurate?",
    options: ["Daily habits always form faster than weekly ones", "Frequency needs depend on the specific habit", "More frequent tracking is always better", "Habits should always be tracked at the same time"],
    correctAnswer: "Frequency needs depend on the specific habit",
    explanation: "The optimal frequency for tracking depends on the nature of the habit—some naturally occur daily, while others are better suited to weekly or other intervals."
  },
  {
    question: "What is the 'Paper Clip Strategy' for habit building?",
    options: ["Using paper clips to bookmark habit journals", "A visual counting system for habit completion", "Attaching habit reminders to paper clips", "Writing habits on paper clips"],
    correctAnswer: "A visual counting system for habit completion",
    explanation: "The Paper Clip Strategy involves moving a paper clip from one container to another each time you complete a habit, providing visual progress tracking."
  },
  {
    question: "What is 'Ulysses Contract' in habit formation?",
    options: ["A 10-year habit plan", "A contract with a habit coach", "A binding commitment to prevent future temptation", "A reward system for habits"],
    correctAnswer: "A binding commitment to prevent future temptation",
    explanation: "A Ulysses Contract is a commitment made in advance that restricts your future choices, named after Ulysses binding himself to the mast to resist the Sirens' call."
  },
  {
    question: "Which is considered most effective for habit maintenance?",
    options: ["External rewards", "Identity-based motivation", "Strict penalties", "Public tracking"],
    correctAnswer: "Identity-based motivation",
    explanation: "Habits tied to how we see ourselves (identity) tend to be maintained longer than those motivated by external factors or temporary rewards."
  },
  {
    question: "What is 'bright-line rule' in habit formation?",
    options: ["Highlighting habits in bright colors", "A clear, unambiguous rule that's never broken", "Setting optimistic goals", "Using light therapy for habit timing"],
    correctAnswer: "A clear, unambiguous rule that's never broken",
    explanation: "A bright-line rule is a clear, definitive boundary that you don't cross, removing the ambiguity that can lead to habit breaks or exceptions."
  },
  {
    question: "Which is NOT a common reason habits fail?",
    options: ["Lack of clarity", "Trying to change too much at once", "Using a tracking system", "Relying solely on motivation"],
    correctAnswer: "Using a tracking system",
    explanation: "Using a tracking system generally supports habit success rather than contributing to failure. The other options are common reasons habits don't stick."
  },
  {
    question: "What is 'habit residue'?",
    options: ["The lasting impact of past habits", "The lingering effects when switching contexts", "The satisfaction from completing a habit", "The physical evidence of habit performance"],
    correctAnswer: "The lingering effects when switching contexts",
    explanation: "Habit residue refers to the lingering mental effects when switching between different tasks or contexts, which can reduce effectiveness and focus."
  },
  {
    question: "Which approach is most supported by habit research?",
    options: ["Setting ambitious habit goals to push yourself", "Creating complex tracking systems for accountability", "Making your desired habit the path of least resistance", "Focusing mainly on breaking bad habits first"],
    correctAnswer: "Making your desired habit the path of least resistance",
    explanation: "Research strongly supports designing your environment so that good habits require less effort than alternatives, making them the natural choice."
  },
  {
    question: "What is 'satisficing' in relation to habits?",
    options: ["Finding the minimum effective habit dose", "Combining satisfaction with sacrifice", "Choosing the first acceptable option rather than the optimal one", "Being satisfied with imperfect habit performance"],
    correctAnswer: "Choosing the first acceptable option rather than the optimal one",
    explanation: "Satisficing means selecting the first option that meets your acceptable criteria rather than searching for the 'perfect' approach, which can help overcome analysis paralysis in habit formation."
  }
]
export function QuizGame() {
  // State variables for controlling game logic
  const [gameStarted, setGameStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [roundQuestions, setRoundQuestions] = useState<any[]>([])
  const [roundScores, setRoundScores] = useState<number[]>([0, 0, 0])
  const [showRoundComplete, setShowRoundComplete] = useState(false)

  // Define the structure of the quiz in rounds
  const rounds = [
    { name: "Beginner", questionsCount: 5 },
    { name: "Intermediate", questionsCount: 6 },
    { name: "Advanced", questionsCount: 5 }
  ]

  // Calculate total questions per round
  const totalQuestionsPerRound = rounds.map(round => round.questionsCount)
  const totalQuestions = totalQuestionsPerRound.reduce((sum, count) => sum + count, 0)

  /**
   * Updates user stats in the backend when answering questions or completing rounds
   * @param {number} xp - XP earned
   * @param {boolean} correct - Whether the answer was correct
   * @param {boolean} roundCompleted - Whether a round was completed
   */
  const updateUserStats = async (xp: number, correct: boolean, roundCompleted: boolean) => {
    try {
      const res = await fetch('/api/users/update-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          xp,
          gameType: 'quizGame',
          correct,
          roundCompleted
        }),
      });
      if (!res.ok) throw new Error('Failed to update stats');
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  /**
   * Creates a follow-up quiz challenge task for the user
   * @param {number} totalScore - The user's final score
   */
  const createQuizTask = async (totalScore: number) => {
    try {
      const res = await fetch('/api/tasks/create-game-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameType: 'quizGame',
          title: 'Quiz Master Challenge',
          description: `Score ${totalScore + 3} or more in the next quiz`,
          xpReward: totalScore + 5,
          dueDate: new Date(Date.now() + 86400000 * 3) // Due in 3 days
        }),
      });
      if (!res.ok) throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating quiz task:', error);
    }
  };

  // Starts the game and initializes state
  const handleStartGame = () => {
    // Shuffle questions and select first round
    const shuffledQuestions = [...quizQuestions].sort(() => 0.5 - Math.random())
    const firstRoundQuestions = shuffledQuestions.slice(0, rounds[0].questionsCount)
    
    // Reset all game state
    setGameStarted(true)
    setGameOver(false)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer("")
    setShowExplanation(false)
    setIsAnswerChecked(false)
    setCurrentRound(0)
    setRoundQuestions(firstRoundQuestions)
    setRoundScores([0, 0, 0])
    setShowRoundComplete(false)
  }

  // Handles option selection
  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerChecked) {
      setSelectedAnswer(answer)
    }
  }

  // Checks the selected answer and updates score
  const handleCheckAnswer = () => {
    const correct = selectedAnswer === roundQuestions[currentQuestion].correctAnswer
    setIsCorrect(correct)
    setIsAnswerChecked(true)
    setShowExplanation(true)
    
    if (correct) {
      setScore(score + 1)
      // Update the current round's score
      const newRoundScores = [...roundScores]
      newRoundScores[currentRound] += 1
      setRoundScores(newRoundScores)
      
      // Update stats for correct answer
      updateUserStats(0, true, false)
    } else {
      // Update stats for incorrect answer
      updateUserStats(0, false, false)
    }
  }

  // Move to the next question or end the round
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < roundQuestions.length) {
      // Move to next question in current round
      setCurrentQuestion(nextQuestion)
      setSelectedAnswer("")
      setShowExplanation(false)
      setIsAnswerChecked(false)
    } else {
      // End of round - show round complete message
      setShowRoundComplete(true)
    }
  }

  // Advance to the next round or end game
  const handleNextRound = () => {
    const nextRound = currentRound + 1
    
    if (nextRound < 3) {
      // Start next round
      const startIndex = rounds.slice(0, nextRound).reduce((sum, round) => sum + round.questionsCount, 0)
      const endIndex = startIndex + rounds[nextRound].questionsCount
      
      // Get questions for the next round
      const nextRoundQuestions = quizQuestions.slice(startIndex, endIndex)
      
      setCurrentRound(nextRound)
      setRoundQuestions(nextRoundQuestions)
      setCurrentQuestion(0)
      setSelectedAnswer("")
      setShowExplanation(false)
      setIsAnswerChecked(false)
      setShowRoundComplete(false)
      
      // Update stats for round completion
      updateUserStats(0, false, true)
    } else {
      // End of game
      setGameOver(true)
      setGameStarted(false)
      setShowRoundComplete(false)

      // Calculate and award XP (minimum of score*2 or 20)
      const earnedXP = Math.min(score * 2, 20)
      
      // Update stats with final XP
      updateUserStats(earnedXP, false, true)
      // Create follow-up challenge
      createQuizTask(score)
      
      // Show completion toast
      toast({
        title: "Habit Quiz Complete!",
        description: `You scored ${score}/${totalQuestions} and earned ${earnedXP} XP!`,
      })
    }
  }

  // Render feedback and option to continue after each round
  const renderRoundComplete = () => {
    const roundScore = roundScores[currentRound]
    const roundTotal = rounds[currentRound].questionsCount
    const percentScore = Math.round((roundScore / roundTotal) * 100)
    
    let message = "";
    if (percentScore >= 80) {
      message = "Excellent! You've mastered this level.";
    } else if (percentScore >= 60) {
      message = "Good job! You've got a solid understanding.";
    } else {
      message = "Keep learning! You'll improve with practice.";
    }
    
    return (
      <Card className="bg-[#2a3343] border-[#3a4353]">
        <CardContent className="pt-6 pb-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Round {currentRound + 1} Complete!</h3>
          
          <div className="flex justify-center mb-4">
            <Badge className={`text-lg px-4 py-2 ${percentScore >= 70 ? "bg-green-500" : percentScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}>
              {roundScore}/{roundTotal} ({percentScore}%)
            </Badge>
          </div>
          
          <p className="text-white mb-6">{message}</p>
          
          <h4 className="text-lg font-medium text-white mb-2">
            {currentRound < 2 ? `Ready for ${rounds[currentRound + 1].name} Round?` : "Ready to see your final results?"}
          </h4>
          
          <Button 
            className="mt-4 bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black w-full"
            onClick={handleNextRound}
          >
            {currentRound < 2 ? "Start Next Round" : "See Final Results"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Controls that appear below the question
  const customControls = (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#2a3343]">
            Round {currentRound + 1}: {rounds[currentRound].name}
          </Badge>
          <Badge className="bg-[#2a3343]">
            Question {currentQuestion + 1}/{roundQuestions.length}
          </Badge>
        </div>
        <Badge className="bg-[#4cc9f0] text-black">
          Score: {score}
        </Badge>
      </div>
      
      <div className="flex justify-end">
        {!isAnswerChecked ? (
          <Button
            className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
          >
            Check Answer
          </Button>
        ) : (
          <Button
            className="bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black"
            onClick={handleNextQuestion}
          >
            {currentQuestion === roundQuestions.length - 1 ? "Complete Round" : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  )

  // Summary shown at the end of the game
  const renderRoundSummary = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Quiz Results</h3>
        
        <div className="space-y-2">
          {rounds.map((round, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-[#2a3343] rounded-md">
              <span>Round {index + 1}: {round.name}</span>
              <Badge className={roundScores[index] > round.questionsCount / 2 ? "bg-green-500" : "bg-red-500"}>
                {roundScores[index]}/{round.questionsCount}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-[#3a4353]">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Score:</span>
            <Badge className="text-lg bg-[#4cc9f0] text-black">
              {score}/{totalQuestions}
            </Badge>
          </div>
        </div>
      </div>
    )
  }

  // Main UI structure
  return (
    <GameWrapper
      title="Habit Building Quiz"
      description="Test your knowledge about habit formation and tracking across three challenging rounds!"
      gameStarted={gameStarted}
      gameOver={gameOver}
      score={score}
      onStart={handleStartGame}
      onEnd={() => {
        setGameOver(true)
        setGameStarted(false)
      }}
      customControls={gameStarted && !showRoundComplete ? customControls : undefined}
      summary={gameOver ? renderRoundSummary() : undefined}
    >
      {showRoundComplete ? (
        renderRoundComplete()
      ) : (
        <Card className="bg-[#2a3343] border-[#3a4353]">
          <CardContent className="pt-6">
            {roundQuestions[currentQuestion] && (
              <>
                <h3 className="text-lg font-medium text-white mb-4">{roundQuestions[currentQuestion].question}</h3>

                <RadioGroup value={selectedAnswer} className="space-y-3">
                  {roundQuestions[currentQuestion].options.map((option: string, index: number) => {
                    let optionClassName = "text-white";
                    
                    if (isAnswerChecked) {
                      if (option === roundQuestions[currentQuestion].correctAnswer) {
                        optionClassName = "text-green-400 font-bold";
                      } else if (option === selectedAnswer && option !== roundQuestions[currentQuestion].correctAnswer) {
                        optionClassName = "text-red-400 line-through";
                      }
                    }
                    
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          className={option === roundQuestions[currentQuestion].correctAnswer && isAnswerChecked ? "text-green-400" : "text-[#4cc9f0]"}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={isAnswerChecked}
                        />
                        <Label htmlFor={`option-${index}`} className={optionClassName}>
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>

                {showExplanation && (
                  <div className="mt-4 p-3 bg-[#1a2333] rounded-md border border-[#3a4353]">
                    <p className="text-white text-sm">
                      {roundQuestions[currentQuestion].explanation}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </GameWrapper>
  )
}
