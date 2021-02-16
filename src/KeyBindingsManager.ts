import { isMac, Key } from './Keyboard';
import SettingsStore from './settings/SettingsStore';

export enum KeyBindingContext {
    /** Key bindings for the chat message composer component */
    MessageComposer = 'MessageComposer',
}

export enum KeyAction {
    None = 'None',

    // SendMessageComposer actions:

    /** Send a message */
    Send = 'Send',
    /** Go backwards through the send history and use the message in composer view */
    SelectPrevSendHistory = 'SelectPrevSendHistory',
    /** Go forwards through the send history */
    SelectNextSendHistory = 'SelectNextSendHistory',
    /** Start editing the user's last sent message */
    EditPrevMessage = 'EditPrevMessage',
    /** Start editing the user's next sent message */
    EditNextMessage = 'EditNextMessage',

    /** Cancel editing a message or cancel replying to a message */
    CancelEditing = 'CancelEditing',
}

/**
 * Represent a key combination.
 *
 * The combo is evaluated strictly, i.e. the KeyboardEvent must match exactly what is specified in the KeyCombo.
 */
export type KeyCombo = {
    key?: string;

    /** On PC: ctrl is pressed; on Mac: meta is pressed */
    ctrlOrCmd?: boolean;

    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}

export type KeyBinding = {
    action: KeyAction;
    keyCombo: KeyCombo;
}

const messageComposerBindings = (): KeyBinding[] => {
    const bindings: KeyBinding[] = [
        {
            action: KeyAction.SelectPrevSendHistory,
            keyCombo: {
                key: Key.ARROW_UP,
                altKey: true,
                ctrlKey: true,
            },
        },
        {
            action: KeyAction.SelectNextSendHistory,
            keyCombo: {
                key: Key.ARROW_DOWN,
                altKey: true,
                ctrlKey: true,
            },
        },
        {
            action: KeyAction.EditPrevMessage,
            keyCombo: {
                key: Key.ARROW_UP,
            },
        },
        {
            action: KeyAction.EditNextMessage,
            keyCombo: {
                key: Key.ARROW_DOWN,
            },
        },
        {
            action: KeyAction.CancelEditing,
            keyCombo: {
                key: Key.ESCAPE,
            },
        },
    ];
    if (SettingsStore.getValue('MessageComposerInput.ctrlEnterToSend')) {
        bindings.push({
            action: KeyAction.Send,
            keyCombo: {
                key: Key.ENTER,
                ctrlOrCmd: true,
            },
        });
    } else {
        bindings.push({
            action: KeyAction.Send,
            keyCombo: {
                key: Key.ENTER,
            },
        });
    }

    return bindings;
}

/**
 * Helper method to check if a KeyboardEvent matches a KeyCombo
 *
 * Note, this method is only exported for testing.
 */
export function isKeyComboMatch(ev: KeyboardEvent, combo: KeyCombo, onMac: boolean): boolean {
    if (combo.key !== undefined && ev.key !== combo.key) {
        return false;
    }

    const comboCtrl = combo.ctrlKey ?? false;
    const comboAlt = combo.altKey ?? false;
    const comboShift = combo.shiftKey ?? false;
    const comboMeta = combo.metaKey ?? false;
    // When ctrlOrCmd is set, the keys need do evaluated differently on PC and Mac
    if (combo.ctrlOrCmd) {
        if (onMac) {
            if (!ev.metaKey
                || ev.ctrlKey !== comboCtrl
                || ev.altKey !== comboAlt
                || ev.shiftKey !== comboShift) {
                return false;
            }
        } else {
            if (!ev.ctrlKey
                || ev.metaKey !== comboMeta
                || ev.altKey !== comboAlt
                || ev.shiftKey !== comboShift) {
                return false;
            }
        }
        return true;
    }

    if (ev.metaKey !== comboMeta
        || ev.ctrlKey !== comboCtrl
        || ev.altKey !== comboAlt
        || ev.shiftKey !== comboShift) {
        return false;
    }

    return true;
}

export type KeyBindingsGetter = () => KeyBinding[];

export class KeyBindingsManager {
    /**
     * Map of KeyBindingContext to a KeyBinding getter arrow function.
     *
     * Returning a getter function allowed to have dynamic bindings, e.g. when settings change the bindings can be
     * recalculated.
     */
    contextBindings: Record<KeyBindingContext, KeyBindingsGetter> = {
        [KeyBindingContext.MessageComposer]: messageComposerBindings,
    };

    /**
     * Finds a matching KeyAction for a given KeyboardEvent
     */
    getAction(context: KeyBindingContext, ev: KeyboardEvent): KeyAction {
        const bindings = this.contextBindings[context]?.();
        if (!bindings) {
            return KeyAction.None;
        }
        const binding = bindings.find(it => isKeyComboMatch(ev, it.keyCombo, isMac));
        if (binding) {
            return binding.action;
        }

        return KeyAction.None;
    }
}

const manager = new KeyBindingsManager();

export function getKeyBindingsManager(): KeyBindingsManager {
    return manager;
}
