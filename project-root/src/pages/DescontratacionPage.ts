import { Page, expect, Locator } from "@playwright/test";
import * as fs from 'fs';
import * as path from 'path'; 

export class DescontratacionPage {
    private page: Page;

    private searchOffert: Locator;
    private validateOffert: Locator;
    private buttonSearch: Locator;
    private downOffert: Locator;
    

    constructor(page: Page) {
        this.page = page;
        // Baja oferta
        this.searchOffert = page.frameLocator('div:nth-child(4) > iframe').locator('#searchOfferingInputUnified');
        this.validateOffert = page.frameLocator('div:nth-child(4) > iframe').getByText('Winsports_Online_Movil_6823');
        this.buttonSearch = page.frameLocator('div:nth-child(4) > iframe').locator('#searchOfferingIcon');
        this.downOffert = page.frameLocator('div:nth-child(4) > iframe').getByText('Dar de Baja');
       
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
            await this.validateOffert.waitFor();
            await this.searchOffert.fill(codigo);
            await this.buttonSearch.click();
    
            // Espera a que la página termine de cargar todas las solicitudes de red
            await this.page.waitForLoadState('networkidle'); // Espera hasta que no haya más solicitudes de red activas
        
            // Espera explícita hasta que la oferta esté visible en la página
            this.validateOffert = this.page.frameLocator('div:nth-child(4) > iframe').getByText(new RegExp(oferta.oferta));
            await this.validateOffert.waitFor({ timeout: 10000 }); // Espera a que la oferta aparezca
        
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