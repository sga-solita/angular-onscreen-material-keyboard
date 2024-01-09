// External modules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
// Angular CDK
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
// Angular material
import { MatCommonModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
// Configs
import { keyboardDeadkeys, MAT_KEYBOARD_DEADKEYS } from './configs/keyboard-deadkey.config';
import { keyboardLayouts, MAT_KEYBOARD_LAYOUTS } from './configs/keyboard-layouts.config';
// Components and directives
import { MatKeyboardContainerComponent } from './components/keyboard-container/keyboard-container.component';
import { MatKeyboardKeyComponent } from './components/keyboard-key/keyboard-key.component';
import { MatKeyboardComponent } from './components/keyboard/keyboard.component';
import { MatKeyboardDirective } from './directives/keyboard.directive';
// Providers
import { MatKeyboardKebabCasePipe } from './pipes/kebab-case.pipe';
import { MatKeyboardService } from './services/keyboard.service';
const ɵ0 = keyboardDeadkeys, ɵ1 = keyboardLayouts;
export class MatKeyboardModule {
}
MatKeyboardModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    // Angular modules
                    CommonModule,
                    OverlayModule,
                    // Cdk modules
                    PortalModule,
                    // Material modules
                    MatButtonModule,
                    MatCommonModule,
                    MatIconModule,
                    MatInputModule
                ],
                exports: [
                    MatKeyboardComponent,
                    MatKeyboardContainerComponent,
                    MatKeyboardKeyComponent,
                    MatKeyboardDirective
                ],
                declarations: [
                    MatKeyboardKebabCasePipe,
                    MatKeyboardComponent,
                    MatKeyboardContainerComponent,
                    MatKeyboardKeyComponent,
                    MatKeyboardDirective
                ],
                entryComponents: [
                    MatKeyboardComponent,
                    MatKeyboardContainerComponent,
                    MatKeyboardKeyComponent
                ],
                providers: [
                    MatKeyboardService,
                    { provide: MAT_KEYBOARD_DEADKEYS, useValue: ɵ0 },
                    { provide: MAT_KEYBOARD_LAYOUTS, useValue: ɵ1 }
                ]
            },] }
];
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvc3JjL2tleWJvYXJkLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtQkFBbUI7QUFDbkIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsY0FBYztBQUNkLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsbUJBQW1CO0FBQ25CLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxVQUFVO0FBQ1YsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDNUYsT0FBTyxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFGLDRCQUE0QjtBQUM1QixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw4REFBOEQsQ0FBQztBQUM3RyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUMzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUNoRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN2RSxZQUFZO0FBQ1osT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7V0FxQ2pCLGdCQUFnQixPQUNqQixlQUFlO0FBRzlELE1BQU0sT0FBTyxpQkFBaUI7OztZQXZDN0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxrQkFBa0I7b0JBQ2xCLFlBQVk7b0JBQ1osYUFBYTtvQkFFYixjQUFjO29CQUNkLFlBQVk7b0JBRVosbUJBQW1CO29CQUNuQixlQUFlO29CQUNmLGVBQWU7b0JBQ2YsYUFBYTtvQkFDYixjQUFjO2lCQUNmO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxvQkFBb0I7b0JBQ3BCLDZCQUE2QjtvQkFDN0IsdUJBQXVCO29CQUN2QixvQkFBb0I7aUJBQ3JCO2dCQUNELFlBQVksRUFBRTtvQkFDWix3QkFBd0I7b0JBQ3hCLG9CQUFvQjtvQkFDcEIsNkJBQTZCO29CQUM3Qix1QkFBdUI7b0JBQ3ZCLG9CQUFvQjtpQkFDckI7Z0JBQ0QsZUFBZSxFQUFFO29CQUNmLG9CQUFvQjtvQkFDcEIsNkJBQTZCO29CQUM3Qix1QkFBdUI7aUJBQ3hCO2dCQUNELFNBQVMsRUFBRTtvQkFDVCxrQkFBa0I7b0JBQ2xCLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsSUFBa0IsRUFBRTtvQkFDOUQsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxJQUFpQixFQUFFO2lCQUM3RDthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRXh0ZXJuYWwgbW9kdWxlc1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG4vLyBBbmd1bGFyIENES1xyXG5pbXBvcnQgeyBPdmVybGF5TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xyXG5pbXBvcnQgeyBQb3J0YWxNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcclxuLy8gQW5ndWxhciBtYXRlcmlhbFxyXG5pbXBvcnQgeyBNYXRDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcclxuaW1wb3J0IHsgTWF0QnV0dG9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcclxuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xyXG5pbXBvcnQgeyBNYXRJbnB1dE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2lucHV0JztcclxuLy8gQ29uZmlnc1xyXG5pbXBvcnQgeyBrZXlib2FyZERlYWRrZXlzLCBNQVRfS0VZQk9BUkRfREVBREtFWVMgfSBmcm9tICcuL2NvbmZpZ3Mva2V5Ym9hcmQtZGVhZGtleS5jb25maWcnO1xyXG5pbXBvcnQgeyBrZXlib2FyZExheW91dHMsIE1BVF9LRVlCT0FSRF9MQVlPVVRTIH0gZnJvbSAnLi9jb25maWdzL2tleWJvYXJkLWxheW91dHMuY29uZmlnJztcclxuLy8gQ29tcG9uZW50cyBhbmQgZGlyZWN0aXZlc1xyXG5pbXBvcnQgeyBNYXRLZXlib2FyZENvbnRhaW5lckNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9rZXlib2FyZC1jb250YWluZXIva2V5Ym9hcmQtY29udGFpbmVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IE1hdEtleWJvYXJkS2V5Q29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2tleWJvYXJkLWtleS9rZXlib2FyZC1rZXkuY29tcG9uZW50JztcclxuaW1wb3J0IHsgTWF0S2V5Ym9hcmRDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMva2V5Ym9hcmQva2V5Ym9hcmQuY29tcG9uZW50JztcclxuaW1wb3J0IHsgTWF0S2V5Ym9hcmREaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMva2V5Ym9hcmQuZGlyZWN0aXZlJztcclxuLy8gUHJvdmlkZXJzXHJcbmltcG9ydCB7IE1hdEtleWJvYXJkS2ViYWJDYXNlUGlwZSB9IGZyb20gJy4vcGlwZXMva2ViYWItY2FzZS5waXBlJztcclxuaW1wb3J0IHsgTWF0S2V5Ym9hcmRTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9rZXlib2FyZC5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW1xyXG4gICAgLy8gQW5ndWxhciBtb2R1bGVzXHJcbiAgICBDb21tb25Nb2R1bGUsXHJcbiAgICBPdmVybGF5TW9kdWxlLFxyXG5cclxuICAgIC8vIENkayBtb2R1bGVzXHJcbiAgICBQb3J0YWxNb2R1bGUsXHJcblxyXG4gICAgLy8gTWF0ZXJpYWwgbW9kdWxlc1xyXG4gICAgTWF0QnV0dG9uTW9kdWxlLFxyXG4gICAgTWF0Q29tbW9uTW9kdWxlLFxyXG4gICAgTWF0SWNvbk1vZHVsZSxcclxuICAgIE1hdElucHV0TW9kdWxlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbXHJcbiAgICBNYXRLZXlib2FyZENvbXBvbmVudCxcclxuICAgIE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50LFxyXG4gICAgTWF0S2V5Ym9hcmRLZXlDb21wb25lbnQsXHJcbiAgICBNYXRLZXlib2FyZERpcmVjdGl2ZVxyXG4gIF0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBNYXRLZXlib2FyZEtlYmFiQ2FzZVBpcGUsXHJcbiAgICBNYXRLZXlib2FyZENvbXBvbmVudCxcclxuICAgIE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50LFxyXG4gICAgTWF0S2V5Ym9hcmRLZXlDb21wb25lbnQsXHJcbiAgICBNYXRLZXlib2FyZERpcmVjdGl2ZVxyXG4gIF0sXHJcbiAgZW50cnlDb21wb25lbnRzOiBbXHJcbiAgICBNYXRLZXlib2FyZENvbXBvbmVudCxcclxuICAgIE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50LFxyXG4gICAgTWF0S2V5Ym9hcmRLZXlDb21wb25lbnRcclxuICBdLFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgTWF0S2V5Ym9hcmRTZXJ2aWNlLFxyXG4gICAgeyBwcm92aWRlOiBNQVRfS0VZQk9BUkRfREVBREtFWVMsIHVzZVZhbHVlOiBrZXlib2FyZERlYWRrZXlzIH0sXHJcbiAgICB7IHByb3ZpZGU6IE1BVF9LRVlCT0FSRF9MQVlPVVRTLCB1c2VWYWx1ZToga2V5Ym9hcmRMYXlvdXRzIH1cclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNYXRLZXlib2FyZE1vZHVsZSB7fVxyXG4iXX0=