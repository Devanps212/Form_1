import { expect, Page } from "@playwright/test";
import { FORM_INPUT_CHECK, FORM_LABELS } from '../../constants/texts/index'
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

        await test.step("Step 3: Verify field visibility and handle errors", async()=>{
            await page.getByTestId('publish-preview-button').click()
            const inputBlocks = [
                FORM_INPUT_CHECK.fulnameBlock,
                FORM_INPUT_CHECK.emailBlock,
                FORM_INPUT_CHECK.phoneNumberBlock
            ]
            await form.forInputCheck({inputBlocks})

            const email = page.locator('input[name="\\36 f3997ca-8b4b-4b6d-90c3-fbd6ddaace67\\.email"]')
            email.fill("sample.com")
            await expect(page.getByText('Email address is invalid')).toBeVisible()
            email.clear()

            const phone = page.locator('div').filter({ hasText: /^\+1$/ })
            phone.fill("123")
            await expect(page.getByText('Phone number is invalid')).toBeVisible()
            phone.clear()

            await page.getByRole('button', { name: 'Submit' }).click()

            await expect //in Here make the thank you not visible
        })
    })

    // test("should verify field visibility and handle errors", async({
    //     page, 
    //     form
    // }:{
    //     page: Page,
    //     form: UserForm
    // }) => {
    //     await test.step("Step 1: ")
    // })
    
})
