import { TaskState } from "./tasks/task.reducer";
import { UserState } from "./user/user.reducer";

export interface AppState{
    user: UserState
    task: TaskState
}