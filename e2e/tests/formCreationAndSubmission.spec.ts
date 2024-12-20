import { expect, Locator, Page } from "@playwright/test";
import { FORM_INPUT_CHECK, FORM_LABELS, FORM_MESSAGES, SUBMISSION_USER_DETAILS } from '../constants/texts/index';
import { FORM_PUBLISH_SELECTORS, INSIGHT_SELECTORS, FORM_INPUT_SELECTORS } from "../constants/selectors";
import { test } from "../fixtures";
import UserForm from "../poms/forms";

test.describe("Form page", ()=>{
    let formName: string;

    test.beforeEach("should goto form creation page", async({page}:{page: Page})=>{
        await page.goto('/admin/dashboard/active')
        await page.getByTestId(FORM_INPUT_SELECTORS.header)
        .getByRole('button', { name: FORM_LABELS.addNewForm }).click()
        await page.getByText(FORM_LABELS.startFromScratch).click()
        const form = page.getByTestId(FORM_INPUT_SELECTORS.formName)
        await expect(form).toBeVisible({timeout:50000})
        formName = await form.innerText()
    })


    test.afterEach("should delete form recently added", async({
        page, 
        form
    }:{
        page: Page, 
        form: UserForm
    })=>{
        await page.goto('/admin/dashboard/active')
        await form.formDeletion({formName})
    })

    test("should create and submit the form", async({
        page,
        form
    }:{
        page: Page,
        form: UserForm
    })=>{

        await test.step("Step 1: Visit form creation page", async()=>{})  

        await test.step("Step 2: Add inputs and publish form", async()=>{
            const labels = [
                FORM_LABELS.fullName,
                FORM_LABELS.phNO
            ]
            await form.formInputCreation({labels})
            await page.getByRole('button', { name: 'Submit' }).click()
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishButton).click()
            await expect(page.getByText('The form is successfully')).toBeVisible()
        })

        await test.step("Step 3: Verify field visibility and handle errors", async () => {
            const page1Promise = page.waitForEvent('popup')
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishPreviewButton).click()
        
            const inputBlocks = [
                FORM_INPUT_CHECK.fullnameBlock,
                FORM_INPUT_CHECK.emailBlock,
                FORM_INPUT_CHECK.phoneNumberBlock
            ]
            await form.forInputCheck({ inputBlocks })
            const page1 = await page1Promise
        
            const email = page1.locator(FORM_INPUT_SELECTORS.email)
            await email.fill('hello')
            const phone = page1.locator(FORM_INPUT_SELECTORS.inputTel)
            await phone.fill("dcd")
        
            const submit = page1.getByRole('button', { name: 'Submit' })
            await submit.click()
            await expect(page1.getByText('Email address is invalid')).toBeVisible()
            await expect(page1.getByText('Phone number is invalid')).toBeVisible()
            await email.clear()
            await phone.clear()

            await email.fill(SUBMISSION_USER_DETAILS.email)
            await phone.fill(SUBMISSION_USER_DETAILS.phNo)
            await page1.locator(FORM_INPUT_SELECTORS.firstName).fill(SUBMISSION_USER_DETAILS.firstName)
            await page1.locator(FORM_INPUT_SELECTORS.lastName).fill(SUBMISSION_USER_DETAILS.lastName)

            await submit.click()
            await expect(page1.locator('div').filter({hasText: FORM_MESSAGES.formSubmitSuccess})
            .nth(3)).toBeVisible({timeout:60000})
            await page1.close()
        })
        
        await test.step("Step 4: go back to formpage and check submission in visible", async()=>{
            await page.getByRole('link', { name: 'Submissions' }).click()
            await expect(page.getByRole('cell', { name: SUBMISSION_USER_DETAILS.email })).toBeVisible()
            await expect(page.getByRole('cell', 
                { name: `${SUBMISSION_USER_DETAILS.firstName} ${SUBMISSION_USER_DETAILS.lastName}` }))
                .toBeVisible()
        })
    })

    test("should customize form's field elements", async({
        page,
        form
    }:{
        page: Page,
        form: UserForm
    })=>{
        
        await test.step("Step 1:Create and randomize single choice", async()=>
            await form.multiChoiceAndSingleChoice({label:"single"}))

        await test.step("Step 2:Create and hide multi choice", async()=>
            await form.multiChoiceAndSingleChoice({label:"multi"}))

        await test.step("Step 3:Publish form", async()=>{
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishButton).click({timeout:30000})
            await expect(page.getByText(FORM_MESSAGES.formCreationSuccess)).toBeVisible({timeout:30000})
        })

        await test.step("Step 4:Check the options are randmized", async()=>{

            const NormalOrder = Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`);

            const page1Promise = page.waitForEvent('popup')
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishPreviewButton).click()
  
            const page1 = await page1Promise
            const fieldset = page.locator(FORM_INPUT_SELECTORS.multiChoice)
            await expect(fieldset).toBeHidden()
            const randomizedOrder = await page1.locator(FORM_INPUT_SELECTORS.singleChoice)
            .allTextContents()
            expect(randomizedOrder).not.toEqual(NormalOrder)
            await page1.close()
        })

        await test.step("Step 5:Unhide multiChoice", async()=>{
            const multiChoice = page.getByRole('button', { name: 'Question' }).nth(2)
            await multiChoice.scrollIntoViewIfNeeded()
            await multiChoice.click()
            
            await page.locator('label').filter({ hasText: 'Hide question' })
            .locator('label').nth(1)
            .click({timeout:40000})

            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishButton).click()
            await expect(page.getByText(FORM_MESSAGES.formCreationSuccess)).toBeVisible({timeout:30000})
        })

        await test.step("Step 6:Check the visiibilty of multiChoice", async()=>{
            const page1Promise = page.waitForEvent('popup', {timeout:30000})
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishPreviewButton).click()
  
            const page1 = await page1Promise
            const fieldset = page.getByText('Question 1multi Demo field*')
            await expect(fieldset).toBeVisible()
            await page1.close()
        })
    })

    test("should verify form insights", async({
        page,
        form
    }:{
        page: Page
        form: UserForm
    })=>{
        let visitCount = 0
        let starts = 0
        let submissions = 0
        let completion = 0

        let visitsMetric :Locator;
        let startsMetric :Locator;
        let submissionsMetric :Locator;
        let completionMetric :Locator;

        await test.step("Step 1:Check insights to enuse everything is 0", async()=>{
            await page.getByTestId(FORM_PUBLISH_SELECTORS.publishButton).click()
            await page.getByRole('link', { name: 'Submissions' }).click()
            await page.getByRole('link', { name: 'Insights' }).click()

            visitsMetric = page.locator('div')
                .filter({ hasText: new RegExp(`^${visitCount}Visits$`) })
                .getByTestId(INSIGHT_SELECTORS.insightCount)
            startsMetric = page.locator('div')
                .filter({ hasText: new RegExp(`^${starts}Starts$`) })
                .getByTestId(INSIGHT_SELECTORS.insightCount)
            submissionsMetric = page.locator('div')
                .filter({ hasText: new RegExp(`^${submissions}Submissions$`) })
                .getByTestId(INSIGHT_SELECTORS.insightCount)
            completionMetric = page.getByRole('heading', { name: `${completion}%` })

            await expect(visitsMetric).toHaveText(`${visitCount}`)
            await expect(startsMetric).toHaveText(`${starts}`)
            await expect(submissionsMetric).toHaveText(`${submissions}`)
            await expect(completionMetric).toHaveText(`${completion}%`)
        })
        
        
        await test.step("Step 2:Publish the form and check increasing of number of visits", async()=>{
            const result = await form.insightIncreaser({
                purpose:"visits",
                visitsMetric,
                visitCount                
            })
            visitCount = result.visitCount
        })

        await test.step("Step 3:Add email in value and check the starts increased", async()=>{
            const result = await form.insightIncreaser({
                purpose:"starts",
                visitCount,
                visitsMetric,
                startsMetric,
                starts                
            })

            visitCount = result.visitCount
            starts = result.starts
        })
    
        await test.step("Step 4: Submit the form and check submissions increase", async()=>{
            const result = await form.insightIncreaser({
                purpose:"submissions",
                visitCount,
                submissions,
                submissionsMetric,
                completionMetric,
                visitsMetric,
                startsMetric,
                starts                
            })

            visitCount = result.visitCount
            starts = result.starts
        })
    })
})
