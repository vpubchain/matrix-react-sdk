/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import Sizer from "../sizer";
import FixedDistributor from "./fixed";
import {IConfig} from "../resizer";
import UIStore from "../../stores/UIStore";

class PercentageSizer extends Sizer {
    public start(item: HTMLElement) {
        if (this.vertical) {
            item.style.minHeight = null;
        } else {
            item.style.minWidth = null;
        }
        UIStore.instance.trackElementDimensions("PercentazeSizer", item);
        UIStore.instance.trackElementDimensions("PercentazeSizerOffsetParent", item.offsetParent);
    }

    public finish(item: HTMLElement) {
        const itemDimensions = UIStore.instance.getElementDimensions("PercentazeSizer");
        const parentDimensions = UIStore.instance.getElementDimensions("PercentazeSizerOffsetParent");

        if (!parent) return;
        if (this.vertical) {
            const p = ((itemDimensions.height / parentDimensions.height) * 100).toFixed(2) + "%";
            item.style.minHeight = p;
            item.style.height = p;
        } else {
            const p = ((itemDimensions.width / parentDimensions.width) * 100).toFixed(2) + "%";
            item.style.minWidth = p;
            item.style.width = p;
        }

        UIStore.instance.stopTrackingElementDimensions("PercentazeSizer");
        UIStore.instance.stopTrackingElementDimensions("PercentazeSizerOffsetParent");
    }
}

export default class PercentageDistributor extends FixedDistributor<IConfig> {
    static createSizer(containerElement: HTMLElement, vertical: boolean, reverse: boolean) {
        return new PercentageSizer(containerElement, vertical, reverse);
    }
}
