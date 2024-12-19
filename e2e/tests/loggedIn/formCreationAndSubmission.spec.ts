import { expect, Page } from "@playwright/test";
import { FORM_INPUT_CHECK, FORM_LABELS, SUBMISSION_USER_DETAILS } from '../../constants/texts/index';
import { test } from "../../fixtures";
import UserForm from "../../poms/forms";

test.describe("Form Creation, Field Validation, and Submission Workflow", ()=>{
    test("should create and submit the form", async({
        page,
        form
    }:{
        page: Page,
        form: UserForm
    })=>{
        await test.step("Step 1: Visit form creation page", async()=>{
            await page.goto('/admin/dashboard/active')
            await page.getByRole('button', { name: 'Add new form' }).click()
            await page.getByText('Start from scratchA blank').click()
        })  

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
    
})
