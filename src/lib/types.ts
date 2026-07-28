export type Role = 'user' | 'assistant'

export type Message = {
  id: string
  role: Role
  content: string
  createdAt: number
  status?: 'streaming' | 'done' | 'error' // assistant only
}

export type Thread = {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}
