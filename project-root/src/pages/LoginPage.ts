import {Page} from '@playwright/test';
import { TIMEOUT } from 'dns';

export class LoginPage{

    private page:Page; // Declaro la pagina page de tipo Page para ser usada
    //Localizadores
    private usernameInput = 'input[name="$Model.name"]';
    private passwordInput = 'input[name="$Model.pwd"]';
    private loginButton = '#loginBtn';

    constructor (page:Page) {
        this.page = page;
    }

    async navigate (){
        await this.page.goto('/oc/bes/sm/login/login-colombia.html');
    }

    async login(username: string, password: string){
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);

        await this.page.waitForURL(/^https:\/\/10\.203\.114\.11\/oc\/bes\/sm\/login\/operator_ctz\.html/, {timeout:6000});

   }

}
