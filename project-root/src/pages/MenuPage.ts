import { Page, Locator } from "@playwright/test";

export class MenuPage{
    
    private page: Page;
    private buttonMenu360: Locator;

    constructor (page: Page){
        this.page = page;
        this.buttonMenu360 = page.frameLocator('iframe').nth(4).getByText('Vista 360° Individual');

    }

async openMenu360(){
    await this.buttonMenu360.waitFor();
    await this.buttonMenu360.click();
    

}
} 