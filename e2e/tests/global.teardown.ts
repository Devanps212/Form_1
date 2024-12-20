import fs from 'fs'
import { STORAGE_STATE } from '../../playwright.config'
import { test } from '../fixtures/index'

test("Teardown", async()=>{
    fs.unlink(STORAGE_STATE, (error: NodeJS.ErrnoException | null)=>{
        if(error)return 
    })
})