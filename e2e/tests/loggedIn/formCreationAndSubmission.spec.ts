import { expect, Page } from "@playwright/test";
import { FORM_LABELS } from '../../constants/texts/index'
import { test } from "../../fixtures";
import UserForm from "../../poms/forms";

test.describe("Form Workflow: Creation, Validation, and Submission", ()=>{
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
    })

    // test("")
});
