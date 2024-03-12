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
    task: string
    priority: string
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