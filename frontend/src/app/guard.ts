import { CanDeactivateFn } from "@angular/router"
import { RegisterComponent } from "./component/register/register.component"

export const canLeave: CanDeactivateFn<RegisterComponent> = 
    (comp, _route, _state) => {
        if (!comp.form.dirty)
            return true
        return confirm('You have not registered yet.\nAre you sure you want to leave')
}