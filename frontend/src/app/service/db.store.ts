import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { UserSlice } from "../model";

const INIT_STORE: UserSlice = {
    login: false
}

@Injectable()
export class DbStore extends ComponentStore<UserSlice>{

    constructor(){
        super(INIT_STORE)
    }

    readonly changeStatus = this.updater<UserSlice>(
        (slice: UserSlice) => {
            // change current status
            const newStatus = !(slice.login)
            this.setState({
                login: newStatus
            })
            return slice
        }
    )

    readonly getStatus = this.select<boolean>(
        (slice: UserSlice) => slice.login
    )
}