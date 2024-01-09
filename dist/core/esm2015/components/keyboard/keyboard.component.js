import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Inject, LOCALE_ID, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KEYBOARD_ICONS } from '../../configs/keyboard-icons.config';
import { KeyboardClassKey } from '../../enums/keyboard-class-key.enum';
import { KeyboardModifier } from '../../enums/keyboard-modifier.enum';
import { MatKeyboardService } from '../../services/keyboard.service';
import { MatKeyboardKeyComponent } from '../keyboard-key/keyboard-key.component';
/**
 * A component used to open as the default keyboard, matching material spec.
 * This should only be used internally by the keyboard service.
 */
export class MatKeyboardComponent {
    // inject dependencies
    constructor(_locale, _keyboardService) {
        this._locale = _locale;
        this._keyboardService = _keyboardService;
        this._darkTheme = new BehaviorSubject(false);
        this._isDebug = new BehaviorSubject(false);
        this._inputInstance$ = new BehaviorSubject(null);
        this._modifier = KeyboardModifier.None;
        this._capsLocked = false;
        this._icons = KEYBOARD_ICONS;
        this.cssClass = true;
        this.enterClick = new EventEmitter();
        this.capsClick = new EventEmitter();
        this.altClick = new EventEmitter();
        this.shiftClick = new EventEmitter();
    }
    // returns an observable of the input instance
    get inputInstance() {
        return this._inputInstance$.asObservable();
    }
    set icons(icons) {
        Object.assign(this._icons, icons);
    }
    set darkTheme(darkTheme) {
        if (this._darkTheme.getValue() !== darkTheme) {
            this._darkTheme.next(darkTheme);
        }
    }
    set isDebug(isDebug) {
        if (this._isDebug.getValue() !== isDebug) {
            this._isDebug.next(isDebug);
        }
    }
    get darkTheme$() {
        return this._darkTheme.asObservable();
    }
    get isDebug$() {
        return this._isDebug.asObservable();
    }
    setInputInstance(inputInstance) {
        this._inputInstance$.next(inputInstance);
    }
    attachControl(control) {
        this.control = control;
    }
    ngOnInit() {
        // set a fallback using the locale
        if (!this.layout) {
            this.locale = this._keyboardService.mapLocale(this._locale) ? this._locale : 'en-US';
            this.layout = this._keyboardService.getLayoutForLocale(this.locale);
        }
    }
    /**
     * dismisses the keyboard
     */
    dismiss() {
        this.keyboardRef.dismiss();
    }
    /**
     * checks if a given key is currently pressed
     * @param key
     * @param
     */
    isActive(key) {
        const modifiedKey = this.getModifiedKey(key);
        const isActiveCapsLock = modifiedKey === KeyboardClassKey.Caps && this._capsLocked;
        const isActiveModifier = modifiedKey === KeyboardModifier[this._modifier];
        return isActiveCapsLock || isActiveModifier;
    }
    // retrieves modified key
    getModifiedKey(key) {
        let modifier = this._modifier;
        // `CapsLock` inverts the meaning of `Shift`
        if (this._capsLocked) {
            modifier = this._invertShiftModifier(this._modifier);
        }
        return key[modifier];
    }
    // retrieves icon for given key
    getKeyIcon(key) {
        return this._icons[key[KeyboardModifier.None]];
    }
    /**
     * listens to users keyboard inputs to simulate on virtual keyboard, too
     * @param event
     */
    onKeyDown(event) {
        // 'activate' corresponding key
        this._keys
            .filter((key) => key.key === event.key)
            .forEach((key) => {
            key.pressed = true;
        });
        // simulate modifier press
        if (event.key === KeyboardClassKey.Caps) {
            this.onCapsClick(event.getModifierState(KeyboardClassKey.Caps));
        }
        if (event.key === KeyboardClassKey.Alt && this._modifier !== KeyboardModifier.Alt && this._modifier !== KeyboardModifier.ShiftAlt) {
            this.onAltClick();
        }
        if (event.key === KeyboardClassKey.Shift && this._modifier !== KeyboardModifier.Shift && this._modifier !== KeyboardModifier.ShiftAlt) {
            this.onShiftClick();
        }
    }
    /**
     * listens to users keyboard inputs to simulate on virtual keyboard, too
     * @param event
     */
    onKeyUp(event) {
        // 'deactivate' corresponding key
        this._keys
            .filter((key) => key.key === event.key)
            .forEach((key) => {
            key.pressed = false;
        });
        // simulate modifier release
        if (event.key === KeyboardClassKey.Alt && (this._modifier === KeyboardModifier.Alt || this._modifier === KeyboardModifier.ShiftAlt)) {
            this.onAltClick();
        }
        if (event.key === KeyboardClassKey.Shift && (this._modifier === KeyboardModifier.Shift || this._modifier === KeyboardModifier.ShiftAlt)) {
            this.onShiftClick();
        }
    }
    /**
     * bubbles event if submit is potentially triggered
     */
    onEnterClick() {
        // notify subscribers
        this.enterClick.next();
    }
    /**
     * simulates clicking `CapsLock` key
     * @param targetState
     */
    onCapsClick(targetState = !this._capsLocked) {
        // not implemented
        this._capsLocked = targetState;
        // notify subscribers
        this.capsClick.next();
    }
    /*
     * non-modifier keys are clicked
     */
    onKeyClick() {
        if (this._modifier === KeyboardModifier.Shift || this._modifier === KeyboardModifier.ShiftAlt) {
            this._modifier = this._invertShiftModifier(this._modifier);
        }
        if (this._modifier === KeyboardModifier.Alt || this._modifier === KeyboardModifier.ShiftAlt) {
            this._modifier = this._invertAltModifier(this._modifier);
        }
    }
    /**
     * simulates clicking `Alt` key
     */
    onAltClick() {
        // invert modifier meaning
        this._modifier = this._invertAltModifier(this._modifier);
        // notify subscribers
        this.altClick.next();
    }
    /**
     * simulates clicking `Shift` key
     */
    onShiftClick() {
        // invert modifier meaning
        this._modifier = this._invertShiftModifier(this._modifier);
        // notify subscribers
        this.shiftClick.next();
    }
    _invertAltModifier(modifier) {
        switch (modifier) {
            case KeyboardModifier.None:
                return KeyboardModifier.Alt;
            case KeyboardModifier.Shift:
                return KeyboardModifier.ShiftAlt;
            case KeyboardModifier.ShiftAlt:
                return KeyboardModifier.Shift;
            case KeyboardModifier.Alt:
                return KeyboardModifier.None;
        }
    }
    _invertShiftModifier(modifier) {
        switch (modifier) {
            case KeyboardModifier.None:
                return KeyboardModifier.Shift;
            case KeyboardModifier.Alt:
                return KeyboardModifier.ShiftAlt;
            case KeyboardModifier.ShiftAlt:
                return KeyboardModifier.Alt;
            case KeyboardModifier.Shift:
                return KeyboardModifier.None;
        }
    }
}
MatKeyboardComponent.decorators = [
    { type: Component, args: [{
                selector: 'mat-keyboard',
                template: "<div class=\"mat-keyboard-wrapper\"\r\n     [class.dark-theme]=\"darkTheme$ | async\"\r\n     [class.debug]=\"isDebug$ | async\"\r\n>\r\n  <nav class=\"mat-keyboard-layout\">\r\n    <div class=\"mat-keyboard-row\"\r\n         *ngFor=\"let row of layout.keys\"\r\n    >\r\n      <ng-container *ngFor=\"let key of row\">\r\n        <mat-keyboard-key class=\"mat-keyboard-col\"\r\n                          *ngIf=\"getModifiedKey(key)\"\r\n                          [key]=\"getModifiedKey(key)\"\r\n                          [icon]=\"getKeyIcon(key)\"\r\n                          [active]=\"isActive(key)\"\r\n                          [input]=\"inputInstance | async\"\r\n                          [control]=\"control\"\r\n                          (enterClick)=\"onEnterClick()\"\r\n                          (capsClick)=\"onCapsClick()\"\r\n                          (altClick)=\"onAltClick()\"\r\n                          (shiftClick)=\"onShiftClick()\"\r\n                          (keyClick)=\"onKeyClick()\"\r\n        ></mat-keyboard-key>\r\n      </ng-container>\r\n    </div>\r\n  </nav>\r\n</div>\r\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                preserveWhitespaces: false,
                styles: [".mat-keyboard-wrapper{background-color:#f5f5f5;border-radius:2px;display:flex;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;justify-content:space-between;line-height:20px;padding:14px 24px}.mat-keyboard-wrapper.dark-theme{background-color:#424242}.mat-keyboard-action{background:none;color:inherit;flex-shrink:0;font-family:inherit;font-size:inherit;font-weight:600;line-height:1;margin-left:8px;text-transform:uppercase}:host(.dark-theme) .mat-keyboard-action{color:#f5f5f5}.mat-keyboard-layout{width:100%}.mat-keyboard-row{align-items:stretch;display:flex;flex-direction:row;flex-wrap:nowrap}.mat-keyboard-col{box-sizing:border-box;flex:1 1 auto;padding:4px}.mat-keyboard-key{min-width:0;width:100%}:host(.dark-theme) .mat-keyboard-key{background-color:#616161;color:#f5f5f5}:host(.debug) .mat-keyboard-key-deadkey{background-color:#5f9ea0}:host(.debug) .mat-keyboard-key-modifier{background-color:#7fffd4}:host(.debug.dark-theme) .mat-keyboard-key-deadkey{background-color:#639}:host(.debug.dark-theme) .mat-keyboard-key-modifier{background-color:#9370db}"]
            },] }
];
MatKeyboardComponent.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] },
    { type: MatKeyboardService }
];
MatKeyboardComponent.propDecorators = {
    _keys: [{ type: ViewChildren, args: [MatKeyboardKeyComponent,] }],
    cssClass: [{ type: HostBinding, args: ['class.mat-keyboard',] }],
    onKeyDown: [{ type: HostListener, args: ['document:keydown', ['$event'],] }],
    onKeyUp: [{ type: HostListener, args: ['document:keyup', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvc3JjL2NvbXBvbmVudHMva2V5Ym9hcmQva2V5Ym9hcmQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQWMsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBcUIsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVLLE9BQU8sRUFBRSxlQUFlLEVBQWMsTUFBTSxNQUFNLENBQUM7QUFFbkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBR3RFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRWpGOzs7R0FHRztBQVFILE1BQU0sT0FBTyxvQkFBb0I7SUFtRS9CLHNCQUFzQjtJQUN0QixZQUF1QyxPQUFlLEVBQ2xDLGdCQUFvQztRQURqQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0I7UUFuRWhELGVBQVUsR0FBNkIsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbEUsYUFBUSxHQUE2QixJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVoRSxvQkFBZSxHQUF1QyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUtoRixjQUFTLEdBQXFCLGdCQUFnQixDQUFDLElBQUksQ0FBQztRQUVwRCxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUVwQixXQUFN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WUFFbkMsS0FBSyxnQkFBZ0IsQ0FBQyxRQUFRO2dCQUM1QixPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUVoQyxLQUFLLGdCQUFnQixDQUFDLEdBQUc7Z0JBQ3ZCLE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1NBQ2hDO0lBQ0gsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFFBQTBCO1FBQ3JELFFBQVEsUUFBUSxFQUFFO1lBQ2hCLEtBQUssZ0JBQWdCLENBQUMsSUFBSTtnQkFDeEIsT0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFaEMsS0FBSyxnQkFBZ0IsQ0FBQyxHQUFHO2dCQUN2QixPQUFPLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztZQUVuQyxLQUFLLGdCQUFnQixDQUFDLFFBQVE7Z0JBQzVCLE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxDQUFDO1lBRTlCLEtBQUssZ0JBQWdCLENBQUMsS0FBSztnQkFDekIsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7U0FDaEM7SUFDSCxDQUFDOzs7WUF0UUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixrbUNBQXdDO2dCQUV4QyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsbUJBQW1CLEVBQUUsS0FBSzs7YUFDM0I7Ozt5Q0FxRWMsTUFBTSxTQUFDLFNBQVM7WUFsRnRCLGtCQUFrQjs7O29CQXNCeEIsWUFBWSxTQUFDLHVCQUF1Qjt1QkFtQnBDLFdBQVcsU0FBQyxvQkFBb0I7d0JBb0doQyxZQUFZLFNBQUMsa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLENBQUM7c0JBeUIzQyxZQUFZLFNBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIEluamVjdCwgTE9DQUxFX0lELCBPbkluaXQsIFF1ZXJ5TGlzdCwgVmlld0NoaWxkcmVuIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEFic3RyYWN0Q29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IE1hdEtleWJvYXJkUmVmIH0gZnJvbSAnLi4vLi4vY2xhc3Nlcy9rZXlib2FyZC1yZWYuY2xhc3MnO1xyXG5pbXBvcnQgeyBLRVlCT0FSRF9JQ09OUyB9IGZyb20gJy4uLy4uL2NvbmZpZ3Mva2V5Ym9hcmQtaWNvbnMuY29uZmlnJztcclxuaW1wb3J0IHsgS2V5Ym9hcmRDbGFzc0tleSB9IGZyb20gJy4uLy4uL2VudW1zL2tleWJvYXJkLWNsYXNzLWtleS5lbnVtJztcclxuaW1wb3J0IHsgS2V5Ym9hcmRNb2RpZmllciB9IGZyb20gJy4uLy4uL2VudW1zL2tleWJvYXJkLW1vZGlmaWVyLmVudW0nO1xyXG5pbXBvcnQgeyBJS2V5Ym9hcmRJY29ucywgSU1hdEljb24gfSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL2tleWJvYXJkLWljb25zLmludGVyZmFjZSc7XHJcbmltcG9ydCB7IElLZXlib2FyZExheW91dCB9IGZyb20gJy4uLy4uL2ludGVyZmFjZXMva2V5Ym9hcmQtbGF5b3V0LmludGVyZmFjZSc7XHJcbmltcG9ydCB7IE1hdEtleWJvYXJkU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2tleWJvYXJkLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBNYXRLZXlib2FyZEtleUNvbXBvbmVudCB9IGZyb20gJy4uL2tleWJvYXJkLWtleS9rZXlib2FyZC1rZXkuY29tcG9uZW50JztcclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBvbmVudCB1c2VkIHRvIG9wZW4gYXMgdGhlIGRlZmF1bHQga2V5Ym9hcmQsIG1hdGNoaW5nIG1hdGVyaWFsIHNwZWMuXHJcbiAqIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBrZXlib2FyZCBzZXJ2aWNlLlxyXG4gKi9cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdtYXQta2V5Ym9hcmQnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9rZXlib2FyZC5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4va2V5Ym9hcmQuY29tcG9uZW50LnNjc3MnXSxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0S2V5Ym9hcmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xyXG5cclxuICBwcml2YXRlIF9kYXJrVGhlbWU6IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPiA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UpO1xyXG5cclxuICBwcml2YXRlIF9pc0RlYnVnOiBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGZhbHNlKTtcclxuXHJcbiAgcHJpdmF0ZSBfaW5wdXRJbnN0YW5jZSQ6IEJlaGF2aW9yU3ViamVjdDxFbGVtZW50UmVmIHwgbnVsbD4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0KG51bGwpO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE1hdEtleWJvYXJkS2V5Q29tcG9uZW50KVxyXG4gIHByaXZhdGUgX2tleXM6IFF1ZXJ5TGlzdDxNYXRLZXlib2FyZEtleUNvbXBvbmVudD47XHJcblxyXG4gIHByaXZhdGUgX21vZGlmaWVyOiBLZXlib2FyZE1vZGlmaWVyID0gS2V5Ym9hcmRNb2RpZmllci5Ob25lO1xyXG5cclxuICBwcml2YXRlIF9jYXBzTG9ja2VkID0gZmFsc2U7XHJcblxyXG4gIHByaXZhdGUgX2ljb25zOiBJS2V5Ym9hcmRJY29ucyA9IEtFWUJPQVJEX0lDT05TO1xyXG5cclxuICAvLyB0aGUgc2VydmljZSBwcm92aWRlcyBhIGxvY2FsZSBvciBsYXlvdXQgb3B0aW9uYWxseVxyXG4gIGxvY2FsZT86IHN0cmluZztcclxuXHJcbiAgbGF5b3V0OiBJS2V5Ym9hcmRMYXlvdXQ7XHJcblxyXG4gIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbDtcclxuXHJcbiAgLy8gdGhlIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgbWFraW5nIHVwIHRoZSBjb250ZW50IG9mIHRoZSBrZXlib2FyZFxyXG4gIGtleWJvYXJkUmVmOiBNYXRLZXlib2FyZFJlZjxNYXRLZXlib2FyZENvbXBvbmVudD47XHJcblxyXG4gIEBIb3N0QmluZGluZygnY2xhc3MubWF0LWtleWJvYXJkJylcclxuICBjc3NDbGFzcyA9IHRydWU7XHJcblxyXG4gIGVudGVyQ2xpY2s6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcclxuXHJcbiAgY2Fwc0NsaWNrOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gIGFsdENsaWNrOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XHJcblxyXG4gIHNoaWZ0Q2xpY2s6IEV2ZW50RW1pdHRlcjx2b2lkPiA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcclxuXHJcbiAgLy8gcmV0dXJucyBhbiBvYnNlcnZhYmxlIG9mIHRoZSBpbnB1dCBpbnN0YW5jZVxyXG4gIGdldCBpbnB1dEluc3RhbmNlKCk6IE9ic2VydmFibGU8RWxlbWVudFJlZiB8IG51bGw+IHtcclxuICAgIHJldHVybiB0aGlzLl9pbnB1dEluc3RhbmNlJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIHNldCBpY29ucyhpY29uczogSUtleWJvYXJkSWNvbnMpIHtcclxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5faWNvbnMsIGljb25zKTtcclxuICB9XHJcblxyXG4gIHNldCBkYXJrVGhlbWUoZGFya1RoZW1lOiBib29sZWFuKSB7XHJcbiAgICBpZiAodGhpcy5fZGFya1RoZW1lLmdldFZhbHVlKCkgIT09IGRhcmtUaGVtZSkge1xyXG4gICAgICB0aGlzLl9kYXJrVGhlbWUubmV4dChkYXJrVGhlbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0IGlzRGVidWcoaXNEZWJ1ZzogYm9vbGVhbikge1xyXG4gICAgaWYgKHRoaXMuX2lzRGVidWcuZ2V0VmFsdWUoKSAhPT0gaXNEZWJ1Zykge1xyXG4gICAgICB0aGlzLl9pc0RlYnVnLm5leHQoaXNEZWJ1Zyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgZGFya1RoZW1lJCgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLl9kYXJrVGhlbWUuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBnZXQgaXNEZWJ1ZyQoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNEZWJ1Zy5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIC8vIGluamVjdCBkZXBlbmRlbmNpZXNcclxuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfa2V5Ym9hcmRTZXJ2aWNlOiBNYXRLZXlib2FyZFNlcnZpY2UpIHsgfVxyXG5cclxuICBzZXRJbnB1dEluc3RhbmNlKGlucHV0SW5zdGFuY2U6IEVsZW1lbnRSZWYpIHtcclxuICAgIHRoaXMuX2lucHV0SW5zdGFuY2UkLm5leHQoaW5wdXRJbnN0YW5jZSk7XHJcbiAgfVxyXG5cclxuICBhdHRhY2hDb250cm9sKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCkge1xyXG4gICAgdGhpcy5jb250cm9sID0gY29udHJvbDtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgLy8gc2V0IGEgZmFsbGJhY2sgdXNpbmcgdGhlIGxvY2FsZVxyXG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xyXG4gICAgICB0aGlzLmxvY2FsZSA9IHRoaXMuX2tleWJvYXJkU2VydmljZS5tYXBMb2NhbGUodGhpcy5fbG9jYWxlKSA/IHRoaXMuX2xvY2FsZSA6ICdlbi1VUyc7XHJcbiAgICAgIHRoaXMubGF5b3V0ID0gdGhpcy5fa2V5Ym9hcmRTZXJ2aWNlLmdldExheW91dEZvckxvY2FsZSh0aGlzLmxvY2FsZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBkaXNtaXNzZXMgdGhlIGtleWJvYXJkXHJcbiAgICovXHJcbiAgZGlzbWlzcygpIHtcclxuICAgIHRoaXMua2V5Ym9hcmRSZWYuZGlzbWlzcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogY2hlY2tzIGlmIGEgZ2l2ZW4ga2V5IGlzIGN1cnJlbnRseSBwcmVzc2VkXHJcbiAgICogQHBhcmFtIGtleVxyXG4gICAqIEBwYXJhbVxyXG4gICAqL1xyXG4gIGlzQWN0aXZlKGtleTogKHN0cmluZyB8IEtleWJvYXJkQ2xhc3NLZXkpW10pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG1vZGlmaWVkS2V5OiBzdHJpbmcgPSB0aGlzLmdldE1vZGlmaWVkS2V5KGtleSk7XHJcbiAgICBjb25zdCBpc0FjdGl2ZUNhcHNMb2NrOiBib29sZWFuID0gbW9kaWZpZWRLZXkgPT09IEtleWJvYXJkQ2xhc3NLZXkuQ2FwcyAmJiB0aGlzLl9jYXBzTG9ja2VkO1xyXG4gICAgY29uc3QgaXNBY3RpdmVNb2RpZmllcjogYm9vbGVhbiA9IG1vZGlmaWVkS2V5ID09PSBLZXlib2FyZE1vZGlmaWVyW3RoaXMuX21vZGlmaWVyXTtcclxuICAgIHJldHVybiBpc0FjdGl2ZUNhcHNMb2NrIHx8IGlzQWN0aXZlTW9kaWZpZXI7XHJcbiAgfVxyXG5cclxuICAvLyByZXRyaWV2ZXMgbW9kaWZpZWQga2V5XHJcbiAgZ2V0TW9kaWZpZWRLZXkoa2V5OiAoc3RyaW5nIHwgS2V5Ym9hcmRDbGFzc0tleSlbXSk6IHN0cmluZyB7XHJcbiAgICBsZXQgbW9kaWZpZXI6IEtleWJvYXJkTW9kaWZpZXIgPSB0aGlzLl9tb2RpZmllcjtcclxuXHJcbiAgICAvLyBgQ2Fwc0xvY2tgIGludmVydHMgdGhlIG1lYW5pbmcgb2YgYFNoaWZ0YFxyXG4gICAgaWYgKHRoaXMuX2NhcHNMb2NrZWQpIHtcclxuICAgICAgbW9kaWZpZXIgPSB0aGlzLl9pbnZlcnRTaGlmdE1vZGlmaWVyKHRoaXMuX21vZGlmaWVyKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ga2V5W21vZGlmaWVyXTtcclxuICB9XHJcblxyXG4gIC8vIHJldHJpZXZlcyBpY29uIGZvciBnaXZlbiBrZXlcclxuICBnZXRLZXlJY29uKGtleTogKHN0cmluZyB8IEtleWJvYXJkQ2xhc3NLZXkpW10pOiBJTWF0SWNvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5faWNvbnNba2V5W0tleWJvYXJkTW9kaWZpZXIuTm9uZV1dO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbGlzdGVucyB0byB1c2VycyBrZXlib2FyZCBpbnB1dHMgdG8gc2ltdWxhdGUgb24gdmlydHVhbCBrZXlib2FyZCwgdG9vXHJcbiAgICogQHBhcmFtIGV2ZW50XHJcbiAgICovXHJcbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6a2V5ZG93bicsIFsnJGV2ZW50J10pXHJcbiAgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAvLyAnYWN0aXZhdGUnIGNvcnJlc3BvbmRpbmcga2V5XHJcbiAgICB0aGlzLl9rZXlzXHJcbiAgICAgIC5maWx0ZXIoKGtleTogTWF0S2V5Ym9hcmRLZXlDb21wb25lbnQpID0+IGtleS5rZXkgPT09IGV2ZW50LmtleSlcclxuICAgICAgLmZvckVhY2goKGtleTogTWF0S2V5Ym9hcmRLZXlDb21wb25lbnQpID0+IHtcclxuICAgICAgICBrZXkucHJlc3NlZCA9IHRydWU7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIHNpbXVsYXRlIG1vZGlmaWVyIHByZXNzXHJcbiAgICBpZiAoZXZlbnQua2V5ID09PSBLZXlib2FyZENsYXNzS2V5LkNhcHMpIHtcclxuICAgICAgdGhpcy5vbkNhcHNDbGljayhldmVudC5nZXRNb2RpZmllclN0YXRlKEtleWJvYXJkQ2xhc3NLZXkuQ2FwcykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gS2V5Ym9hcmRDbGFzc0tleS5BbHQgJiYgdGhpcy5fbW9kaWZpZXIgIT09IEtleWJvYXJkTW9kaWZpZXIuQWx0ICYmIHRoaXMuX21vZGlmaWVyICE9PSBLZXlib2FyZE1vZGlmaWVyLlNoaWZ0QWx0KSB7XHJcbiAgICAgIHRoaXMub25BbHRDbGljaygpO1xyXG4gICAgfVxyXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gS2V5Ym9hcmRDbGFzc0tleS5TaGlmdCAmJiB0aGlzLl9tb2RpZmllciAhPT0gS2V5Ym9hcmRNb2RpZmllci5TaGlmdCAmJiB0aGlzLl9tb2RpZmllciAhPT0gS2V5Ym9hcmRNb2RpZmllci5TaGlmdEFsdCkge1xyXG4gICAgICB0aGlzLm9uU2hpZnRDbGljaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbGlzdGVucyB0byB1c2VycyBrZXlib2FyZCBpbnB1dHMgdG8gc2ltdWxhdGUgb24gdmlydHVhbCBrZXlib2FyZCwgdG9vXHJcbiAgICogQHBhcmFtIGV2ZW50XHJcbiAgICovXHJcbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6a2V5dXAnLCBbJyRldmVudCddKVxyXG4gIG9uS2V5VXAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgIC8vICdkZWFjdGl2YXRlJyBjb3JyZXNwb25kaW5nIGtleVxyXG4gICAgdGhpcy5fa2V5c1xyXG4gICAgICAuZmlsdGVyKChrZXk6IE1hdEtleWJvYXJkS2V5Q29tcG9uZW50KSA9PiBrZXkua2V5ID09PSBldmVudC5rZXkpXHJcbiAgICAgIC5mb3JFYWNoKChrZXk6IE1hdEtleWJvYXJkS2V5Q29tcG9uZW50KSA9PiB7XHJcbiAgICAgICAga2V5LnByZXNzZWQgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gc2ltdWxhdGUgbW9kaWZpZXIgcmVsZWFzZVxyXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gS2V5Ym9hcmRDbGFzc0tleS5BbHQgJiYgKHRoaXMuX21vZGlmaWVyID09PSBLZXlib2FyZE1vZGlmaWVyLkFsdCB8fCB0aGlzLl9tb2RpZmllciA9PT0gS2V5Ym9hcmRNb2RpZmllci5TaGlmdEFsdCkpIHtcclxuICAgICAgdGhpcy5vbkFsdENsaWNrKCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZXZlbnQua2V5ID09PSBLZXlib2FyZENsYXNzS2V5LlNoaWZ0ICYmICh0aGlzLl9tb2RpZmllciA9PT0gS2V5Ym9hcmRNb2RpZmllci5TaGlmdCB8fCB0aGlzLl9tb2RpZmllciA9PT0gS2V5Ym9hcmRNb2RpZmllci5TaGlmdEFsdCkpIHtcclxuICAgICAgdGhpcy5vblNoaWZ0Q2xpY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGJ1YmJsZXMgZXZlbnQgaWYgc3VibWl0IGlzIHBvdGVudGlhbGx5IHRyaWdnZXJlZFxyXG4gICAqL1xyXG4gIG9uRW50ZXJDbGljaygpIHtcclxuICAgIC8vIG5vdGlmeSBzdWJzY3JpYmVyc1xyXG4gICAgdGhpcy5lbnRlckNsaWNrLm5leHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNpbXVsYXRlcyBjbGlja2luZyBgQ2Fwc0xvY2tgIGtleVxyXG4gICAqIEBwYXJhbSB0YXJnZXRTdGF0ZVxyXG4gICAqL1xyXG4gIG9uQ2Fwc0NsaWNrKHRhcmdldFN0YXRlID0gIXRoaXMuX2NhcHNMb2NrZWQpIHtcclxuICAgIC8vIG5vdCBpbXBsZW1lbnRlZFxyXG4gICAgdGhpcy5fY2Fwc0xvY2tlZCA9IHRhcmdldFN0YXRlO1xyXG5cclxuICAgIC8vIG5vdGlmeSBzdWJzY3JpYmVyc1xyXG4gICAgdGhpcy5jYXBzQ2xpY2submV4dCgpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBub24tbW9kaWZpZXIga2V5cyBhcmUgY2xpY2tlZFxyXG4gICAqL1xyXG4gIG9uS2V5Q2xpY2soKSB7XHJcbiAgICBpZiAodGhpcy5fbW9kaWZpZXIgPT09IEtleWJvYXJkTW9kaWZpZXIuU2hpZnQgfHwgdGhpcy5fbW9kaWZpZXIgPT09IEtleWJvYXJkTW9kaWZpZXIuU2hpZnRBbHQpIHtcclxuICAgICAgdGhpcy5fbW9kaWZpZXIgPSB0aGlzLl9pbnZlcnRTaGlmdE1vZGlmaWVyKHRoaXMuX21vZGlmaWVyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fbW9kaWZpZXIgPT09IEtleWJvYXJkTW9kaWZpZXIuQWx0IHx8IHRoaXMuX21vZGlmaWVyID09PSBLZXlib2FyZE1vZGlmaWVyLlNoaWZ0QWx0KSB7XHJcbiAgICAgIHRoaXMuX21vZGlmaWVyID0gdGhpcy5faW52ZXJ0QWx0TW9kaWZpZXIodGhpcy5fbW9kaWZpZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2ltdWxhdGVzIGNsaWNraW5nIGBBbHRgIGtleVxyXG4gICAqL1xyXG4gIG9uQWx0Q2xpY2soKSB7XHJcbiAgICAvLyBpbnZlcnQgbW9kaWZpZXIgbWVhbmluZ1xyXG4gICAgdGhpcy5fbW9kaWZpZXIgPSB0aGlzLl9pbnZlcnRBbHRNb2RpZmllcih0aGlzLl9tb2RpZmllcik7XHJcblxyXG4gICAgLy8gbm90aWZ5IHN1YnNjcmliZXJzXHJcbiAgICB0aGlzLmFsdENsaWNrLm5leHQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNpbXVsYXRlcyBjbGlja2luZyBgU2hpZnRgIGtleVxyXG4gICAqL1xyXG4gIG9uU2hpZnRDbGljaygpIHtcclxuICAgIC8vIGludmVydCBtb2RpZmllciBtZWFuaW5nXHJcbiAgICB0aGlzLl9tb2RpZmllciA9IHRoaXMuX2ludmVydFNoaWZ0TW9kaWZpZXIodGhpcy5fbW9kaWZpZXIpO1xyXG5cclxuICAgIC8vIG5vdGlmeSBzdWJzY3JpYmVyc1xyXG4gICAgdGhpcy5zaGlmdENsaWNrLm5leHQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2ludmVydEFsdE1vZGlmaWVyKG1vZGlmaWVyOiBLZXlib2FyZE1vZGlmaWVyKTogS2V5Ym9hcmRNb2RpZmllciB7XHJcbiAgICBzd2l0Y2ggKG1vZGlmaWVyKSB7XHJcbiAgICAgIGNhc2UgS2V5Ym9hcmRNb2RpZmllci5Ob25lOlxyXG4gICAgICAgIHJldHVybiBLZXlib2FyZE1vZGlmaWVyLkFsdDtcclxuXHJcbiAgICAgIGNhc2UgS2V5Ym9hcmRNb2RpZmllci5TaGlmdDpcclxuICAgICAgICByZXR1cm4gS2V5Ym9hcmRNb2RpZmllci5TaGlmdEFsdDtcclxuXHJcbiAgICAgIGNhc2UgS2V5Ym9hcmRNb2RpZmllci5TaGlmdEFsdDpcclxuICAgICAgICByZXR1cm4gS2V5Ym9hcmRNb2RpZmllci5TaGlmdDtcclxuXHJcbiAgICAgIGNhc2UgS2V5Ym9hcmRNb2RpZmllci5BbHQ6XHJcbiAgICAgICAgcmV0dXJuIEtleWJvYXJkTW9kaWZpZXIuTm9uZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2ludmVydFNoaWZ0TW9kaWZpZXIobW9kaWZpZXI6IEtleWJvYXJkTW9kaWZpZXIpOiBLZXlib2FyZE1vZGlmaWVyIHtcclxuICAgIHN3aXRjaCAobW9kaWZpZXIpIHtcclxuICAgICAgY2FzZSBLZXlib2FyZE1vZGlmaWVyLk5vbmU6XHJcbiAgICAgICAgcmV0dXJuIEtleWJvYXJkTW9kaWZpZXIuU2hpZnQ7XHJcblxyXG4gICAgICBjYXNlIEtleWJvYXJkTW9kaWZpZXIuQWx0OlxyXG4gICAgICAgIHJldHVybiBLZXlib2FyZE1vZGlmaWVyLlNoaWZ0QWx0O1xyXG5cclxuICAgICAgY2FzZSBLZXlib2FyZE1vZGlmaWVyLlNoaWZ0QWx0OlxyXG4gICAgICAgIHJldHVybiBLZXlib2FyZE1vZGlmaWVyLkFsdDtcclxuXHJcbiAgICAgIGNhc2UgS2V5Ym9hcmRNb2RpZmllci5TaGlmdDpcclxuICAgICAgICByZXR1cm4gS2V5Ym9hcmRNb2RpZmllci5Ob25lO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuIl19