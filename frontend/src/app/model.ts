export interface NewUser {
    name: string
    email: string
    password: string
}

export interface UserSlice {
    login: boolean
}

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