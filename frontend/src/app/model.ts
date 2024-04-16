// register new user
export interface NewUser {
    name: string
    email: string
    password: string
}

// retrieve current user details
export interface UserDetails {
    id: string
    name: string
    email: string
    image: string
    createDate: number
}

// user slice for component store
export interface UserSlice {
    login: boolean
    user: UserDetails
    workspaces: string[]
}

// login details for checking with backend
export interface LoginDetails {
    email: string
    password: string
}

export interface Task {
    id?: string
    task: string
    status: 'In Progress' | 'In Review' | 'On Hold' | 'Completed'
    priority: 'Low' | 'Medium' | 'High'
    start: number
    due: number
    completed: boolean
}

export interface UserWorkspaces {
    id: string
    workspaces: string[]
}

// for persisting data into mongo or retrieving data from mongo
export interface UserTask {
    id: string // user id
    task: Task[]
}

export interface Event {
    id?: string
    title: string
    start: string
    end?: string
    allDay?: boolean
    backgroundColor?: string
}

export interface FocusSession {
    date: string
    duration: number
}

export interface ChatRoom{
    roomId?: string // uuid generated in backend
    ownerId: string
    ownerName: string
    name: string
    users: string[]
    usernames: string[]
    userCount: number
    createDate: number // milliseconds
    type: 'Private' | 'Public'
}

export interface ChatMessage {
    content: string
    sender: string
    type: 'CHAT' | 'JOIN' | 'LEAVE'
    timestamp: number 
}

// for displaying chat list
export interface ChatDetails {
    roomId: string
    name: string
}