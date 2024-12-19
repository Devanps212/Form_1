import { Page } from "@playwright/test";
import { test } from "../../fixtures";
import UserLogin from "../../poms/login";

test.describe('User login', ()=>{
    test('should login user', async({
        login,
        page
    } : {
        login: UserLogin,
        page: Page})=>{
        await test.step("Step 1: Visit login page", async()=> await page.goto('/login'))
        await test.step("Step 2: Login user", async()=>await login.loginUser())
    })
})