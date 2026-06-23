import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  items = [
    { q: '¿Qué experiencia necesito?', a: 'Me adapto a tu nivel. Si vienes de cero, con saber programar (variables, funciones, objetos...) es suficiente para empezar con Angular. Si ya eres senior, entramos directos en arquitectura, performance o lo que necesites.', open: true },
    { q: '¿Cómo son las sesiones?', a: 'Videollamadas 1:1. Código real, debugging, code review.', open: false },
    { q: '¿Proyecto propio?', a: 'Sí, en programas intensivos construimos proyectos reales.', open: false },
    { q: '¿Cancelaciones?', a: 'Si cancelas antes de tu primera sesión, te devuelvo el 100%. Una vez empezado el plan no hay reembolsos, pero conservas las sesiones restantes para usarlas cuando quieras.', open: false }
  ];
  toggle(item: any) { this.items.forEach(i => i !== item && (i.open = false)); item.open = !item.open; }
}
