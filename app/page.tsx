"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Users, DollarSign, ArrowRight, Globe, Award, BarChart3, Lock, Zap } from 'lucide-react'

export default function HomePage() {
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)

  const investmentPackages = [
    {
      id: 1,
      name: "Conservative Growth",
      category: "Low Risk",
      expectedROI: 8.5,
      minInvestment: 10000,
      duration: 12,
      totalRaised: 2500000,
      targetAmount: 5000000,
      investors: 156,
      status: "Active",
      riskLevel: "Low",
      description: "Balanced portfolio focused on capital preservation with moderate growth potential",
    },
    {
      id: 2,
      name: "Aggressive Growth",
      category: "High Risk",
      expectedROI: 18.2,
      minInvestment: 25000,
      duration: 24,
      totalRaised: 8750000,
      targetAmount: 10000000,
      investors: 89,
      status: "Active",
      riskLevel: "High",
      description: "High-growth portfolio focused on emerging markets and innovative technologies",
    },
    {
      id: 3,
      name: "ESG Sustainable",
      category: "ESG",
      expectedROI: 12.8,
      minInvestment: 15000,
      duration: 18,
      totalRaised: 1200000,
      targetAmount: 3000000,
      investors: 67,
      status: "Fundraising",
      riskLevel: "Medium",
      description: "Sustainable investments with ESG criteria and positive environmental impact",
    },
  ]

  const stats = [
    { label: "Assets Under Management", value: "$3.2B", icon: DollarSign },
    { label: "Active Investors", value: "2,847", icon: Users },
    { label: "Average Annual Return", value: "15.4%", icon: TrendingUp },
    { label: "Years of Excellence", value: "12+", icon: Award },
  ]

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your investments are protected with institutional-grade security measures",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your portfolio performance with advanced analytics and reporting",
    },
    {
      icon: Globe,
      title: "Global Diversification",
      description: "Access to international markets and diversified investment opportunities",
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Fast and efficient trade execution with minimal slippage",
