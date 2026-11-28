import { Droplets, Flame, LayoutDashboard, LifeBuoy, Lightbulb, Snowflake, Wind, Zap, type LucideIcon } from 'lucide-react'

export type TabId = 'overview' | 'chiller' | 'air' | 'power' | 'lighting' | 'fire' | 'water' | 'support'

export const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'chiller', label: 'Chiller Plant', icon: Snowflake },
  { id: 'air', label: 'Air Side HVAC', icon: Wind },
  { id: 'power', label: 'Generator & Power', icon: Zap },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'fire', label: 'Fire Alarm', icon: Flame },
  { id: 'water', label: 'Water & Tanks', icon: Droplets },
  { id: 'support', label: 'Demo Guide', icon: LifeBuoy },
]
