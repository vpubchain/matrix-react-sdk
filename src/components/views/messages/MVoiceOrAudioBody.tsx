/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

import React from "react";
import MAudioBody from "./MAudioBody";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import MVoiceMessageBody from "./MVoiceMessageBody";
import { IBodyProps } from "./IBodyProps";

@replaceableComponent("views.messages.MVoiceOrAudioBody")
export default class MVoiceOrAudioBody extends React.PureComponent<IBodyProps> {
    public render() {
        // MSC2516 is a legacy identifier. See https://github.com/matrix-org/matrix-doc/pull/3245
        const isVoiceMessage = !!this.props.mxEvent.getContent()['org.matrix.msc2516.voice']
            || !!this.props.mxEvent.getContent()['org.matrix.msc3245.voice'];
        if (isVoiceMessage) {
            return <MVoiceMessageBody {...this.props} />;
        } else {
            return <MAudioBody {...this.props} />;
        }
    }
}
