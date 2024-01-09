import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Inject, Injectable, LOCALE_ID, Optional, SkipSelf } from '@angular/core';
import { MatKeyboardRef } from '../classes/keyboard-ref.class';
import { MatKeyboardContainerComponent } from '../components/keyboard-container/keyboard-container.component';
import { MatKeyboardComponent } from '../components/keyboard/keyboard.component';
import { MAT_KEYBOARD_LAYOUTS } from '../configs/keyboard-layouts.config';
import { _applyAvailableLayouts, _applyConfigDefaults } from '../utils/keyboard.utils';
/**
 * Service to dispatch Material Design keyboard.
 */
export class MatKeyboardService {
    constructor(_overlay, _live, _defaultLocale, _layouts, _parentKeyboard) {
        this._overlay = _overlay;
        this._live = _live;
        this._defaultLocale = _defaultLocale;
        this._layouts = _layouts;
        this._parentKeyboard = _parentKeyboard;
        /**
         * Reference to the current keyboard in the view *at this level* (in the Angular injector tree).
         * If there is a parent keyboard service, all operations should delegate to that parent
         * via `_openedKeyboardRef`.
         */
        this._keyboardRefAtThisLevel = null;
        this._availableLocales = {};
        // prepare available layouts mapping
        this._availableLocales = _applyAvailableLayouts(_layouts);
    }
    /** Reference to the currently opened keyboard at *any* level. */
    get _openedKeyboardRef() {
        const parent = this._parentKeyboard;
        return parent ? parent._openedKeyboardRef : this._keyboardRefAtThisLevel;
    }
    set _openedKeyboardRef(value) {
        if (this._parentKeyboard) {
            this._parentKeyboard._openedKeyboardRef = value;
        }
        else {
            this._keyboardRefAtThisLevel = value;
        }
    }
    get availableLocales() {
        return this._availableLocales;
    }
    get isOpened() {
        return !!this._openedKeyboardRef;
    }
    /**
     * Creates and dispatches a keyboard with a custom component for the content, removing any
     * currently opened keyboards.
     *
     * @param layoutOrLocale layout or locale to use.
     * @param config Extra configuration for the keyboard.
     */
    openFromComponent(layoutOrLocale, config) {
        const keyboardRef = this._attachKeyboardContent(config);
        keyboardRef.instance.darkTheme = config.darkTheme;
        keyboardRef.instance.isDebug = config.isDebug;
        // a locale is provided
        if (this.availableLocales[layoutOrLocale]) {
            keyboardRef.instance.locale = layoutOrLocale;
            keyboardRef.instance.layout = this.getLayoutForLocale(layoutOrLocale);
        }
        // a layout name is provided
        if (this._layouts[layoutOrLocale]) {
            keyboardRef.instance.layout = this._layouts[layoutOrLocale];
            keyboardRef.instance.locale = this._layouts[layoutOrLocale].lang && this._layouts[layoutOrLocale].lang.pop();
        }
        if (config.customIcons) {
            keyboardRef.instance.icons = config.customIcons;
        }
        // When the keyboard is dismissed, lower the keyboard counter.
        keyboardRef
            .afterDismissed()
            .subscribe(() => {
            // Clear the keyboard ref if it hasn't already been replaced by a newer keyboard.
            if (this._openedKeyboardRef === keyboardRef) {
                this._openedKeyboardRef = null;
            }
        });
        if (this._openedKeyboardRef) {
            // If a keyboard is already in view, dismiss it and enter the
            // new keyboard after exit animation is complete.
            this._openedKeyboardRef
                .afterDismissed()
                .subscribe(() => {
                keyboardRef.containerInstance.enter();
            });
            this._openedKeyboardRef.dismiss();
        }
        else {
            // If no keyboard is in view, enter the new keyboard.
            keyboardRef.containerInstance.enter();
        }
        // If a dismiss timeout is provided, set up dismiss based on after the keyboard is opened.
        // if (configs.duration > 0) {
        //   keyboardRef.afterOpened().subscribe(() => {
        //     setTimeout(() => keyboardRef.dismiss(), configs.duration);
        //   });
        // }
        if (config.announcementMessage) {
            this._live.announce(config.announcementMessage, config.politeness);
        }
        this._openedKeyboardRef = keyboardRef;
        return this._openedKeyboardRef;
    }
    /**
     * Opens a keyboard with a message and an optional action.
     * @param layoutOrLocale A string representing the locale or the layout name to be used.
     * @param config Additional configuration options for the keyboard.
     */
    open(layoutOrLocale = this._defaultLocale, config = {}) {
        const _config = _applyConfigDefaults(config);
        return this.openFromComponent(layoutOrLocale, _config);
    }
    /**
     * Dismisses the currently-visible keyboard.
     */
    dismiss() {
        if (this._openedKeyboardRef) {
            this._openedKeyboardRef.dismiss();
        }
    }
    /**
     * Map a given locale to a layout name.
     * @param locale The layout name
     */
    mapLocale(locale = this._defaultLocale) {
        let layout;
        const country = locale
            .split('-')
            .shift();
        // search for layout matching the
        // first part, the country code
        if (this.availableLocales[country]) {
            layout = this.availableLocales[locale];
        }
        // look if the detailed locale matches any layout
        if (this.availableLocales[locale]) {
            layout = this.availableLocales[locale];
        }
        if (!layout) {
            throw Error(`No layout found for locale ${locale}`);
        }
        return layout;
    }
    getLayoutForLocale(locale) {
        return this._layouts[this.mapLocale(locale)];
    }
    /**
     * Attaches the keyboard container component to the overlay.
     */
    _attachKeyboardContainer(overlayRef, config) {
        const containerPortal = new ComponentPortal(MatKeyboardContainerComponent, config.viewContainerRef);
        const containerRef = overlayRef.attach(containerPortal);
        // set config
        containerRef.instance.keyboardConfig = config;
        return containerRef.instance;
    }
    /**
     * Places a new component as the content of the keyboard container.
     */
    _attachKeyboardContent(config) {
        const overlayRef = this._createOverlay();
        const container = this._attachKeyboardContainer(overlayRef, config);
        const portal = new ComponentPortal(MatKeyboardComponent);
        const contentRef = container.attachComponentPortal(portal);
        return new MatKeyboardRef(contentRef.instance, container, overlayRef);
    }
    /**
     * Creates a new overlay and places it in the correct location.
     */
    _createOverlay() {
        const state = new OverlayConfig({
            width: '100%'
        });
        state.positionStrategy = this._overlay
            .position()
            .global()
            .centerHorizontally()
            .bottom('0');
        return this._overlay.create(state);
    }
}
MatKeyboardService.decorators = [
    { type: Injectable }
];
MatKeyboardService.ctorParameters = () => [
    { type: Overlay },
    { type: LiveAnnouncer },
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_KEYBOARD_LAYOUTS,] }] },
    { type: MatKeyboardService, decorators: [{ type: Optional }, { type: SkipSelf }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL3NyYy9zZXJ2aWNlcy9rZXlib2FyZC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBYyxNQUFNLHNCQUFzQixDQUFDO0FBQzFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQWdCLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFaEcsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9ELE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLCtEQUErRCxDQUFDO0FBQzlHLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBSzFFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXZGOztHQUVHO0FBRUgsTUFBTSxPQUFPLGtCQUFrQjtJQWdDN0IsWUFBb0IsUUFBaUIsRUFDakIsS0FBb0IsRUFDRCxjQUFzQixFQUNYLFFBQTBCLEVBQ2hDLGVBQW1DO1FBSjNELGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsVUFBSyxHQUFMLEtBQUssQ0FBZTtRQUNELG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7UUFDaEMsb0JBQWUsR0FBZixlQUFlLENBQW9CO1FBbkMvRTs7OztXQUlHO1FBQ0ssNEJBQXVCLEdBQWdELElBQUksQ0FBQztRQUU1RSxzQkFBaUIsR0FBZSxFQUFF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LENBQUM7SUFFRDs7T0FFRztJQUNLLGNBQWM7UUFDcEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFhLENBQUM7WUFDOUIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVE7YUFDbkMsUUFBUSxFQUFFO2FBQ1YsTUFBTSxFQUFFO2FBQ1Isa0JBQWtCLEVBQUU7YUFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWYsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDOzs7WUF6TUYsVUFBVTs7O1lBakJGLE9BQU87WUFEUCxhQUFhO3lDQXFEUCxNQUFNLFNBQUMsU0FBUzs0Q0FDaEIsTUFBTSxTQUFDLG9CQUFvQjtZQUNxQixrQkFBa0IsdUJBQWxFLFFBQVEsWUFBSSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGl2ZUFubm91bmNlciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcclxuaW1wb3J0IHsgT3ZlcmxheSwgT3ZlcmxheUNvbmZpZywgT3ZlcmxheVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcclxuaW1wb3J0IHsgQ29tcG9uZW50UG9ydGFsIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XHJcbmltcG9ydCB7IENvbXBvbmVudFJlZiwgSW5qZWN0LCBJbmplY3RhYmxlLCBMT0NBTEVfSUQsIE9wdGlvbmFsLCBTa2lwU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgTWF0S2V5Ym9hcmRSZWYgfSBmcm9tICcuLi9jbGFzc2VzL2tleWJvYXJkLXJlZi5jbGFzcyc7XHJcbmltcG9ydCB7IE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9rZXlib2FyZC1jb250YWluZXIva2V5Ym9hcmQtY29udGFpbmVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IE1hdEtleWJvYXJkQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy9rZXlib2FyZC9rZXlib2FyZC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBNQVRfS0VZQk9BUkRfTEFZT1VUUyB9IGZyb20gJy4uL2NvbmZpZ3Mva2V5Ym9hcmQtbGF5b3V0cy5jb25maWcnO1xyXG5pbXBvcnQgeyBNYXRLZXlib2FyZENvbmZpZyB9IGZyb20gJy4uL2NvbmZpZ3Mva2V5Ym9hcmQuY29uZmlnJztcclxuaW1wb3J0IHsgSUtleWJvYXJkTGF5b3V0IH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9rZXlib2FyZC1sYXlvdXQuaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgSUtleWJvYXJkTGF5b3V0cyB9IGZyb20gJy4uL2ludGVyZmFjZXMva2V5Ym9hcmQtbGF5b3V0cy5pbnRlcmZhY2UnO1xyXG5pbXBvcnQgeyBJTG9jYWxlTWFwIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9sb2NhbGUtbWFwLmludGVyZmFjZSc7XHJcbmltcG9ydCB7IF9hcHBseUF2YWlsYWJsZUxheW91dHMsIF9hcHBseUNvbmZpZ0RlZmF1bHRzIH0gZnJvbSAnLi4vdXRpbHMva2V5Ym9hcmQudXRpbHMnO1xyXG5cclxuLyoqXHJcbiAqIFNlcnZpY2UgdG8gZGlzcGF0Y2ggTWF0ZXJpYWwgRGVzaWduIGtleWJvYXJkLlxyXG4gKi9cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgTWF0S2V5Ym9hcmRTZXJ2aWNlIHtcclxuICAvKipcclxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQga2V5Ym9hcmQgaW4gdGhlIHZpZXcgKmF0IHRoaXMgbGV2ZWwqIChpbiB0aGUgQW5ndWxhciBpbmplY3RvciB0cmVlKS5cclxuICAgKiBJZiB0aGVyZSBpcyBhIHBhcmVudCBrZXlib2FyZCBzZXJ2aWNlLCBhbGwgb3BlcmF0aW9ucyBzaG91bGQgZGVsZWdhdGUgdG8gdGhhdCBwYXJlbnRcclxuICAgKiB2aWEgYF9vcGVuZWRLZXlib2FyZFJlZmAuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfa2V5Ym9hcmRSZWZBdFRoaXNMZXZlbDogTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIHByaXZhdGUgX2F2YWlsYWJsZUxvY2FsZXM6IElMb2NhbGVNYXAgPSB7fTtcclxuXHJcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudGx5IG9wZW5lZCBrZXlib2FyZCBhdCAqYW55KiBsZXZlbC4gKi9cclxuICBwcml2YXRlIGdldCBfb3BlbmVkS2V5Ym9hcmRSZWYoKTogTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+IHwgbnVsbCB7XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9wYXJlbnRLZXlib2FyZDtcclxuICAgIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuX29wZW5lZEtleWJvYXJkUmVmIDogdGhpcy5fa2V5Ym9hcmRSZWZBdFRoaXNMZXZlbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0IF9vcGVuZWRLZXlib2FyZFJlZih2YWx1ZTogTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+KSB7XHJcbiAgICBpZiAodGhpcy5fcGFyZW50S2V5Ym9hcmQpIHtcclxuICAgICAgdGhpcy5fcGFyZW50S2V5Ym9hcmQuX29wZW5lZEtleWJvYXJkUmVmID0gdmFsdWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9rZXlib2FyZFJlZkF0VGhpc0xldmVsID0gdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgYXZhaWxhYmxlTG9jYWxlcygpOiBJTG9jYWxlTWFwIHtcclxuICAgIHJldHVybiB0aGlzLl9hdmFpbGFibGVMb2NhbGVzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzT3BlbmVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhdGhpcy5fb3BlbmVkS2V5Ym9hcmRSZWY7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vdmVybGF5OiBPdmVybGF5LFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2xpdmU6IExpdmVBbm5vdW5jZXIsXHJcbiAgICAgICAgICAgICAgQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2RlZmF1bHRMb2NhbGU6IHN0cmluZyxcclxuICAgICAgICAgICAgICBASW5qZWN0KE1BVF9LRVlCT0FSRF9MQVlPVVRTKSBwcml2YXRlIF9sYXlvdXRzOiBJS2V5Ym9hcmRMYXlvdXRzLFxyXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBTa2lwU2VsZigpIHByaXZhdGUgX3BhcmVudEtleWJvYXJkOiBNYXRLZXlib2FyZFNlcnZpY2UpIHtcclxuICAgIC8vIHByZXBhcmUgYXZhaWxhYmxlIGxheW91dHMgbWFwcGluZ1xyXG4gICAgdGhpcy5fYXZhaWxhYmxlTG9jYWxlcyA9IF9hcHBseUF2YWlsYWJsZUxheW91dHMoX2xheW91dHMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbmQgZGlzcGF0Y2hlcyBhIGtleWJvYXJkIHdpdGggYSBjdXN0b20gY29tcG9uZW50IGZvciB0aGUgY29udGVudCwgcmVtb3ZpbmcgYW55XHJcbiAgICogY3VycmVudGx5IG9wZW5lZCBrZXlib2FyZHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbGF5b3V0T3JMb2NhbGUgbGF5b3V0IG9yIGxvY2FsZSB0byB1c2UuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBFeHRyYSBjb25maWd1cmF0aW9uIGZvciB0aGUga2V5Ym9hcmQuXHJcbiAgICovXHJcbiAgb3BlbkZyb21Db21wb25lbnQobGF5b3V0T3JMb2NhbGU6IHN0cmluZywgY29uZmlnOiBNYXRLZXlib2FyZENvbmZpZyk6IE1hdEtleWJvYXJkUmVmPE1hdEtleWJvYXJkQ29tcG9uZW50PiB7XHJcbiAgICBjb25zdCBrZXlib2FyZFJlZjogTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+ID0gdGhpcy5fYXR0YWNoS2V5Ym9hcmRDb250ZW50KGNvbmZpZyk7XHJcblxyXG4gICAga2V5Ym9hcmRSZWYuaW5zdGFuY2UuZGFya1RoZW1lID0gY29uZmlnLmRhcmtUaGVtZTtcclxuICAgIGtleWJvYXJkUmVmLmluc3RhbmNlLmlzRGVidWcgPSBjb25maWcuaXNEZWJ1ZztcclxuXHJcbiAgICAvLyBhIGxvY2FsZSBpcyBwcm92aWRlZFxyXG4gICAgaWYgKHRoaXMuYXZhaWxhYmxlTG9jYWxlc1tsYXlvdXRPckxvY2FsZV0pIHtcclxuICAgICAga2V5Ym9hcmRSZWYuaW5zdGFuY2UubG9jYWxlID0gbGF5b3V0T3JMb2NhbGU7XHJcbiAgICAgIGtleWJvYXJkUmVmLmluc3RhbmNlLmxheW91dCA9IHRoaXMuZ2V0TGF5b3V0Rm9yTG9jYWxlKGxheW91dE9yTG9jYWxlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhIGxheW91dCBuYW1lIGlzIHByb3ZpZGVkXHJcbiAgICBpZiAodGhpcy5fbGF5b3V0c1tsYXlvdXRPckxvY2FsZV0pIHtcclxuICAgICAga2V5Ym9hcmRSZWYuaW5zdGFuY2UubGF5b3V0ID0gdGhpcy5fbGF5b3V0c1tsYXlvdXRPckxvY2FsZV07XHJcbiAgICAgIGtleWJvYXJkUmVmLmluc3RhbmNlLmxvY2FsZSA9IHRoaXMuX2xheW91dHNbbGF5b3V0T3JMb2NhbGVdLmxhbmcgJiYgdGhpcy5fbGF5b3V0c1tsYXlvdXRPckxvY2FsZV0ubGFuZy5wb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29uZmlnLmN1c3RvbUljb25zKSB7XHJcbiAgICAgIGtleWJvYXJkUmVmLmluc3RhbmNlLmljb25zID0gY29uZmlnLmN1c3RvbUljb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdoZW4gdGhlIGtleWJvYXJkIGlzIGRpc21pc3NlZCwgbG93ZXIgdGhlIGtleWJvYXJkIGNvdW50ZXIuXHJcbiAgICBrZXlib2FyZFJlZlxyXG4gICAgICAuYWZ0ZXJEaXNtaXNzZWQoKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAvLyBDbGVhciB0aGUga2V5Ym9hcmQgcmVmIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW4gcmVwbGFjZWQgYnkgYSBuZXdlciBrZXlib2FyZC5cclxuICAgICAgICBpZiAodGhpcy5fb3BlbmVkS2V5Ym9hcmRSZWYgPT09IGtleWJvYXJkUmVmKSB7XHJcbiAgICAgICAgICB0aGlzLl9vcGVuZWRLZXlib2FyZFJlZiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICBpZiAodGhpcy5fb3BlbmVkS2V5Ym9hcmRSZWYpIHtcclxuICAgICAgLy8gSWYgYSBrZXlib2FyZCBpcyBhbHJlYWR5IGluIHZpZXcsIGRpc21pc3MgaXQgYW5kIGVudGVyIHRoZVxyXG4gICAgICAvLyBuZXcga2V5Ym9hcmQgYWZ0ZXIgZXhpdCBhbmltYXRpb24gaXMgY29tcGxldGUuXHJcbiAgICAgIHRoaXMuX29wZW5lZEtleWJvYXJkUmVmXHJcbiAgICAgICAgLmFmdGVyRGlzbWlzc2VkKClcclxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgIGtleWJvYXJkUmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX29wZW5lZEtleWJvYXJkUmVmLmRpc21pc3MoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vIGtleWJvYXJkIGlzIGluIHZpZXcsIGVudGVyIHRoZSBuZXcga2V5Ym9hcmQuXHJcbiAgICAgIGtleWJvYXJkUmVmLmNvbnRhaW5lckluc3RhbmNlLmVudGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgYSBkaXNtaXNzIHRpbWVvdXQgaXMgcHJvdmlkZWQsIHNldCB1cCBkaXNtaXNzIGJhc2VkIG9uIGFmdGVyIHRoZSBrZXlib2FyZCBpcyBvcGVuZWQuXHJcbiAgICAvLyBpZiAoY29uZmlncy5kdXJhdGlvbiA+IDApIHtcclxuICAgIC8vICAga2V5Ym9hcmRSZWYuYWZ0ZXJPcGVuZWQoKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgLy8gICAgIHNldFRpbWVvdXQoKCkgPT4ga2V5Ym9hcmRSZWYuZGlzbWlzcygpLCBjb25maWdzLmR1cmF0aW9uKTtcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgaWYgKGNvbmZpZy5hbm5vdW5jZW1lbnRNZXNzYWdlKSB7XHJcbiAgICAgIHRoaXMuX2xpdmUuYW5ub3VuY2UoY29uZmlnLmFubm91bmNlbWVudE1lc3NhZ2UsIGNvbmZpZy5wb2xpdGVuZXNzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9vcGVuZWRLZXlib2FyZFJlZiA9IGtleWJvYXJkUmVmO1xyXG4gICAgcmV0dXJuIHRoaXMuX29wZW5lZEtleWJvYXJkUmVmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3BlbnMgYSBrZXlib2FyZCB3aXRoIGEgbWVzc2FnZSBhbmQgYW4gb3B0aW9uYWwgYWN0aW9uLlxyXG4gICAqIEBwYXJhbSBsYXlvdXRPckxvY2FsZSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGxvY2FsZSBvciB0aGUgbGF5b3V0IG5hbWUgdG8gYmUgdXNlZC5cclxuICAgKiBAcGFyYW0gY29uZmlnIEFkZGl0aW9uYWwgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUga2V5Ym9hcmQuXHJcbiAgICovXHJcbiAgb3BlbihsYXlvdXRPckxvY2FsZTogc3RyaW5nID0gdGhpcy5fZGVmYXVsdExvY2FsZSwgY29uZmlnOiBNYXRLZXlib2FyZENvbmZpZyA9IHt9KTogTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+IHtcclxuICAgIGNvbnN0IF9jb25maWcgPSBfYXBwbHlDb25maWdEZWZhdWx0cyhjb25maWcpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLm9wZW5Gcm9tQ29tcG9uZW50KGxheW91dE9yTG9jYWxlLCBfY29uZmlnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc21pc3NlcyB0aGUgY3VycmVudGx5LXZpc2libGUga2V5Ym9hcmQuXHJcbiAgICovXHJcbiAgZGlzbWlzcygpIHtcclxuICAgIGlmICh0aGlzLl9vcGVuZWRLZXlib2FyZFJlZikge1xyXG4gICAgICB0aGlzLl9vcGVuZWRLZXlib2FyZFJlZi5kaXNtaXNzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXAgYSBnaXZlbiBsb2NhbGUgdG8gYSBsYXlvdXQgbmFtZS5cclxuICAgKiBAcGFyYW0gbG9jYWxlIFRoZSBsYXlvdXQgbmFtZVxyXG4gICAqL1xyXG4gIG1hcExvY2FsZShsb2NhbGU6IHN0cmluZyA9IHRoaXMuX2RlZmF1bHRMb2NhbGUpOiBzdHJpbmcge1xyXG4gICAgbGV0IGxheW91dDogc3RyaW5nO1xyXG4gICAgY29uc3QgY291bnRyeSA9IGxvY2FsZVxyXG4gICAgICAuc3BsaXQoJy0nKVxyXG4gICAgICAuc2hpZnQoKTtcclxuXHJcbiAgICAvLyBzZWFyY2ggZm9yIGxheW91dCBtYXRjaGluZyB0aGVcclxuICAgIC8vIGZpcnN0IHBhcnQsIHRoZSBjb3VudHJ5IGNvZGVcclxuICAgIGlmICh0aGlzLmF2YWlsYWJsZUxvY2FsZXNbY291bnRyeV0pIHtcclxuICAgICAgbGF5b3V0ID0gdGhpcy5hdmFpbGFibGVMb2NhbGVzW2xvY2FsZV07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbG9vayBpZiB0aGUgZGV0YWlsZWQgbG9jYWxlIG1hdGNoZXMgYW55IGxheW91dFxyXG4gICAgaWYgKHRoaXMuYXZhaWxhYmxlTG9jYWxlc1tsb2NhbGVdKSB7XHJcbiAgICAgIGxheW91dCA9IHRoaXMuYXZhaWxhYmxlTG9jYWxlc1tsb2NhbGVdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbGF5b3V0KSB7XHJcbiAgICAgIHRocm93IEVycm9yKGBObyBsYXlvdXQgZm91bmQgZm9yIGxvY2FsZSAke2xvY2FsZX1gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbGF5b3V0O1xyXG4gIH1cclxuXHJcbiAgZ2V0TGF5b3V0Rm9yTG9jYWxlKGxvY2FsZTogc3RyaW5nKTogSUtleWJvYXJkTGF5b3V0IHtcclxuICAgIHJldHVybiB0aGlzLl9sYXlvdXRzW3RoaXMubWFwTG9jYWxlKGxvY2FsZSldO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0YWNoZXMgdGhlIGtleWJvYXJkIGNvbnRhaW5lciBjb21wb25lbnQgdG8gdGhlIG92ZXJsYXkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfYXR0YWNoS2V5Ym9hcmRDb250YWluZXIob3ZlcmxheVJlZjogT3ZlcmxheVJlZiwgY29uZmlnOiBNYXRLZXlib2FyZENvbmZpZyk6IE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50IHtcclxuICAgIGNvbnN0IGNvbnRhaW5lclBvcnRhbCA9IG5ldyBDb21wb25lbnRQb3J0YWwoTWF0S2V5Ym9hcmRDb250YWluZXJDb21wb25lbnQsIGNvbmZpZy52aWV3Q29udGFpbmVyUmVmKTtcclxuICAgIGNvbnN0IGNvbnRhaW5lclJlZjogQ29tcG9uZW50UmVmPE1hdEtleWJvYXJkQ29udGFpbmVyQ29tcG9uZW50PiA9IG92ZXJsYXlSZWYuYXR0YWNoKGNvbnRhaW5lclBvcnRhbCk7XHJcblxyXG4gICAgLy8gc2V0IGNvbmZpZ1xyXG4gICAgY29udGFpbmVyUmVmLmluc3RhbmNlLmtleWJvYXJkQ29uZmlnID0gY29uZmlnO1xyXG5cclxuICAgIHJldHVybiBjb250YWluZXJSZWYuaW5zdGFuY2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGFjZXMgYSBuZXcgY29tcG9uZW50IGFzIHRoZSBjb250ZW50IG9mIHRoZSBrZXlib2FyZCBjb250YWluZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfYXR0YWNoS2V5Ym9hcmRDb250ZW50KGNvbmZpZzogTWF0S2V5Ym9hcmRDb25maWcpOiBNYXRLZXlib2FyZFJlZjxNYXRLZXlib2FyZENvbXBvbmVudD4ge1xyXG4gICAgY29uc3Qgb3ZlcmxheVJlZiA9IHRoaXMuX2NyZWF0ZU92ZXJsYXkoKTtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX2F0dGFjaEtleWJvYXJkQ29udGFpbmVyKG92ZXJsYXlSZWYsIGNvbmZpZyk7XHJcbiAgICBjb25zdCBwb3J0YWwgPSBuZXcgQ29tcG9uZW50UG9ydGFsKE1hdEtleWJvYXJkQ29tcG9uZW50KTtcclxuICAgIGNvbnN0IGNvbnRlbnRSZWYgPSBjb250YWluZXIuYXR0YWNoQ29tcG9uZW50UG9ydGFsKHBvcnRhbCk7XHJcbiAgICByZXR1cm4gbmV3IE1hdEtleWJvYXJkUmVmKGNvbnRlbnRSZWYuaW5zdGFuY2UsIGNvbnRhaW5lciwgb3ZlcmxheVJlZikgYXMgTWF0S2V5Ym9hcmRSZWY8TWF0S2V5Ym9hcmRDb21wb25lbnQ+O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBvdmVybGF5IGFuZCBwbGFjZXMgaXQgaW4gdGhlIGNvcnJlY3QgbG9jYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlT3ZlcmxheSgpOiBPdmVybGF5UmVmIHtcclxuICAgIGNvbnN0IHN0YXRlID0gbmV3IE92ZXJsYXlDb25maWcoe1xyXG4gICAgICB3aWR0aDogJzEwMCUnXHJcbiAgICB9KTtcclxuXHJcbiAgICBzdGF0ZS5wb3NpdGlvblN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheVxyXG4gICAgICAucG9zaXRpb24oKVxyXG4gICAgICAuZ2xvYmFsKClcclxuICAgICAgLmNlbnRlckhvcml6b250YWxseSgpXHJcbiAgICAgIC5ib3R0b20oJzAnKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5fb3ZlcmxheS5jcmVhdGUoc3RhdGUpO1xyXG4gIH1cclxufVxyXG4iXX0=