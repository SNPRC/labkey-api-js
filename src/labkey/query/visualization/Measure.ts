/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { buildURL } from '../../ActionURL'
import { request } from '../../Ajax'
import { apply, getCallbackWrapper, getOnFailure, getOnSuccess } from '../../Utils'

import { Dimension } from './Dimension'
import { getSuccessCallbackWrapper } from './Utils'

function createDimensions(json: any): Array<Dimension> {

    let dimensions = [];
    if (json.dimensions && json.dimensions.length) {
        for (let i=0; i < json.dimensions.length; i++) {
            dimensions.push(new Dimension(json.dimensions[i]));
        }
    }

    return dimensions;
}

export interface IMeasureGetDimensionsOptions {
    /**
     * Function called when execution fails. Called with the following parameters:
     * * **errorInfo:** an object containing detailed error information (may be null)
     * * **response:** The XMLHttpResponse object
     */
    failure?: Function

    /**
     * Applies only to measures from study datasets.
     * Indicates whether dimensions from demographic datasets should be included
     * in the returned set. If false, only dimensions from the measure's query will be returned.
     */
    includeDemographics?: boolean
    scope?: any

    /**
     * Function called when execution succeeds. Will be called with one argument:
     * **values**: an array of unique dimension values
     */
    success?: Function
}

/**
 * @namespace Measures are plottable data elements (columns).  They may be of numeric or date types.
 */
export class Measure {

    description: string;
    _isUserDefined: boolean;
    label: string;
    name: string;
    queryName: string;
    schemaName: string;
    type: string;

    constructor(config: any) {
        if (config && config.hasOwnProperty('isUserDefined')) {
            this._isUserDefined = config['isUserDefined'];
        }
        apply(this, config);
    }

    /**
     * Returns a description of this measure.
     * @returns {string}
     */
    getDescription(): string {
        return this.description;
    }

    /**
     * Returns the set of available [[Dimension]] objects for this measure.
     * @param {IMeasureGetDimensionsOptions} options
     */
    getDimensions(options: IMeasureGetDimensionsOptions): void {

        let params: any = {
            queryName: this.queryName,
            schemaName: this.schemaName
        };

        if (options.includeDemographics) {
            params.includeDemographics = true;
        }

        request({
            url: buildURL('visualization', 'getDimensions'),
            method: 'GET',
            params,
            success: getSuccessCallbackWrapper(createDimensions, getOnSuccess(options), options.scope),
            failure: getCallbackWrapper(getOnFailure(options), options.scope, true)
        });
    }

    /**
     * Returns the label of this measure.
     * @returns {string}
     */
    getLabel(): string {
        return this.label;
    }

    /**
     * Returns the column name of this measure.
     * @returns {string}
     */
    getName(): string {
        return this.name;
    }

    /**
     * Returns the name of the query associated with this measure.
     * @returns {string}
     */
    getQueryName(): string {
        return this.queryName;
    }

    /**
     * Returns the name of the schema associated with this measure.
     * @returns {string}
     */
    getSchemaName(): string {
        return this.schemaName;
    }

    /**
     * Returns the data types of this measure.
     * @returns {string}
     */
    getType(): string {
        return this.type;
    }

    /**
     * Returns whether this measure is part of a user-defined query (versus a built-in/system-provided query).
     * @returns {boolean}
     */
    isUserDefined(): boolean {
        return this._isUserDefined;
    }
}
