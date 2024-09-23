import { Page, Locator } from "@playwright/test";
import { expect } from '@playwright/test';

export class ConsultaPage {
    private page: Page;
    
    private ingresarServicioPrimerRecorrido: Locator;
    private consultarButtonPrimerRecorrido: Locator;
    private ingresarServicioRecorridosPosteriores: Locator;
    private consultarButtonRecorridosPosteriores: Locator;
    private consultarSuscripciones: Locator;
    private estadoLinea: Locator;
    private volverMenu360: Locator;
    private popupNoButton: Locator;
    private popupLineaNoExiste: Locator;
    private buttonTramites: Locator;
    private buttonCambioOferta: Locator;

    constructor(page:Page) {
        this.page = page;

        // Localizadores para el primer recorrido
        this.ingresarServicioPrimerRecorrido = page.frameLocator('div:nth-child(3) > iframe').locator('#serviceNO');
        this.consultarButtonPrimerRecorrido = page.frameLocator('div:nth-child(3) > iframe').locator('#searchBasicInfo');

        // Localizadores para los recorridos posteriores
        this.ingresarServicioRecorridosPosteriores = page.frameLocator('div:nth-child(4) > iframe').locator('#serviceNO');
        this.consultarButtonRecorridosPosteriores = page.frameLocator('div:nth-child(4) > iframe').locator('#searchBasicInfo');

        this.consultarSuscripciones = page.frameLocator('div:nth-child(3) > iframe').getByText('Suscripciones');
        this.estadoLinea = page.frameLocator('div:nth-child(3) > iframe').locator('td:nth-child(6) > .ng-binding').first();
        this.volverMenu360 = page.locator('div').filter({ hasText: /^Mi Mesa de Trabajo$/ });
        this.popupLineaNoExiste = page.frameLocator('div:nth-child(4) > iframe').locator('#popwin_close');
        this.popupNoButton = page.locator('#No');
        this.buttonTramites = page.frameLocator('div:nth-child(3) > iframe').locator('.btn_normal').first();
        this.buttonCambioOferta = page.frameLocator('div:nth-child(3) > iframe').getByRole('link', { name: 'Cambiar Oferta' }) // Ajusta el localizador según tu necesidad
    }

    async consultaServicio(serviceNo: string, primerRecorrido: boolean) {
        if (!/^\d{8,12}$/.test(serviceNo)) {
            console.log(`❌ Búsqueda fallida: servicio inválido "${serviceNo}".`);
            return 'InvalidServiceNumber';
        }

        const ingresarServicio = primerRecorrido ? this.ingresarServicioPrimerRecorrido : this.ingresarServicioRecorridosPosteriores;
        const consultarButton = primerRecorrido ? this.consultarButtonPrimerRecorrido : this.consultarButtonRecorridosPosteriores;

        try {
            await ingresarServicio.fill(serviceNo);
            await consultarButton.click();

            if (await this.popupLineaNoExiste.isVisible({ timeout: 9000 })) {
                await this.popupLineaNoExiste.click();
                console.log(`❌ Línea "${serviceNo}" no existe.`);
                return 'InvalidServiceNumber';
            }

            if (!primerRecorrido) {
                try {
                    await this.popupNoButton.waitFor({ state: 'visible', timeout: 8000 });
                    await this.popupNoButton.click();
                    console.log('Popup cerrado.');
                } catch (e) {
                    console.log('No se encontró el popup "No", continuando...');
                }
            }

            await this.consultarSuscripciones.waitFor();
            await this.consultarSuscripciones.click();
            
            // Continuar con la validación del estado y contratación
            await this.validarEstadoLinea('Activa');
            await this.contratacionOfertaSecundaria();

        } catch (error) {
            console.error(`❌ Error durante la búsqueda del servicio "${serviceNo}":`, error);
        }
    }

    async validarEstadoLinea(servicio: string) {
        try {
            await this.estadoLinea.waitFor();
            const estado = await this.estadoLinea.textContent();

            if (estado?.trim() === servicio) {
                console.log('✅ El estado de la línea es correcto:', servicio);

                if (servicio === 'Activa') {
                    await this.buttonTramites.waitFor();
                    await this.buttonTramites.click();
                    console.log('✅ Click en botón Trámites realizado.');

                    await this.buttonCambioOferta.waitFor();
                    await this.buttonCambioOferta.click();
                    console.log('✅ Click en botón Cambio de Oferta realizado.');

                  }
            } else {
                console.log(`❌ El estado de la línea es incorrecto. Esperado: ${servicio}, Encontrado: ${estado?.trim()}`);
            }
        } catch (error) {
            console.error(`Error al validar el estado de la línea para el servicio "${servicio}":`, error);
        }
    }

    async contratacionOfertaSecundaria() {
        try {
            await this.page.getByText('Autenticacion Cliente').waitFor({ timeout: 10000 });
            // Valida que el texto "Autenticacion Cliente" está visible en la página
            const isTextVisible = await this.page.getByText('Autenticacion Cliente').isVisible();
            expect(isTextVisible).toBe(true);
            console.log('✅ El texto "Autenticacion Cliente" visible.');

        } catch (error) {
            console.error('❌ Error en la contratación de la oferta secundaria:', error);
        }
    }

    async backToMenu() {
        await this.page.waitForTimeout(3000);
        await this.volverMenu360.click();
    }
}
