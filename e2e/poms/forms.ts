import { expect, Page } from "@playwright/test";

export default class UserForm{
    constructor(
        private page: Page
    ){}

    formInputCreation = async({
        labels
    }:{
        labels: string[]
    })=>{
        let count = 1
        for(const label of labels){
            const button = this.page.getByRole('button', { name: label })
            await button.scrollIntoViewIfNeeded()
            await button.click()
            await expect(this.page.getByRole('button', { name: 'Question' }).nth(count)).toBeVisible()
            count++
        }

    }
}