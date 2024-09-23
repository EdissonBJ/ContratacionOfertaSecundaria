import { Page, Locator } from "@playwright/test";


export class AutenticacionPage {
    page:Page;


    private buttonOmitir: Locator;
    private cancelarOrden: Locator;


    constructor(page:Page){
        this.page=page;

        this.buttonOmitir = page.frameLocator('div:nth-child(4) > iframe').getByText('Omitir');
        this.cancelarOrden = page.frameLocator('div:nth-child(4) > iframe').locator('#winmsg0').getByText('OK');
        
    }
    async omitirAutenticacion(servicio: string){

        await this.buttonOmitir.waitFor({ timeout: 10000 });
        await this.buttonOmitir.click();

        if (await this.cancelarOrden.isVisible({ timeout: 9000 })) {
            await this.cancelarOrden.click();
            console.log(`❌ Línea "${servicio}" tiene ordenes pendientes.`);
            return 'InvalidServiceNumber';
        }



    }


}