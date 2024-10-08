import { Locator, Page } from "@playwright/test";

export class ConfirmacionOrden {
    page: Page;


    readonly noOrder: Locator;


    constructor(page: Page) {
        this.page = page;


        this.noOrder = page.frameLocator('div:nth-child(5) > iframe').locator('text=/\\d{14}/');
    }

    async getOrderId(): Promise<string> {
        await this.noOrder.waitFor({ timeout: 40000 }); // Esperar a que el elemento sea visible
        const orderId = await this.noOrder.innerText(); // Capturar el texto
        return orderId;
    }

    async printOrderId(noOrder: string) {
            console.log(`Número de orden capturado: ${noOrder}`);
        }


    async validateOrderId(noOrder: string) {
            if (!noOrder) throw new Error("El número de orden es nulo");
            if (!/^\d+$/.test(noOrder)) throw new Error("El número de orden no tiene un formato válido");
        }
    }
