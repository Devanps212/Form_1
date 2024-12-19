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

    forInputCheck = async({
        inputBlocks
    }: {
        inputBlocks: string[]
    })=>{
        for(let input of inputBlocks){
            await expect(this.page.getByText(input)).toBeVisible()
        }
    }

    multiChoiceAndSingleChoice = async({label}: {label: "multi" | "single"})=>{
        const options = Array.from({length: 6},(_, i)=>`Options ${i+5}`)
        
        const choiceLabel = label === "multi" ? "Multi choice" : "Single choice"
        const choice = this.page.getByRole('button', { name: choiceLabel })
        await choice.scrollIntoViewIfNeeded()
        await choice.click()

        let count = label === "single" ? 1 : 2 
        await this.page.getByRole('button', { name: 'Question' }).nth(count).click()
        await this.page.getByPlaceholder('Question').fill(`${label} Demo field`)
        await this.page.getByTestId('add-bulk-option-link').click()
        await this.page.getByTestId('bulk-add-options-textarea').fill(options.join(','))
        await this.page.getByTestId('bulk-add-options-done-button').click()
        
        const labelLocator = this.page.locator('label')

        if(label === "single"){
            await labelLocator.filter({ hasText: 'Randomize' }).locator('label').click()
        }else{
            await labelLocator.filter({ hasText: 'Hide question' }).locator('label').nth(1).click()
        }
        
        
    }
}