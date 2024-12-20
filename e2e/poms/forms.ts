import { expect, Locator, Page } from "@playwright/test";
import { SUBMISSION_USER_DETAILS } from "../constants/texts";
import { FORM_INPUT_SELECTORS, FORM_PUBLISH_SELECTORS, INSIGHT_SELECTORS } from "../constants/selectors";
import { FORM_MESSAGES,FORM_LABELS } from "../constants/texts";

type purposes = "visits" | "starts" | "submissions"
type labels = "multi" | "single"

interface InsightMetrics {
    purpose: purposes
    visitCount?: number
    starts?: number
    submissions?: number
    visitsMetric?: Locator
    startsMetric?: Locator
    submissionsMetric?: Locator
    completionMetric?: Locator
    completion?: number
  }

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
            await expect(this.page.getByRole('button', { name: 'Question' })
            .nth(count)).toBeVisible()
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

    multiChoiceAndSingleChoice = async({label}: {label: labels})=>{
        const options = Array.from({length: 6},(_, i)=>`Options ${i+5}`)
        
        const choiceLabel = label === "multi" ? FORM_LABELS.multi : FORM_LABELS.single
        const choice = this.page.getByRole('button', { name: choiceLabel })
        await choice.scrollIntoViewIfNeeded()
        await choice.click()

        let count = label === "single" ? 1 : 2 
        await this.page.getByRole('button', { name: 'Question' }).nth(count).click()
        await this.page.getByPlaceholder('Question').fill(`${label} Demo field`)
        await this.page.getByTestId(FORM_INPUT_SELECTORS.bulkAddLink).click()
        await this.page.getByTestId(FORM_INPUT_SELECTORS.bulkAddTextarea).fill(options.join(','))
        await this.page.getByTestId(FORM_INPUT_SELECTORS.bulkAddSubmitButton).click()
        
        const labelLocator = this.page.locator('label')

        if(label === "single"){
            await labelLocator.filter({ hasText: 'Randomize' }).locator('label').click()
        }else{
            await labelLocator.filter({ hasText: 'Hide question' }).locator('label').nth(1).click()
        } 
    }

    insightIncreaser = async ({
        purpose,
        visitCount = 0,
        starts = 0,
        completion = 100,
        submissions = 0,
        visitsMetric,
        startsMetric,
        submissionsMetric,
        completionMetric
    }: InsightMetrics) => {
        const page1Promise = this.page.waitForEvent('popup', { timeout: 70000 })
        await this.page.getByTestId(FORM_PUBLISH_SELECTORS.publishPreviewButton).click()
        const page1 = await page1Promise
        await expect(page1.getByRole('heading', { name: FORM_LABELS.formTitle }))
        .toBeVisible({timeout:70000})
    
        if (purpose === "visits") {
            visitCount++
            await page1.close()
            await this.page.reload()
            if (visitsMetric) {
                visitsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${visitCount}Visits$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(visitsMetric).toHaveText(`${visitCount}`)
            }
        } else if (purpose === "starts") {
            visitCount++
            starts++
            await page1.getByRole('textbox').fill(SUBMISSION_USER_DETAILS.email)
            await page1.close()
            await this.page.reload({timeout:100000})

            if (visitsMetric) {
                visitsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${visitCount}Visits$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(visitsMetric).toHaveText(`${visitCount}`, {timeout:70000})
            }
            if (startsMetric) {
                startsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${starts}Starts$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(startsMetric).toHaveText(`${starts}`, {timeout:30000})
            }
        } else if (purpose === "submissions") {
            visitCount++
            submissions++
            await page1.getByRole('textbox').fill(SUBMISSION_USER_DETAILS.email)
            await page1.getByRole('button', { name: 'Submit' }).click()
            await expect(
                page1.locator('div')
            .   filter({ hasText: FORM_MESSAGES.formSubmitSuccess })
                .nth(3)
            ).toBeVisible({ timeout: 60000 })
            await page1.close()
            await this.page.reload({timeout:40000})
            if (visitsMetric) {
                visitsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${visitCount}Visits$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(visitsMetric).toHaveText(`${visitCount}`, {timeout:30000})
            }
            if (startsMetric) {
                startsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${starts}Starts$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(startsMetric).toHaveText(`${starts}`)
            }
            if (submissionsMetric) {
                submissionsMetric = this.page.locator('div')
                    .filter({ hasText: new RegExp(`^${submissions}Submissions$`) })
                    .getByTestId(INSIGHT_SELECTORS.insightCount)
                await expect(submissionsMetric).toHaveText(`${submissions}`)
            }
            if (completionMetric) {
                completionMetric = this.page.getByRole('heading', { name: `${completion}%` })
                await expect(completionMetric).toHaveText(`${completion}%`)
            }
        }
        return { visitCount, starts, submissions }
    }

    formDeletion = async({formName}:{formName: string})=>{
        // const formRowLocator = this.page.getByRole('row', { name: new RegExp(`^${formName}\\b`, 'i') })
        // await formRowLocator.locator('input[type="checkbox"]').first().click()
        const formRowLocator = this.page.locator('div')
        .filter({ hasText: new RegExp(`^${formName}$`, 'i') })
        .locator('div')
        .getByRole('button')

        await formRowLocator.nth(0).click()
        
        await this.page.getByRole('button', { name: 'Delete' }).click()
        await this.page.getByTestId('delete-archive-alert-archive-checkbox').click()
        await this.page.getByRole('button', { name: 'Delete' }).click()

        await this.page.waitForSelector(`text=Form ${formName}`, { state: 'detached' });
    }
}