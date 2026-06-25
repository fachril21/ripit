export type MissionScope = 'daily' | 'weekly'

export type Mission = {
  id: string
  mission_def_id: string
  scope: MissionScope
  description: string
  goal_type: string
  goal_target: number
  progress: number
  completed: boolean
  claimed: boolean
  reward_coins: number
  period_key: string
}

export type ClaimMissionResult = {
  mission_id: string
  reward_coins: number
  coins: number
}

export type ClaimMissionActionResult = { error: string } | { result: ClaimMissionResult }
