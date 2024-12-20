import { expect, Locator, Page } from "@playwright/test";
import { FORM_INPUT_CHECK, FORM_LABELS, SUBMISSION_USER_DETAILS } from '../../constants/texts/index';
import { test } from "../../fixtures";
import UserForm from "../../poms/forms";

test.describe("Form page", ()=>{
    test.beforeEach("should goto form creation page", async({page}:{page: Page})=>{
        await page.goto('/admin/dashboard/active')
        await page.getByRole('button', { name: 'Add new form' }).click()
        await page.getByText('Start from scratchA blank').click()
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
            await page.getByTestId('publish-button').click()
            await expect(page.getByText('The form is successfully')).toBeVisible()
        })

        await test.step("Step 3: Verify field visibility and handle errors", async () => {
            const page1Promise = page.waitForEvent('popup')
            await page.getByTestId('publish-preview-button').click()
        
            const inputBlocks = [
                FORM_INPUT_CHECK.fullnameBlock,
                FORM_INPUT_CHECK.emailBlock,
                FORM_INPUT_CHECK.phoneNumberBlock
            ]
            await form.forInputCheck({ inputBlocks })
            const page1 = await page1Promise
        
            const email = page1.locator('input[data-cy="email-text-field"]')
            await email.fill('hello')
            const phone = page1.locator('input[type="tel"]')
            await phone.fill("dcd")
        
            const submit = page1.getByRole('button', { name: 'Submit' })
            await submit.click()
            await expect(page1.getByText('Email address is invalid')).toBeVisible()
            await expect(page1.getByText('Phone number is invalid')).toBeVisible()
            await email.clear()
            await phone.clear()

            await email.fill(SUBMISSION_USER_DETAILS.email)
            await phone.fill(SUBMISSION_USER_DETAILS.phNo)
            await page1.locator('input[data-cy="first-name-text-field"]').fill(SUBMISSION_USER_DETAILS.firstName)
            await page1.locator('input[data-cy="last-name-text-field"]').fill(SUBMISSION_USER_DETAILS.lastName)

            await submit.click()
            await expect(page1.locator('div').filter({ hasText: '🎉Thank You.Your response has' })
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
            await page.getByTestId('publish-button').click({timeout:30000})
            await expect(page.getByText('The form is successfully')).toBeVisible({timeout:30000})
        })

        await test.step("Step 4:Check the options are randmized", async()=>{

            const NormalOrder = Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`);

            const page1Promise = page.waitForEvent('popup')
            await page.getByTestId('publish-preview-button').click()
  
            const page1 = await page1Promise
            const fieldset = page.locator('[data-cy="multiple-choice-group"]')
            await expect(fieldset).toBeHidden()
            const randomizedOrder = await page1.locator(".neeto-form-single-choice__item").allTextContents()
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

            await page.getByTestId('publish-button').click()
            await expect(page.getByText('The form is successfully')).toBeVisible({timeout:30000})
        })

        await test.step("Step 6:Check the visiibilty of multiChoice", async()=>{
            const page1Promise = page.waitForEvent('popup', {timeout:30000})
            await page.getByTestId('publish-preview-button').click()
  
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
            await page.getByTestId('publish-button').click()
            await page.getByRole('link', { name: 'Submissions' }).click()
            await page.getByRole('link', { name: 'Insights' }).click()

            visitsMetric = page.locator('div').filter({ hasText: new RegExp(`^${visitCount}Visits$`) }).getByTestId('insights-count')
            startsMetric = page.locator('div').filter({ hasText: new RegExp(`^${starts}Starts$`) }).getByTestId('insights-count')
            submissionsMetric = page.locator('div').filter({ hasText: new RegExp(`^${submissions}Submissions$`) }).getByTestId('insights-count')
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
