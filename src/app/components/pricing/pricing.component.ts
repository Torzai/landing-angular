import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanSelectionService } from '../../services/plan-selection.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent {
  private planSelectionService = inject(PlanSelectionService);

  selectPlan(plan?: string) {
    this.planSelectionService.selectedPlan.set(plan ?? '');
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }
}
