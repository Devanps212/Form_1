import { test as base, Page } from "@playwright/test";
import UserLogin from "../poms/login";
import UserForm from "../poms/forms";

interface ExtendedInterface {
    login: UserLogin,
    form: UserForm
}

export const test = base.extend<ExtendedInterface>({
    login: async({page}: {page: Page}, use)=>{
        const userLogin = new UserLogin(page)
        use(userLogin)
    },
    form: async({page}: {page: Page}, use)=>{
        const formTask = new UserForm(page)
        use(formTask)
    }
})