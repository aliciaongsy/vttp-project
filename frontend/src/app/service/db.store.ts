import { Injectable, inject } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { UserDetails, UserSlice } from "../model";
import { TaskService } from "./task.service";

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

    private taskSvc = inject(TaskService)

    constructor() {
        super(INIT_STORE)
    }

    readonly changeStatus = this.updater<UserDetails>(
        (slice: UserSlice, currUser: UserDetails) => {
            // change current status
            const newStatus = !(slice.login)
            var w: string[] = []
            this.taskSvc.retrieveWorkspaces(currUser.id)
                .then((value) => {
                    console.info('retrieve workspace from backend')
                    console.info(value)
                    w = value
                    console.info(w)
                    this.setState({
                        login: newStatus,
                        user: currUser,
                        workspaces: w // get from service
                    })
                })
            return slice
        }
    )

    readonly addWorkspace = this.updater<string>(
        (slice: UserSlice, workspace: string) => {
            console.info('add workspace to backend')
            this.taskSvc.addWorkspace(slice.user.id, workspace)
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
        (slice: UserSlice) => {
            console.info('get workspace', slice.workspaces)
            return slice.workspaces
        }
    )
}