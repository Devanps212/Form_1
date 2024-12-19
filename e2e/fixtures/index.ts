import { test as base, Page } from "@playwright/test";
import UserLogin from "../poms/login";

interface ExtendedInterface {
    login: UserLogin
}

export const test = base.extend<ExtendedInterface>({
    login: async({page}: {page: Page}, use)=>{
        const userLogin = new UserLogin(page)
        use(userLogin)
    }
})