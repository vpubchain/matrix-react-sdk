/*
 Copyright 2020 Nurjin Jafar
 Copyright 2020 Nordeck IT + Consulting GmbH.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import React, { useEffect, useRef } from 'react';
import dis from '../../../dispatcher/dispatcher';
import ICanvasEffect from '../../../effects/ICanvasEffect';
import { CHAT_EFFECTS } from '../../../effects'
import UIStore, { UI_EVENTS } from "../../../stores/UIStore";

const EffectsOverlay: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const effectsRef = useRef<Map<string, ICanvasEffect>>(new Map<string, ICanvasEffect>());

    const lazyLoadEffectModule = async (name: string): Promise<ICanvasEffect> => {
        if (!name) return null;
        let effect: ICanvasEffect | null = effectsRef.current[name] || null;
        if (effect === null) {
            const options = CHAT_EFFECTS.find((e) => e.command === name)?.options
            try {
                const { default: Effect } = await import(`../../../effects/${name}`);
                effect = new Effect(options);
                effectsRef.current[name] = effect;
            } catch (err) {
                console.warn(`Unable to load effect module at '../../../effects/${name}.`, err);
            }
        }
        return effect;
    };

    useEffect(() => {
        function onResize(type, entry) {
            if (type === UI_EVENTS.Resize) {
                canvasRef.current.width = entry.contentRect.width;
                canvasRef.current.height = entry.contentRect.height;
            }
        }
        UIStore.instance.on("RoomView", onResize);
        return () => {
            UIStore.instance.removeListener("RoomView", onResize);
        };
    });

    useEffect(() => {
        const onAction = (payload: { action: string }) => {
            const actionPrefix = 'effects.';
            if (payload.action.indexOf(actionPrefix) === 0) {
                const effect = payload.action.substr(actionPrefix.length);
                lazyLoadEffectModule(effect).then((module) => module?.start(canvasRef.current));
            }
        }
        const dispatcherRef = dis.register(onAction);

        return () => {
            dis.unregister(dispatcherRef);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const currentEffects = effectsRef.current; // this is not a react node ref, warning can be safely ignored
            for (const effect in currentEffects) {
                const effectModule: ICanvasEffect = currentEffects[effect];
                if (effectModule && effectModule.isRunning) {
                    effectModule.stop();
                }
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: 'block',
                zIndex: 999999,
                pointerEvents: 'none',
                position: 'fixed',
                top: 0,
                right: 0,
            }}
        />
    )
}

export default EffectsOverlay;
