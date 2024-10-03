import { Page, expect, Locator } from "@playwright/test";

export class OfertaComplementariaCambio {
    private page: Page;

    private validateOffert2: Locator;
    private pcoValidate: Locator;
    private popUpPco: Locator;
    private subscriberOffert: Locator;
    private downType: Locator;
    private sendOrder: Locator;

    constructor(page: Page) {
        page = page;

        // Validación de oferta a bajar
        this.validateOffert2 = page.frameLocator('div:nth-child(5) > iframe').getByText('Winsports_Online_Movil_6823');
        this.pcoValidate = page.frameLocator('div:nth-child(5) > iframe').locator('#suppofferchangesubscribevalidatepco');
        this.popUpPco = page.frameLocator('div:nth-child(5) > iframe').getByText('OK');
        this.subscriberOffert = page.frameLocator('div:nth-child(5) > iframe').getByText('Suscribir');
        // Confirmación de baja
        this.downType = page.frameLocator('div:nth-child(5) > iframe').locator('#paymentType_tt').getByRole('insertion').first();
        this.sendOrder = page.frameLocator('div:nth-child(5) > iframe').getByText('Vista previa del contrato')
        //frameLocator('div:nth-child(5) > iframe').getByText('Enviar', { exact: true });



    }
    async validacionPCO(){

        //this.validateOffert2 = this.page.frameLocator('div:nth-child(5) > iframe').getByText(new RegExp(oferta.oferta));
        await this.validateOffert2.waitFor(); // Espera a que la oferta aparezca
        
        await this.pcoValidate.waitFor({ timeout: 40000 });
        await this.pcoValidate.click();
        
        
        // Esperar la ventana emergente y hacer clic en OK
        await this.popUpPco.waitFor();
        await this.popUpPco.click();
        await this.subscriberOffert.click();
        await this.downType.click();
        await this.sendOrder.click();

    }
    
}







