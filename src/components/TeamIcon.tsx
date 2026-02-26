"use client"

import {
  Zap, Code, Rocket, Target, Cpu, Cloud, Ship, Bug, BookOpen, Key,
  Link, Bot, Database, Server, Terminal, Code2, Box, Package, Layers, GitBranch,
  FileCode, Binary, Sparkles, Flame, Shield, Lock, Globe, Wifi, Radio, CircleDot,
  Boxes,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Code, Rocket, Target, Cpu, Cloud, Ship, Bug, BookOpen, Key,
  Link, Bot, Database, Server, Terminal, Code2, Box, Package, Layers, GitBranch,
  FileCode, Binary, Sparkles, Flame, Shield, Lock, Globe, Wifi, Radio, CircleDot,
  Boxes,
}

interface TeamIconProps {
  name: string
  className?: string
  size?: number
  style?: React.CSSProperties
}

export function TeamIcon({ name, className, size = 20, style }: TeamIconProps) {
  const Icon = ICON_MAP[name] ?? Box
  return <Icon className={className} size={size} style={style} />
}
