import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { UserDetails, UserSlice } from "../model";

const INIT_STORE: UserSlice = {
    login: false, 
    user: {
        id: '',
        name: '',
        email: ''
    },
    workspaces: []
}

@Injectable()
export class DbStore extends ComponentStore<UserSlice>{

    constructor(){
        super(INIT_STORE)
    }

    readonly changeStatus = this.updater<UserDetails>(
        (slice: UserSlice, currUser: UserDetails) => {
            // change current status
            const newStatus = !(slice.login)
            this.setState({
                login: newStatus,
                user: currUser,
                workspaces: slice.workspaces // get from service
            })
            return slice
        }
    )

    readonly addWorkspace = this.updater<string>(
        (slice: UserSlice, workspace: string) => {
            return {
                login: slice.login,
                user: slice.user,
                workspaces: [...slice.workspaces, workspace]
            }
        }
    )

    readonly getStatus = this.select<boolean>(
        (slice: UserSlice) => slice.login
    )

    readonly getUser = this.select<UserDetails>(
        (slice: UserSlice) => slice.user
    )

    readonly getWorkspaces = this.select<string[]>(
        (slice: UserSlice) => slice.workspaces
    )
}