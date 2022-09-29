import { loadSync } from "@grpc/proto-loader";
import { credentials, GrpcObject, loadPackageDefinition, StatusObject, ServiceError, Metadata } from "@grpc/grpc-js";
import { parseMetadata, parseMds } from "./metadata";
import { RequestData, ResponseData, Mode } from "../types";

const callCache = {};
const clientCaches = {};
export declare function Callback(
    response: ResponseData | null,
    metadata?: any,
    err?: Error,
    closeStream?: boolean
): void;

export interface ClientStub {
    host: string;
    service: any;
    call: Function;
}

export function getCallStub(request: RequestData): ClientStub {
    let clientKey = request.serviceName;
    if (clientCaches[clientKey] && request.host == clientCaches[clientKey].host) {
        return clientCaches[clientKey];
    }

    let service = loadService(request);
    let serviceImpl = new service(request.host, credentials.createInsecure());
    let clientStub = {
        host: request.host,
        service: serviceImpl,
        call: (request: RequestData, callback?: typeof Callback) =>
            makeCall(serviceImpl, request.methodMode)(request, callback),
    };
    clientCaches[clientKey] = clientStub;
    return clientStub;
}

export async function closeCall(id: string, callback: (response: ResponseData | null, err?: Error) => void) {
    let { call, methodMode } = callCache[id];
    if (!!call) {
        Mode.isWriteStream(methodMode) ? call.end() : call.cancel();
        delete callCache[id];
    } else {
        callback(null, new Error("This request not exist: " + id));
    }
}

function loadService(request: RequestData) {
    let packageDefinition = loadSync([request.protoPath], {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: request.includeDirs,
    });

    let grpcObject: GrpcObject = loadPackageDefinition(packageDefinition);
    let service = null;
    if (request.namespace == "") {
        service = grpcObject[request.namespace];
    } else {
        service = grpcObject[request.namespace][request.serviceName];
    }
    return service;
}

const grpcCallback = (callback: typeof Callback) => {
    return (err: ServiceError, response: any) => {
        console.log("收到服务端返回数据：", err, response);
        callback(response, parseMetadata(err?.metadata), err);
    };
};

function makeCall(serviceImpl: any, mode: Mode): Function {
    switch (mode) {
        case Mode.Unary: {
            return makeUnaryCall(serviceImpl);
        }
        case Mode.ServerStream: {
            return makeServerStreamCall(serviceImpl);
        }
        case Mode.ClientStream: {
            return makeClientStreamCall(serviceImpl);
        }
        case Mode.BidirectionalStream: {
            return makeBidirectionalStreamCall(serviceImpl);
        }
    }
}

function makeUnaryCall(serviceImpl: any) {
    return (request: RequestData, callback: typeof Callback) => {
        let matadata = parseMds(request.mds || []);
        return serviceImpl[request.methodName](JSON.parse(request.body), matadata, grpcCallback(callback));
    };
}

function makeServerStreamCall(serviceImpl: any) {
    return (request: RequestData, callback: typeof Callback) => {
        let matadata = parseMds(request.mds || []);
        let call = serviceImpl[request.methodName](JSON.parse(request.body), matadata, grpcCallback(callback));
        listenStatusAndCallback(request, call, callback);
        listenDataAndCallback(call, callback);
        return call;
    };
}

function makeClientStreamCall(serviceImpl: any) {
    return (request: RequestData, callback: typeof Callback) => {
        let call: any = callCache[request.id];
        if (call) {
            return call.call;
        }

        let matadata = parseMds(request.mds || []);
        call = serviceImpl[request.methodName](matadata, grpcCallback(callback));
        listenStatusAndCallback(request, call, callback);
        callCache[request.id] = { methodMode: request.methodMode, call: call };
        return call;
    };
}

function makeBidirectionalStreamCall(serviceImpl: any) {
    return (request: RequestData, callback: typeof Callback) => {
        let call: any = callCache[request.id];
        if (call) {
            return call.call;
        }
        let matadata = parseMds(request.mds || []);
        call = serviceImpl[request.methodName](matadata);
        listenStatusAndCallback(request, call, callback);
        listenDataAndCallback(call, callback);
        callCache[request.id] = { methodMode: request.methodMode, call: call };
        return call;
    };
}

function listenDataAndCallback(call: any, callback?: typeof Callback) {
    call.on("data", (data: any) => {
        console.log("data收到数据：", data);
        if (callback) {
            callback(data);
        }
    });
}

function listenStatusAndCallback(request: RequestData, call: any, callback?: typeof Callback) {
    call.on("error", (e: Error) => {
        console.log("发生异常,客户端关闭");
    });
    call.on("status", (status: StatusObject) => {
        console.log("status收到数据：", status);
        if (callback) {
            status.code === 0
                ? callback(null, parseMetadata(status.metadata), undefined, true)
                : callback(null, null, new Error(status.details), true);
        }
        Mode.isWriteStream(request.methodMode) ? call.end() : call.cancel();
        delete callCache[request.id];
    });
}
