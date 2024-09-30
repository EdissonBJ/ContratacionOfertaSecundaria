import { Page, expect, Locator } from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path'; 

export class DescontratacionPage {
    private page: Page;

    private searchOffert: Locator;
    private validateOffert: Locator;
    private buttonSearch: Locator;
    private downOffert: Locator;
    private validateOffert2: Locator;
    private pcoValidate: Locator;
    private popUpPco: Locator;
    private subscriberOffert: Locator;
    private downType: Locator;
    private sendOrder: Locator;

    constructor(page: Page) {
        this.page = page;
        // Baja oferta
        this.searchOffert = page.frameLocator('div:nth-child(4) > iframe').locator('#searchOfferingInputUnified');
        this.validateOffert = page.frameLocator('div:nth-child(4) > iframe').getByText('Winsports_Online_Movil_6823');
        this.buttonSearch = page.frameLocator('div:nth-child(4) > iframe').locator('#searchOfferingIcon');
        this.downOffert = page.frameLocator('div:nth-child(4) > iframe').getByText('Dar de Baja');
        // Validación de oferta a bajar
        this.validateOffert2 = page.frameLocator('div:nth-child(5) > iframe').getByText('Winsports_Online_Movil_6823');
        this.pcoValidate = page.frameLocator('div:nth-child(5) > iframe').locator('#suppofferchangesubscribevalidatepco');
        this.popUpPco = page.frameLocator('div:nth-child(5) > iframe').getByText('OK');
        this.subscriberOffert = page.frameLocator('div:nth-child(5) > iframe').getByText('Suscribir');
        // Confirmación de baja
        this.downType = page.frameLocator('div:nth-child(5) > iframe').locator('#paymentType_tt').getByRole('insertion').first();
        this.sendOrder = page.frameLocator('div:nth-child(5) > iframe').getByText('Enviar', { exact: true });
    }

    // Método para leer el archivo JSON de forma asíncrona
    private async getOfertasFromJson(): Promise<any> {
        const filePath = path.resolve(__dirname, '../data/offering.json');
        const ofertas = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(ofertas);
    }

    async validarOferta(codigo: string): Promise<void> {
        // Lee los datos del archivo JSON
        const ofertas = await this.getOfertasFromJson();

        // Busca la oferta que coincida con el código
        const oferta = ofertas.ofertas.find((oferta: any) => oferta.codigo === codigo);  
        if (!oferta) {
            console.log(`❌ No se encontró la oferta con el código "${codigo}".`);
            return;
        }

        try {
            // Espera que el campo de búsqueda esté visible
            await this.searchOffert.waitFor({ timeout: 10000 });
            await this.searchOffert.fill(codigo);
            await this.buttonSearch.click();
        
            // Agrega un tiempo de espera después de hacer clic en buttonSearch
            await this.page.waitForTimeout(3000); // Espera 3 segundos
        
            this.validateOffert = this.page.frameLocator('div:nth-child(4) > iframe').getByText(new RegExp(oferta.oferta));
        
            // Verifica si el elemento está visible y espera por ello
            await this.validateOffert.waitFor({ timeout: 10000 });
        
            const textoOferta = await this.validateOffert.textContent();
            if (textoOferta?.includes(oferta.oferta)) {
                console.log(`✅ Validación exitosa: El texto contiene el nombre "${oferta.oferta}".`);
                await this.downOffert.click();
            } else {
                console.log(`❌ Validación fallida: El texto "${textoOferta}" no contiene el nombre "${oferta.oferta}".`);
            }
        } catch (error) {
            console.error(`❌ Error al validar la oferta para el código "${codigo}":`, error);
        }
        
        
    }
}