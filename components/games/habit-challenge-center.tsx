"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styled, { keyframes } from "styled-components"
import { toast } from "../ui/use-toast"

const spaceTheme = {
  deepSpace: "#0E1A40",
  deepSpaceGradient: "linear-gradient(135deg, #0E1A40 0%, #13294B 100%)",
  accentGlow: "#32FFC0",
  accentGold: "#FFDF6C",
  textPrimary: "#D0E7FF",
  actionButton: "#00F9FF",
  actionButtonAlt: "#FF5DA0",
  highlight: "#FFFA81",
  highlightAlt: "#FBC638",
  calendarCell: "#1C2A4A",
  glassOverlay: "rgba(30, 39, 73, 0.8)",
}

const floatAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
  100% { transform: translateY(0) rotate(0deg); }
`

const glowPulse = keyframes`
  0% { text-shadow: 0 0 5px ${spaceTheme.accentGlow}, 0 0 10px ${spaceTheme.accentGlow}; }
  50% { text-shadow: 0 0 20px ${spaceTheme.accentGlow}, 0 0 30px ${spaceTheme.accentGlow}; }
  100% { text-shadow: 0 0 5px ${spaceTheme.accentGlow}, 0 0 10px ${spaceTheme.accentGlow}; }
`

const warping = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background: ${spaceTheme.deepSpaceGradient};
  color: ${spaceTheme.textPrimary};
  padding: 1rem;
  position: relative;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
`

const BackgroundOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 50%, rgba(50, 255, 192, 0.1) 0%, transparent 70%),
              radial-gradient(circle at 70% 70%, rgba(0, 249, 255, 0.1) 0%, transparent 60%);
  z-index: 1;
`

const GameHeader = styled.div`
  margin-bottom: 1rem;
  text-align: center;
  z-index: 10;
  width: 100%;
`

const GameTitle = styled.h1`
  font-size: 1.8rem;
  color: ${spaceTheme.accentGlow};
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 2px;
  text-shadow: 0 0 10px ${spaceTheme.accentGlow}, 0 0 20px ${spaceTheme.accentGlow};
  animation: ${glowPulse} 3s infinite ease-in-out;
  margin-bottom: 0.25rem;
`

const GameSubtitle = styled.p`
  font-size: 0.9rem;
  max-width: 600px;
  margin: 0.25rem auto;
  color: ${spaceTheme.textPrimary};
  opacity: 0.9;
`
const StatsContainer = styled.div`
  background: rgba(28, 42, 74, 0.7);
  backdrop-filter: blur(8px);
  padding: 0.8rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(50, 255, 192, 0.2);
  z-index: 10;
  width: 90%;
  max-width: 700px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${spaceTheme.accentGold};
  text-shadow: 0 0 10px rgba(255, 223, 108, 0.5);
`

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${spaceTheme.textPrimary};
  opacity: 0.8;
  margin-top: 0.15rem;
`

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
  background: rgba(28, 42, 74, 0.6);
  backdrop-filter: blur(8px);
  padding: 0.4rem;
  border-radius: 10px;
  z-index: 10;
  border: 1px solid rgba(50, 255, 192, 0.2);
`

interface TabButtonProps {
  active: boolean;
}
const TabButton = styled.button<TabButtonProps>`
  padding: 0.5rem 0.8rem;
  background: ${({ active }) => (active ? 'rgba(50, 255, 192, 0.3)' : 'transparent')};
  color: ${({ active }) => (active ? spaceTheme.accentGlow : spaceTheme.textPrimary)};
  border: ${({ active }) => (active ? `1px solid ${spaceTheme.accentGlow}` : '1px solid transparent')};
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  text-shadow: ${({ active }) => (active ? `0 0 5px ${spaceTheme.accentGlow}` : 'none')};

  &:hover {
    background: ${({ active }) => (active ? 'rgba(50, 255, 192, 0.4)' : 'rgba(50, 255, 192, 0.1)')};
    text-shadow: 0 0 5px ${spaceTheme.accentGlow};
  }
`

const HabitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.8rem;
  width: 100%;
  max-width: 1000px;
  z-index: 10;
`

interface HabitCardProps {
  color?: string;
}

const HabitCard = styled.div<HabitCardProps>`
  background: rgba(14, 26, 64, 0.8);
  backdrop-filter: blur(8px);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(50, 255, 192, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${warping} 0.5s ease-out;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ color }) => color || spaceTheme.accentGlow};
    box-shadow: 0 0 10px ${({ color }) => color || spaceTheme.accentGlow};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  }
`
interface HabitTitleProps {
    color?: string;
  }
 
  const HabitTitle = styled.h3<HabitTitleProps>`
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    color: ${({ color }) => color || spaceTheme.accentGlow};
    font-size: 0.9rem;
    font-family: 'Montserrat', sans-serif;
    font-weight: normal;
    text-shadow: none;
  `
 
  const HabitEmoji = styled.span`
    font-size: 1.1rem;
    margin-right: 0.5rem;
  `
 
  interface ButtonProps {
    selected?: boolean;
    difficulty?: 'easy' | 'moderate' | 'hard';
    disabled?: boolean;
  }
 
  const Button = styled.button<ButtonProps>`
    margin: 0.25rem 0.15rem;
    background: ${({ selected, difficulty }) =>
      selected
        ? (difficulty === 'easy'
            ? 'rgba(50, 255, 192, 0.7)'
            : difficulty === 'moderate'
            ? 'rgba(255, 223, 108, 0.7)'
            : 'rgba(255, 93, 160, 0.7)')
        : 'rgba(28, 42, 74, 0.4)'};
    color: ${({ selected }) => (selected ? spaceTheme.deepSpace : spaceTheme.textPrimary)};
    border: 1px solid ${({ selected, difficulty }) =>
      selected
        ? (difficulty === 'easy'
            ? spaceTheme.accentGlow
            : difficulty === 'moderate'
            ? spaceTheme.accentGold
            : spaceTheme.actionButtonAlt)
        : 'rgba(50, 255, 192, 0.3)'};
    padding: 0.4rem 0.7rem;
    border-radius: 6px;
    cursor: ${props => props.disabled ? 'default' : 'pointer'};
    font-weight: bold;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    font-family: 'Orbitron', sans-serif;
    text-shadow: ${({ selected }) => (selected ? 'none' : `0 0 5px rgba(208, 231, 255, 0.5)`)};
    font-size: 0.75rem;
 
    &:hover {
      transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
      box-shadow: ${props => props.disabled ? 'none' : `0 0 15px rgba(50, 255, 192, 0.3)`};
      background: ${({ selected, difficulty }) => {
        if (selected) {
          if (difficulty === 'easy') return 'rgba(50, 255, 192, 0.8)';
          if (difficulty === 'moderate') return 'rgba(255, 223, 108, 0.8)';
          return 'rgba(255, 93, 160, 0.8)';
        }
        return 'rgba(28, 42, 74, 0.6)';
      }};
    }
  `
  interface MessageBoxProps {
    type?: 'easy' | 'moderate' | 'hard';
  }
 
  const MessageBox = styled.div<MessageBoxProps>`
    margin-top: 0.75rem;
    padding: 0.6rem;
    font-size: 0.8rem;
    color: white;
    background: ${({ type }) =>
      type === 'easy'
        ? 'linear-gradient(135deg, rgba(50, 255, 192, 0.9), rgba(50, 255, 192, 0.7))'
        : type === 'moderate'
        ? 'linear-gradient(135deg, rgba(255, 223, 108, 0.9), rgba(255, 223, 108, 0.7))'
        : 'linear-gradient(135deg, rgba(255, 93, 160, 0.9), rgba(255, 93, 160, 0.7))'};
    border-radius: 6px;
    transform: translateY(0);
    animation: ${warping} 0.3s ease-out;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `
 
  const CompleteSetButton = styled.button`
    margin-top: 1.25rem;
    background: linear-gradient(to right, ${spaceTheme.accentGlow}, ${spaceTheme.actionButton});
    color: ${spaceTheme.deepSpace};
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 10px;
    font-weight: bold;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(50, 255, 192, 0.5);
    z-index: 10;
    font-family: 'Orbitron', sans-serif;
 
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 25px rgba(50, 255, 192, 0.7);
    }
 
    &:active {
      transform: translateY(1px);
    }
  `
  const CompletionMessage = styled.div`
  background: linear-gradient(120deg, rgba(50, 255, 192, 0.3) 0%, rgba(0, 249, 255, 0.3) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid ${spaceTheme.accentGlow};
  color: ${spaceTheme.textPrimary};
  padding: 1.25rem;
  border-radius: 12px;
  margin: 1.25rem 0;
  text-align: center;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 0 20px rgba(50, 255, 192, 0.3);
  animation: ${warping} 0.5s ease-out;
  position: relative;
  z-index: 10;

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
    color: ${spaceTheme.accentGlow};
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 10px ${spaceTheme.accentGlow};
  }

  p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
`

const WeekCompletionMessage = styled(CompletionMessage)`
  background: linear-gradient(120deg, rgba(255, 223, 108, 0.3) 0%, rgba(255, 193, 7, 0.3) 100%);
  border: 1px solid ${spaceTheme.accentGold};

  h3 {
    color: ${spaceTheme.accentGold};
    text-shadow: 0 0 10px ${spaceTheme.accentGold};
  }
`
const LevelInfo = styled.div`
  font-weight: bold;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  z-index: 10;
  color: ${spaceTheme.textPrimary};

  span {
    background: rgba(50, 255, 192, 0.2);
    color: ${spaceTheme.accentGlow};
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-family: 'Orbitron', sans-serif;
    border: 1px solid rgba(50, 255, 192, 0.3);
    text-shadow: 0 0 5px ${spaceTheme.accentGlow};
  }
`

const XPBar = styled.div`
  background: rgba(28, 42, 74, 0.6);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  height: 15px;
  overflow: hidden;
  margin: 0.3rem 0 0.75rem;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(50, 255, 192, 0.2);
  z-index: 10;
`

interface XPProgressProps {
  xp: number;
}

const XPProgress = styled.div<XPProgressProps>`
  background: linear-gradient(90deg, ${spaceTheme.accentGlow}, ${spaceTheme.actionButton});
  height: 100%;
  width: ${({ xp }) => `${(xp / 50) * 100}%`};
  transition: width 0.5s ease;
  border-radius: 20px;
  position: relative;

  &:after {
    content: '${({ xp }) => xp}/50 XP';
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.6rem;
    color: ${spaceTheme.deepSpace};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    font-weight: bold;
  }
`
const BadgeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  z-index: 10;
  justify-content: center;
`

interface BadgeProps {
  color?: string;
}

const Badge = styled.span<BadgeProps>`
  background: ${props => props.color || spaceTheme.accentGlow};
  color: ${spaceTheme.deepSpace};
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: bold;
  box-shadow: 0 0 10px ${props => props.color || spaceTheme.accentGlow};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);

  &:before {
    content: '🏆';
  }
`

const ResetXPButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  justify-content: center;
  z-index: 10;
`

const ResetButton = styled.button`
  padding: 0.4rem 1rem;
  background: rgba(255, 93, 160, 0.3);
  color: ${spaceTheme.textPrimary};
  border: 1px solid ${spaceTheme.actionButtonAlt};
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;

  &:hover {
    background: rgba(255, 93, 160, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 0 10px rgba(255, 93, 160, 0.5);
    color: white;
  }

  &:active {
    transform: translateY(1px);
  }
`
const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  z-index: 10;
  width: 100%;
  max-width: 600px;
`

const NavigationButton = styled.button`
  background: linear-gradient(to right, ${spaceTheme.actionButton}, ${spaceTheme.accentGlow});
  color: ${spaceTheme.deepSpace};
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 249, 255, 0.3);
  font-family: 'Orbitron', sans-serif;
  font-size: 0.85rem;
  flex: 1;
  max-width: 200px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 15px rgba(50, 255, 192, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }
`

const WeeklyProgress = styled.div`
  width: 100%;
  max-width: 600px;
  background: rgba(28, 42, 74, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(50, 255, 192, 0.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 10;
`

interface ProgressCircleProps {
  active: boolean;
}
const ProgressCircle = styled.div<ProgressCircleProps>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${({ active }) => active ? spaceTheme.deepSpace : spaceTheme.textPrimary};
  background: ${({ active }) =>
    active ? `linear-gradient(135deg, ${spaceTheme.accentGlow}, ${spaceTheme.actionButton})` :
    'rgba(28, 42, 74, 0.5)'};
  border: 1px solid ${({ active }) => active ? spaceTheme.accentGlow : 'rgba(208, 231, 255, 0.3)'};
  box-shadow: ${({ active }) =>
    active ? `0 0 10px ${spaceTheme.accentGlow}` : 'none'};
  transition: all 0.3s ease;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;

  &:hover {
    transform: ${({ active }) => active ? 'scale(1.1)' : 'scale(1.05)'};
    box-shadow: 0 0 8px rgba(50, 255, 192, 0.5);
  }
`

interface DayCardProps {
  isComplete: boolean;
}

const DayCard = styled.div<DayCardProps>`
  background: rgba(14, 26, 64, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(50, 255, 192, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 10;
  animation: ${warping} 0.5s ease-out;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: ${({ isComplete }) => isComplete ? spaceTheme.accentGlow : spaceTheme.actionButton};
    box-shadow: 0 0 15px ${({ isComplete }) => isComplete ? spaceTheme.accentGlow : spaceTheme.actionButton};
  }

  &:after {
    content: '${({ isComplete }) => isComplete ? 'COMPLETED' : ''}';
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(50, 255, 192, 0.2);
    color: ${spaceTheme.accentGlow};
    font-size: 0.6rem;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    opacity: ${({ isComplete }) => isComplete ? '1' : '0'};
    border: 1px solid ${spaceTheme.accentGlow};
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 5px ${spaceTheme.accentGlow};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  }
`
const DayTitle = styled.h3`
  color: ${spaceTheme.actionButton};
  margin-bottom: 1rem;
  font-size: 1.1rem;
  position: relative;
  font-family: 'Orbitron', sans-serif;
  text-shadow: 0 0 5px ${spaceTheme.actionButton};

  &:after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 40px;
    height: 2px;
    background: ${spaceTheme.actionButton};
    border-radius: 2px;
    box-shadow: 0 0 5px ${spaceTheme.actionButton};
  }
`

const HabitOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`

interface HabitOptionProps {
  status: 'checked' | 'crossed' | 'unchecked';
}

const HabitOption = styled.div<HabitOptionProps>`
  background: ${({ status }) =>
    status === 'checked'
      ? 'linear-gradient(135deg, rgba(50, 255, 192, 0.4), rgba(0, 249, 255, 0.4))'
      : status === 'crossed'
      ? 'linear-gradient(135deg, rgba(255, 93, 160, 0.4), rgba(236, 72, 153, 0.4))'
      : 'linear-gradient(135deg, rgba(28, 42, 74, 0.6), rgba(19, 41, 75, 0.6))'};
  padding: 0.9rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  flex: 1 1 calc(33% - 0.75rem);
  min-width: 100px;
  max-width: 160px;
  transition: all 0.3s ease;
  text-align: center;
  border: 1px solid ${({ status }) =>
    status === 'checked' ? 'rgba(50, 255, 192, 0.5)' :
    status === 'crossed' ? 'rgba(255, 93, 160, 0.5)' :
    'rgba(208, 231, 255, 0.2)'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border-color: ${({ status }) =>
      status === 'checked' ? spaceTheme.accentGlow :
      status === 'crossed' ? spaceTheme.actionButtonAlt :
      spaceTheme.actionButton};
  }

  &:after {
    content: '${({ status }) => status === 'checked' ? '✓' : status === 'crossed' ? '✕' : ''}';
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 0.8rem;
    color: ${({ status }) =>
      status === 'checked' ? spaceTheme.accentGlow :
      status === 'crossed' ? spaceTheme.actionButtonAlt :
      'transparent'};
    text-shadow: ${({ status }) =>
      status === 'checked' ? `0 0 5px ${spaceTheme.accentGlow}` :
      status === 'crossed' ? `0 0 5px ${spaceTheme.actionButtonAlt}` :
      'none'};
    font-weight: bold;
  }
`
interface HabitTextProps {
    status: 'checked' | 'crossed' | 'unchecked';
  }
 
  const HabitText = styled.div<HabitTextProps>`
    font-weight: bold;
    font-size: 0.9rem;
    color: ${({ status }) =>
      status === 'checked' ? spaceTheme.accentGlow :
      status === 'crossed' ? spaceTheme.actionButtonAlt :
      spaceTheme.textPrimary};
    text-shadow: ${({ status }) =>
      status === 'checked' ? `0 0 5px ${spaceTheme.accentGlow}` :
      status === 'crossed' ? `0 0 5px ${spaceTheme.actionButtonAlt}` :
      'none'};
  `
 
  const NextDayButton = styled.button`
    margin-top: 1.5rem;
    background: linear-gradient(to right, ${spaceTheme.accentGold}, ${spaceTheme.highlightAlt});
    color: ${spaceTheme.deepSpace};
    border: none;
    padding: 0.85rem 2rem;
    border-radius: 10px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 0 15px rgba(255, 223, 108, 0.4);
    transition: all 0.3s ease;
    font-family: 'Orbitron', sans-serif;
    z-index: 10;
 
    &:hover {
      background: linear-gradient(to right, ${spaceTheme.highlightAlt}, ${spaceTheme.accentGold});
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(255, 223, 108, 0.6);
    }
 
    &:active {
      transform: translateY(1px);
    }
  `
 
  const XPNotification = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(120deg, ${spaceTheme.accentGlow}, ${spaceTheme.actionButton});
    color: ${spaceTheme.deepSpace};
    padding: 1.2rem;
    border-radius: 12px;
    box-shadow: 0 0 20px rgba(50, 255, 192, 0.6);
    z-index: 100;
    animation: ${slideInRight} 0.5s ease forwards, ${fadeOut} 0.5s ease 2.5s forwards;
    font-weight: bold;
    font-family: 'Orbitron', sans-serif;
    font-size: 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
  `
interface HabitItem {
    text: string;
    emoji: string;
  }
 
  interface BadgeItem {
    title: string;
    color: string;
  }
 
  const allWeeklyHabits = [
    "Drink 8 glasses of water", "Stretch for 5 mins", "Journal for 3 mins", "Meditate 5 mins", "Walk 15 mins",
    "Plan tomorrow's tasks", "No sugar today", "Read 10 mins", "Sleep by 10 PM", "Digital detox 1hr",
    "Gratitude note", "Listen to a podcast", "Mindful eating", "Go offline 1 hr", "Declutter space",
    "Reflect for 5 mins", "Step outside", "No phone in morning", "Set priorities", "Celebrate a small win",
    "Do 10 pushups", "Write 3 things you're grateful for", "Limit screen time", "Compliment someone",
    "Eat a fruit", "Do one kind act", "Learn a new word", "Clean your desktop", "Check goals progress",
    "Organize one drawer", "Do a brain teaser", "Say positive affirmations", "Message a loved one",
    "Practice breathing", "Avoid junk food", "Do yoga for 5 mins", "Write a journal page", "Drink green tea",
    "Send a thank-you message", "Wake up early", "Go to bed on time", "Visualize your goals",
    "Draw something", "Practice a skill", "Revisit old notes", "Read an article", "Do a posture check",
    "Watch a motivational video", "Fix one small annoyance"
  ]
  const allHourlyHabits: HabitItem[] = [
    { text: "Prepare a mind map summarizing a topic you studied", emoji: "🧠" },
    { text: "Complete one coding problem from a practice platform", emoji: "💻" },
    { text: "Record a 1-minute voice note reflecting on your mood", emoji: "🎙️" },
    { text: "Read a page from a technical or non-fiction book", emoji: "📚" },
    { text: "Declutter your workspace or study table", emoji: "🧹" },
    { text: "Write a short paragraph on something new you learned", emoji: "✏️" },
    { text: "Rewatch a key class concept and take fresh notes", emoji: "📝" },
    { text: "Outline the steps needed to complete your next assignment", emoji: "📋" },
    { text: "Write an email or message to ask for feedback from a mentor", emoji: "📧" },
    { text: "Practice public speaking by reading aloud for 2 minutes", emoji: "🗣️" },
    { text: "Do a 5-minute breathing exercise to improve focus", emoji: "🧘" },
    { text: "Draw a sketch of a concept you're learning", emoji: "🎨" },
    { text: "Solve a quick puzzle or riddle to stimulate your brain", emoji: "🧩" },
    { text: "Write down three goals for tomorrow", emoji: "🎯" },
    { text: "Review your notes from earlier today", emoji: "📔" },
    { text: "Take a short walk while thinking about a problem", emoji: "🚶" },
    { text: "Research a topic you're curious about for 5 minutes", emoji: "🔍" },
    { text: "Organize your digital files for 5 minutes", emoji: "📁" },
    { text: "Do 10 jumping jacks to boost your energy", emoji: "🏃" },
    { text: "Try a new study technique for 10 minutes", emoji: "⏱️" },
    { text: "Look up a word you don't know and use it in a sentence", emoji: "📖" },
    { text: "Send a message to a classmate to discuss a topic", emoji: "💬" },
    { text: "Drink a glass of water and stretch your body", emoji: "💧" },
    { text: "Write down one thing you're grateful for today", emoji: "🙏" },
    { text: "Review your progress on a current project", emoji: "📊" },
    { text: "Set a specific goal for your next study session", emoji: "🏆" },
    { text: "Draw a flowchart of a process you're learning", emoji: "📈" },
    { text: "Create flashcards for terms you need to memorize", emoji: "🗂️" },
    { text: "Send yourself a voice message with 3 key learnings today", emoji: "🎤" },
    { text: "List three ways to improve your productivity tomorrow", emoji: "⚡" }
  ]
  const weeklyEmojis = [
    "💧", "🧘", "📝", "🧠", "🚶", "📋", "🍎", "📚", "😴", "📵",
    "🙏", "🎧", "🍽️", "⏰", "🧹", "💭", "🌳", "📱", "🎯", "🎉",
    "💪", "✍️", "📺", "😊", "🍏", "❤️", "📖", "💻", "📊", "🧽",
    "🧩", "✨", "💌", "🌬️", "🍔", "🧘", "📔", "🍵", "📨", "🌅",
    "🛌", "🌈", "🎨", "🔄", "📑", "📰", "⚡", "🎬", "🔧"
  ]
 
  const feedbackMessages = {
    easy: [
      "Great start! Every small step counts in your journey.",
      "Nice job! Progress sparkles across the constellation of habits.",
      "Well done! Keep building momentum through the galaxy of consistency.",
      "Good choice! Steady habits outshine even the brightest stars.",
      "5 XP added to your stellar collection! Small steps create massive change."
    ],
    moderate: [
      "Impressive effort! Your commitment shines like a supernova.",
      "Solid work! You're navigating the habit universe with real skill.",
      "Strong choice! Your dedication illuminates the path forward.",
      "7 XP earned for your collection! You're reaching escape velocity.",
      "Excellent! You're entering the growth zone where habits become automatic."
    ],
    hard: [
      "Outstanding work! You've tackled a challenging habit with power.",
      "Remarkable discipline! That's the path to becoming a habit master.",
      "Powerful choice! You're building habits that will transform your universe.",
      "10 XP added to your galactic score! Your determination creates new stars.",
      "Fantastic effort! The difficult path leads to the greatest growth and rewards."
    ]
  }
const getCompletionMessage = (xp: number): string => {
    if (xp >= 90) return "Legendary Performance!"
    if (xp >= 70) return "Stellar Achievement!"
    if (xp >= 50) return "Interstellar Success!"
    return "Galactic Progress!"
  }
 
  const getWeeklyHabits = (): HabitItem[][] => {
    const shuffled = [...allWeeklyHabits].sort(() => 0.5 - Math.random())
    const weeklySet: HabitItem[][] = []
 
    for (let i = 0; i < 7; i++) {
      const dayHabits: HabitItem[] = []
      for (let j = 0; j < 3; j++) {
        const habitIndex = i * 3 + j
        dayHabits.push({
          text: shuffled[habitIndex],
          emoji: weeklyEmojis[Math.floor(Math.random() * weeklyEmojis.length)]
        })
      }
      weeklySet.push(dayHabits)
    }
    return weeklySet
  }
 
  const getHourlyHabits = (): HabitItem[] => {
    const shuffled = [...allHourlyHabits].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 10)
  }
 
  const getBadges = (level: number): BadgeItem[] => {
    const badgeMap: Record<number, BadgeItem> = {
      1: { title: "Starter", color: spaceTheme.actionButton },
      2: { title: "Star Explorer", color: "#8B5CF6" },
      3: { title: "Nebula Achiever", color: spaceTheme.actionButtonAlt },
      4: { title: "Orbital Pro", color: spaceTheme.accentGold },
      5: { title: "Galactic Champion", color: spaceTheme.accentGlow },
      6: { title: "Supernova Master", color: "#6366F1" },
      7: { title: "Celestial Legend", color: "#EF4444" },
      8: { title: "Quantum Mythic", color: "#8B5CF6" },
      9: { title: "Universal Guru", color: spaceTheme.accentGold },
      10: { title: "Elite", color: spaceTheme.accentGlow }
    }
 
    return Object.entries(badgeMap)
      .filter(([lvl]) => parseInt(lvl) <= level)
      .map(([_, data]) => data)
  }
  const getDayName = (index: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[index]
  }
 
  const useHabit = () => ({
    updateProgress: (type: string, amount: number) => {
      console.log(`Updated ${type} progress by ${amount} XP`)
    }
  })      

  export function  HabitChallengeCenter () {
    const [tab, setTab] = useState<'hourly' | 'weekly'>('hourly')
    const [hourlyHabits, setHourlyHabits] = useState(getHourlyHabits())
    const [weeklyHabits, setWeeklyHabits] = useState(getWeeklyHabits())
    const [completedHourly, setCompletedHourly] = useState<Record<number, string>>({})
    const [hourlyMessages, setHourlyMessages] = useState<Record<number, string>>({})
    const [completedWeekly, setCompletedWeekly] = useState<number[][]>(Array(7).fill(0).map(() => []))
    const [hourlyXP, setHourlyXP] = useState(0)
    const [weeklyXP, setWeeklyXP] = useState(0)
    const [totalXP, setTotalXP] = useState(0)
    const [level, setLevel] = useState(1)
    const [showXPNotification, setShowXPNotification] = useState(false)
    const [xpGained, setXpGained] = useState(0)
    const [showCompletionMessage, setShowCompletionMessage] = useState(false)
    const [showWeekCompletionMessage, setShowWeekCompletionMessage] = useState(false)
    const [activeDay, setActiveDay] = useState(0)
 
    const { updateProgress } = useHabit()
    const router = useRouter()
 
    const colors = [
      spaceTheme.accentGlow,
      spaceTheme.actionButton,
      spaceTheme.accentGold,
      spaceTheme.actionButtonAlt,
      spaceTheme.highlight,
      '#8B5CF6',
      '#EC4899',
      '#14b8a6',
      '#f59e0b',
      '#6366f1'
    ]
    useEffect(() => {
        if (
          Object.keys(completedHourly).length === hourlyHabits.length &&
          Object.keys(completedHourly).length > 0
        ) {
          setShowCompletionMessage(true)
          setTimeout(() => {
            setShowCompletionMessage(false)
          }, 6000)
        }
      }, [completedHourly, hourlyHabits.length])
   
      useEffect(() => {
        const newLevel = Math.floor(totalXP / 50) + 1
        setLevel(newLevel)
      }, [totalXP])
   
      useEffect(() => {
        const isComplete = completedWeekly.every((day, index) =>
          day.length === weeklyHabits[index].length
        )
   
        if (isComplete && completedWeekly.some(day => day.length > 0)) {
          setShowWeekCompletionMessage(true)
          setTimeout(() => {
            setShowWeekCompletionMessage(false)
          }, 6000)
        }
      }, [completedWeekly, weeklyHabits])
   
      const handleTabChange = (newTab: 'hourly' | 'weekly') => {
        setTab(newTab)
      }
   
      const handleHabitCompletion = async (index: number, difficulty: 'easy' | 'moderate' | 'hard') => {
        if (completedHourly[index]) return;
     
        const xp = difficulty === 'easy' ? 5 : difficulty === 'moderate' ? 7 : 10;
        setCompletedHourly(prev => ({ ...prev, [index]: difficulty }));
     
        const message = feedbackMessages[difficulty][Math.floor(Math.random() * feedbackMessages[difficulty].length)];
        setHourlyMessages(prev => ({ ...prev, [index]: message }));
        setHourlyXP(prev => prev + xp);
        setTotalXP(prev => prev + xp);
        updateProgress('games', xp);
     
        await fetch("/api/users/leaderboard/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xpGained: xp, source: "habit_challenge" }),
        });
     
        setXpGained(xp);
        setShowXPNotification(true);
        setTimeout(() => setShowXPNotification(false), 3000);      
      }

      const handleWeeklyHabitToggle = async (dayIndex: number, habitIndex: number) => {
        const updated = [...completedWeekly];
        const pos = updated[dayIndex].indexOf(habitIndex);
     
        if (pos > -1) {
          updated[dayIndex].splice(pos, 1);
          setWeeklyXP(prev => prev - 10);
          setTotalXP(prev => prev - 10);
        } else {
          updated[dayIndex].push(habitIndex);
          setWeeklyXP(prev => prev + 10);
          setTotalXP(prev => prev + 10);
          updateProgress('games', 10);
     
          await fetch("/api/users/leaderboard/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ xpGained: 10, source: "habit_challenge" }),
          });
          
          // Dispatch xp-update event to refresh performance chart
          window.dispatchEvent(new CustomEvent('xp-update'));
          
          setXpGained(10);
          setShowXPNotification(true);
          setTimeout(() => setShowXPNotification(false), 3000);      
        }
      }      
   
      const regenerateHourlyHabits = () => {
        setHourlyHabits(getHourlyHabits())
        setCompletedHourly({})
        setHourlyMessages({})
        setShowCompletionMessage(false)
      }
   
      const regenerateWeeklyHabits = () => {
        setWeeklyHabits(getWeeklyHabits())
        setCompletedWeekly(Array(7).fill(0).map(() => []))
        setShowWeekCompletionMessage(false)
      }
   
      const resetXP = () => {
        setHourlyXP(0)
        setWeeklyXP(0)
        setTotalXP(0)
      }
   
      const getTotalWeekCompletion = () => {
        const total = weeklyHabits.reduce((acc, day) => acc + day.length, 0)
        const completed = completedWeekly.reduce((acc, day) => acc + day.length, 0)
        return Math.round((completed / total) * 100)
      }
   
      const getDayCompletion = (dayIndex: number) => {
        return Math.round((completedWeekly[dayIndex].length / weeklyHabits[dayIndex].length) * 100)
      }
      const handleNextDay = async () => {
        const next = activeDay + 1;
        if (next <= 6) {
          setActiveDay(next);
          const xp = 10;
          setTotalXP(prev => prev + xp);
          updateProgress('games', xp);
     
          // New added: Leaderboard API call
          await fetch("/api/users/leaderboard/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ xpGained: xp, source: "habit_challenge" }),
          });
     
          setXpGained(xp);
          setShowXPNotification(true);
          setTimeout(() => setShowXPNotification(false), 2500);
        }
      }      
   
      const navigateHome = () => {
        router.push('/dashboard')
      }
   
      const navigateToBreakthrough = () => {
        router.push('/breakthrough-game')
      }
      return (
        <GameContainer>
          <BackgroundOverlay />
   
          <GameHeader>
            <GameTitle>Habit Challenge Center</GameTitle>
            <GameSubtitle>Complete challenges to earn XP and level up your habits</GameSubtitle>
          </GameHeader>
   
          <NavigationButtons>
            <NavigationButton onClick={navigateHome}>Home</NavigationButton>
            <NavigationButton onClick={navigateToBreakthrough}>Breakthrough Game</NavigationButton>
          </NavigationButtons>
   
          <StatsContainer>
            <StatItem>
              <StatValue>{hourlyXP}</StatValue>
              <StatLabel>Hourly XP</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{weeklyXP}</StatValue>
              <StatLabel>Weekly XP</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{totalXP}</StatValue>
              <StatLabel>Total XP</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{level}</StatValue>
              <StatLabel>Level</StatLabel>
            </StatItem>
          </StatsContainer>
   
          <LevelInfo>
            Level <span>{level}</span> Habit Builder
          </LevelInfo>
   
          <XPBar>
            <XPProgress xp={totalXP % 50} />
          </XPBar>
   
          <BadgeList>
            {getBadges(level).map((badge, index) => (
              <Badge key={index} color={badge.color}>{badge.title}</Badge>
            ))}
          </BadgeList>
          <Tabs>
        <TabButton active={tab === 'hourly'} onClick={() => handleTabChange('hourly')}>
          Hourly Habits
        </TabButton>
        <TabButton active={tab === 'weekly'} onClick={() => handleTabChange('weekly')}>
          Weekly Challenge
        </TabButton>
      </Tabs>

      {tab === 'hourly' ? (
        <>
          <HabitGrid>
            {hourlyHabits.map((habit, index) => (
              <HabitCard key={index} color={colors[index % colors.length]}>
                <HabitTitle color={colors[index % colors.length]}>
                  <HabitEmoji>{habit.emoji}</HabitEmoji> {habit.text}
                </HabitTitle>

                <div>
                  <Button
                    selected={completedHourly[index] === 'easy'}
                    difficulty="easy"
                    onClick={() => handleHabitCompletion(index, 'easy')}
                    disabled={!!completedHourly[index]}
                  >
                    Easy (5 XP)
                  </Button>
                  <Button
                    selected={completedHourly[index] === 'moderate'}
                    difficulty="moderate"
                    onClick={() => handleHabitCompletion(index, 'moderate')}
                    disabled={!!completedHourly[index]}
                  >
                    Moderate (7 XP)
                  </Button>
                  <Button
                    selected={completedHourly[index] === 'hard'}
                    difficulty="hard"
                    onClick={() => handleHabitCompletion(index, 'hard')}
                    disabled={!!completedHourly[index]}
                  >
                    Hard (10 XP)
                  </Button>
                </div>

                {completedHourly[index] && hourlyMessages[index] && (
                  <MessageBox type={completedHourly[index] as 'easy' | 'moderate' | 'hard'}>
                    {hourlyMessages[index]}
                  </MessageBox>
                )}
              </HabitCard>
            ))}
          </HabitGrid>
          {showCompletionMessage && (
            <CompletionMessage>
              <h3>{getCompletionMessage(hourlyXP)}</h3>
              <p>You've completed all of today's habit challenges and earned {hourlyXP} XP!</p>
              <p>Come back tomorrow for new challenges or regenerate a new set now.</p>
            </CompletionMessage>
          )}

          {Object.keys(completedHourly).length > 0 && (
            <CompleteSetButton onClick={regenerateHourlyHabits}>
              Generate New Habit Set
            </CompleteSetButton>
          )}
        </>
      ) : (
        <>
          <WeeklyProgress>
            {Array(7).fill(0).map((_, index) => (
              <ProgressCircle
                key={index}
                active={activeDay === index || getDayCompletion(index) === 100}
                onClick={() => setActiveDay(index)}
              >
                {index + 1}
              </ProgressCircle>
            ))}
          </WeeklyProgress>

          <DayCard isComplete={getDayCompletion(activeDay) === 100}>
            <DayTitle>{getDayName(activeDay)}</DayTitle>

            <HabitOptionsContainer>
              {weeklyHabits[activeDay].map((habit, index) => {
                const isCompleted = completedWeekly[activeDay].includes(index)
                return (
                  <HabitOption
                    key={index}
                    status={isCompleted ? 'checked' : 'unchecked'}
                    onClick={() => handleWeeklyHabitToggle(activeDay, index)}
                  >
                    <HabitEmoji>{habit.emoji}</HabitEmoji>
                    <HabitText status={isCompleted ? 'checked' : 'unchecked'}>
                      {habit.text}
                    </HabitText>
                  </HabitOption>
                )
              })}
            </HabitOptionsContainer>
          </DayCard>
          {getDayCompletion(activeDay) === 100 && activeDay < 6 && (
            <NextDayButton onClick={handleNextDay}>
              ✅ Next Day →
            </NextDayButton>
          )}

          {showWeekCompletionMessage && (
            <WeekCompletionMessage>
              <h3>Weekly Challenge Complete!</h3>
              <p>Amazing work! You've completed the entire weekly challenge!</p>
              <p>You've completed {getTotalWeekCompletion()}% of all habits and earned {weeklyXP} XP!</p>
            </WeekCompletionMessage>
          )}

          {completedWeekly.some(day => day.length > 0) && (
            <CompleteSetButton onClick={regenerateWeeklyHabits}>
              Generate New Weekly Challenge
            </CompleteSetButton>
          )}
        </>
      )}

      <ResetXPButtons>
        <ResetButton onClick={resetXP}>Reset All XP</ResetButton>
      </ResetXPButtons>

      {showXPNotification && (
        <XPNotification>
          +{xpGained} XP Earned!
        </XPNotification>
      )}
    </GameContainer>
  )
}
