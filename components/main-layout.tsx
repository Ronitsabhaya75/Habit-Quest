"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { styled } from "styled-components"

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #0B1A2C, #152642);
  overflow: hidden;
  z-index: 0;
`

const Star = styled.div`
  position: absolute;
  width: ${(props) => props.size || 2}px;
  height: ${(props) => props.size || 2}px;
  background-color: #ffffff;
  border-radius: 50%;
  opacity: ${(props) => props.opacity || 0.7};
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  animation: ${(props) => props.animation || "none"} ${(props) => props.duration || 10}s linear infinite;
  animation-delay: ${(props) => props.delay || 0}s;
  box-shadow: 0 0 ${(props) => props.glow || 1}px ${(props) => props.glow || 1}px #B8FFF9;
`

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
  color: #B8FFF9;
`

const Sidebar = styled.div`
  width: 250px;
  padding: 2rem;
  background: rgba(11, 26, 44, 0.9);
  border-right: 1px solid rgba(0, 255, 198, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1000;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #00FFF5;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-shadow: 0 0 10px rgba(0, 255, 245, 0.5);
  }
`

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 2rem;
`

const NavItem = styled.li`
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #B8FFF9;
  
  &:hover {
    background: rgba(0, 255, 198, 0.1);
    transform: translateX(5px);
  }
  
  &.active {
    background: linear-gradient(90deg, rgba(0, 255, 198, 0.3), rgba(74, 144, 226, 0.3));
    border-left: 3px solid #00FFC6;
    color: #00FFF5;
  }
`

const MainContent = styled.div`
  flex: 1;
  padding: 3rem;
  margin-left: 250px;
  z-index: 10;
  overflow-y: auto;
  max-height: 100vh;
`

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/breakthrough-game", label: "Mini Games" },
    { path: "/track", label: "Calendar Tracker" },
    { path: "/new-habit", label: "Habit Creation" },
    { path: "/fitnessAssessment", label: "Fitness Assessment" },
    { path: "/shop", label: "Shop" },
    { path: "/review", label: "Review" },
  ]

  const generateStars = (count: number) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      stars.push({
        id: i,
        size: Math.random() * 3 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 10,
        glow: Math.random() > 0.8 ? 3 : 1,
      })
    }
    return stars
  }

  const stars = generateStars(100)

  return (
    <DashboardContainer>
      <Background>
        {stars.map((star) => (
          <Star
            key={star.id}
            size={star.size}
            top={star.top}
            left={star.left}
            opacity={star.opacity}
            duration={star.duration}
            delay={star.delay}
            glow={star.glow}
          />
        ))}
      </Background>

      <Sidebar>
        <h2>HabitQuest</h2>
        <NavList>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              onClick={() => router.push(item.path)}
              className={router.pathname === item.path ? "active" : ""}
            >
              {item.label}
            </NavItem>
          ))}
        </NavList>
      </Sidebar>

      <MainContent>{children}</MainContent>
    </DashboardContainer>
  )
}
