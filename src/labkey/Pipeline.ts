/*
 * Copyright (c) 2016 LabKey Corporation
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
import { buildURL } from './ActionURL'
import { request } from './Ajax'
import { encode, getCallbackWrapper, getOnFailure, getOnSuccess, isString } from './Utils'

interface IGetFileStatusOptions {
    // required
    files: Array<string>
    path: string
    protocolName: string
    taskId: string

    // optional
    containerPath?: string
    failure?: () => any
    includeWorkbooks?: boolean
    scope?: any
    success?: () => any
}

/**
 * Gets the status of analysis using a particular protocol for a particular pipeline.
 */
export function getFileStatus(config: IGetFileStatusOptions): void {
    let params = {
        taskId: config.taskId,
        path: config.path,
        file: config.files,
        protocolName: config.protocolName
    };

    const onSuccess = getOnSuccess(config);

    // note, it does not return the request
    request({
        url: buildURL('pipeline-analysis', 'getFileStatus.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper((data: any, response: any) => {
            onSuccess.call(this, data.files, data.submitType, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */),
        timeout: 60000000
    });
}

interface IGetPipelineContainerOptions {
    containerPath?: string
    scope?: any
}

/**
 * Gets the container in which the pipeline for this container is defined. This may be the
 * container in which the request was made, or a parent container if the pipeline was defined
 * there.
 * @returns {XMLHttpRequest}
 */
export function getPipelineContainer(config: IGetPipelineContainerOptions): XMLHttpRequest {
    return request({
        url: buildURL('pipeline', 'getPipelineContainer.api', config.containerPath),
        method: 'GET',
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface IGetProtocolsOptions {
    // required
    path: string
    taskId: string

    // optional
    containerPath?: string
    includeWorkbooks?: boolean
    scope?: any
}

export function getProtocols(config: IGetProtocolsOptions): void {
    let params = {
        taskId: config.taskId,
        includeWorkbooks: !!config.includeWorkbooks,
        path: config.path
    };

    const onSuccess = getOnSuccess(config);

    // note, it does not return the request
    request({
        url: buildURL('pipeline-analysis', 'getSavedProtocols.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper((data: any, response: any) => {
            onSuccess.call(this, data.protocols, data.defaultProtocolName, response);
        }, config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */)
    });
}

interface IStartAnalysisOptions {
    // required
    files: Array<string>
    fileIds: Array<number>
    path: string
    protocolName: string
    taskId: string

    // optional
    allowNonExistentFiles?: boolean
    containerPath?: string
    failure?: () => any
    jsonParameters?: any
    protocolDescription?: string
    saveProtocol?: string
    scope?: any
    success?: () => any
    xmlParameters?: string
}

interface IStartAnalysisParams {
    allowNonExistentFiles?: boolean
    configureJson?: any
    configureXml?: string
    file?: Array<string>
    fileIds?: Array<number>
    path?: string
    protocolDescription?: string
    protocolName?: string
    saveProtocol?: string | boolean
    taskId?: string
}

/**
 * Starts analysis of a set of files using a particular protocol definition with a particular pipeline.
 * @param config
 */
export function startAnalysis(config: IStartAnalysisOptions): void {
    if (!config.protocolName) {
        throw 'Invalid config, must include protocolName property';
    }

    let params: IStartAnalysisParams = {
        taskId: config.taskId,
        path: config.path,
        protocolName: config.protocolName,
        protocolDescription: config.protocolDescription,
        file: config.files,
        fileIds: config.fileIds,
        allowNonExistentFiles: config.allowNonExistentFiles,
        saveProtocol: config.saveProtocol == undefined || config.saveProtocol
    };

    if (config.xmlParameters) {
        if (typeof config.xmlParameters == 'object')
            throw new Error('The xml configuration is deprecated, please user the jsonParameters option to specify your protocol description.');
        else
            params.configureXml = config.xmlParameters;
    }
    else if (config.jsonParameters) {
        params.configureJson = isString(config.jsonParameters) ? config.jsonParameters : encode(config.jsonParameters);
    }

    request({
        url: buildURL('pipeline-analysis', 'startAnalysis.api', config.containerPath),
        method: 'POST',
        params,
        success: getCallbackWrapper(getOnSuccess(config), config.scope),
        failure: getCallbackWrapper(getOnFailure(config), config.scope, true /* isErrorCallback */),
        timeout: 60000000
    });
}