import { test, expect, chromium } from '@playwright/test'; 
import { LoginPage } from '../pages/LoginPage';
import { MenuPage } from '../pages/MenuPage';
import { ConsultaPage } from '../pages/ConsultaPage';
import * as fs from 'fs';
import * as path from 'path'; 
import { AutenticacionPage } from '../pages/AutenticacionPage';
import { DescontratacionPage } from '../pages/DescontratacionPage';
import {OfertaComplementariaCambio} from '../pages/OfertaComplementariaCambio';
import { ConfirmacionOrden } from '../pages/ConfirmacionOrden';

// Usamos path para construir la ruta absoluta al archivo JSON
const dataPath = path.resolve(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));


test.describe('Suite activacion ofertas secundarias', () => {

    let browser, context, page;
    let loginPage, menuPage, consultaPage, autenticacionPage, descontratacionPage, ofertaComplementariaCambio, confirmacionOrden;

    test.beforeAll(async () => {
        browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
    });

    test.beforeEach(async () => {
        context = await browser.newContext({ ignoreHTTPSErrors: true });
        page = await context.newPage();
        loginPage = new LoginPage(page);
        menuPage = new MenuPage(page);
        consultaPage = new ConsultaPage(page);
        autenticacionPage = new AutenticacionPage(page);
        descontratacionPage = new DescontratacionPage(page);
        ofertaComplementariaCambio = new OfertaComplementariaCambio(page);
        confirmacionOrden = new ConfirmacionOrden(page);
    });

    test.afterEach(async () => {
        await context.close();
    });

    test.afterAll(async () => {
        await browser.close();
    });

    
    test('debería iniciar sesión y contratar una oferta secundaria', async () => {
        await loginPage.navigate();
        await loginPage.login('101', 'Abc1234%');

        await page.waitForURL(/operator_ctz\.html/, { timeout: 60000 });
        expect(page.url()).toMatch(/operator_ctz\.html/);
        console.log('Login exitoso');

        for (let i = 0; i < data.servicios.length; i++) {
            const servicio = data.servicios[i];
            console.log(`🔍 Consultando el servicio: ${servicio}`);
            await menuPage.openMenu360();

            const result = await consultaPage.consultaServicio(servicio, i === 0);

            if (result === 'InvalidServiceNumber') {
                console.warn(`Número de servicio inválido: ${servicio}. Retornando al menú.`);
                await consultaPage.backToMenu();
                continue;
            }

            await page.screenshot({ path: `evidencias/busqueda_exitosa_${servicio}.png`, fullPage: true });
            await consultaPage.validarEstadoLinea('Activa');
                        
            const autenticacionResult = await autenticacionPage.omitirAutenticacion(servicio);
           
        if (autenticacionResult === 'InvalidServiceNumber') {
            console.warn(`Servicio con órdenes pendientes: ${servicio}. Retornando al menú.`);
            await consultaPage.backToMenu(); // Vuelve al menú si hay órdenes pendientes
            continue; // Pasa al siguiente servicio en el bucle
        }

        await descontratacionPage.validarOferta("1339");
        await ofertaComplementariaCambio.validacionPCO();

        // Paso clave: Capturar, mostrar y validar el número de orden
        const orderId = await confirmacionOrden.getOrderId();
        await confirmacionOrden.printOrderId(orderId);
        await confirmacionOrden.validateOrderId(orderId);


        await consultaPage.backToMenu(); // Regresa al menú después de procesar el servicio
    }
    });
});