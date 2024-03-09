import {Router} from "./router";
import './scss/style.scss';
import 'bootstrap/dist/js/bootstrap.min.js';



class App {
    private router: Router;
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))
    }

    private handleRouteChanging(): void {
        this.router.openRoute();
    }
}

(new App());
