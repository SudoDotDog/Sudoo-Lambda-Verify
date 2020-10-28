/**
 * @author WMXPY
 * @namespace Lambda_Verify
 * @description Verifier
 */

import { createLambdaResponse } from "@sudoo/lambda";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic/http";
import { Pattern } from "@sudoo/pattern";
import { StringedResult, Verifier } from "@sudoo/verify";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context } from "aws-lambda";
import { VerifiedAPIGatewayProxyHandler, VerifyLambdaProxyResultCreator } from "./declare";

export class LambdaVerifier {

    public static create(): LambdaVerifier {

        return new LambdaVerifier();
    }

    private _headerPattern: Pattern | null;
    private _paramPattern: Pattern | null;
    private _bodyPattern: Pattern | null;

    private _overrideNoHeaderLambdaProxyResult: APIGatewayProxyResult | null;
    private _overrideNoParamLambdaProxyResult: APIGatewayProxyResult | null;
    private _overrideNoBodyLambdaProxyResult: APIGatewayProxyResult | null;

    private _overrideInvalidHeaderLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;
    private _overrideInvalidParamLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;
    private _overrideInvalidBodyLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;

    private constructor() {

        this._headerPattern = null;
        this._paramPattern = null;
        this._bodyPattern = null;

        this._overrideNoHeaderLambdaProxyResult = null;
        this._overrideNoParamLambdaProxyResult = null;
        this._overrideNoBodyLambdaProxyResult = null;

        this._overrideInvalidHeaderLambdaProxyResultCreator = null;
        this._overrideInvalidParamLambdaProxyResultCreator = null;
        this._overrideInvalidBodyLambdaProxyResultCreator = null;
    }

    public setHeaderPattern(pattern: Pattern): this {

        this._headerPattern = pattern;
        return this;
    }

    public setParamPattern(pattern: Pattern): this {

        this._paramPattern = pattern;
        return this;
    }

    public setBodyPattern(pattern: Pattern): this {

        this._bodyPattern = pattern;
        return this;
    }

    public setOverrideNoHeaderLambdaProxyResult(result: APIGatewayProxyResult): this {

        this._overrideNoHeaderLambdaProxyResult = result;
        return this;
    }

    public setOverrideNoParamLambdaProxyResult(result: APIGatewayProxyResult): this {

        this._overrideNoParamLambdaProxyResult = result;
        return this;
    }

    public setOverrideNoBodyLambdaProxyResult(result: APIGatewayProxyResult): this {

        this._overrideNoBodyLambdaProxyResult = result;
        return this;
    }

    public setOverrideInvalidHeaderLambdaProxyResultCreator(creator: VerifyLambdaProxyResultCreator): this {

        this._overrideInvalidHeaderLambdaProxyResultCreator = creator;
        return this;
    }

    public setOverrideInvalidParamLambdaProxyResultCreator(creator: VerifyLambdaProxyResultCreator): this {

        this._overrideInvalidParamLambdaProxyResultCreator = creator;
        return this;
    }

    public setOverrideInvalidBodyLambdaProxyResultCreator(creator: VerifyLambdaProxyResultCreator): this {

        this._overrideInvalidBodyLambdaProxyResultCreator = creator;
        return this;
    }

    public warpAPIGateWayProxyHandler(handler: VerifiedAPIGatewayProxyHandler): APIGatewayProxyHandler {

        return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {

            if (event.body === null && this._bodyPattern) {

                return this._getNoBodyLambdaProxyResult();
            }

            try {

                const rawBody: any = event.body === null ? null : JSON.parse(event.body);

                if (this._headerPattern) {

                    const headerVerifier: Verifier = Verifier.create(this._headerPattern);
                    const headerVerifyResult: StringedResult = headerVerifier.conclude(event.headers);

                    if (!headerVerifyResult.succeed) {

                        return this._getInvalidHeaderLambdaProxyResultCreator(headerVerifyResult);
                    }
                }

                if (this._paramPattern) {

                    const paramVerifier: Verifier = Verifier.create(this._paramPattern);
                    const paramVerifyResult: StringedResult = paramVerifier.conclude(event.pathParameters);

                    if (!paramVerifyResult.succeed) {

                        return this._getInvalidParamLambdaProxyResultCreator(paramVerifyResult);
                    }
                }

                if (this._bodyPattern) {

                    const bodyVerifier: Verifier = Verifier.create(this._bodyPattern);
                    const bodyVerifyResult: StringedResult = bodyVerifier.conclude(rawBody);

                    if (!bodyVerifyResult.succeed) {

                        return this._getInvalidBodyLambdaProxyResultCreator(bodyVerifyResult);
                    }
                }

                return await Promise.resolve(handler({
                    ...event,
                    verifiedHeader: event.headers,
                    verifiedParams: event.pathParameters,
                    verifiedBody: rawBody,
                }, context));
            } catch (error) {

                return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, error.message);
            }
        };
    }

    private _getNoHeaderLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoHeaderLambdaProxyResult) {
            return this._overrideNoHeaderLambdaProxyResult;
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, '[Sudoo-Lambda-Verify] Header Undefined');
    }

    private _getNoParamLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoParamLambdaProxyResult) {
            return this._overrideNoParamLambdaProxyResult;
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, '[Sudoo-Lambda-Verify] Param Undefined');
    }

    private _getNoBodyLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoBodyLambdaProxyResult) {
            return this._overrideNoBodyLambdaProxyResult;
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, '[Sudoo-Lambda-Verify] Body Undefined');
    }

    private _getInvalidHeaderLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidHeaderLambdaProxyResultCreator) {

            return this._overrideInvalidHeaderLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {
            return createLambdaResponse(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR, '[Sudoo-Lambda-Verify] Invalid Header, Internal Server Error');
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, `[Sudoo-Lambda-Verify] Invalid Header, ${verifyResult.invalids[0]}`);
    }

    private _getInvalidParamLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidParamLambdaProxyResultCreator) {

            return this._overrideInvalidParamLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {
            return createLambdaResponse(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR, '[Sudoo-Lambda-Verify] Invalid Param, Internal Server Error');
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, `[Sudoo-Lambda-Verify] Invalid Param, ${verifyResult.invalids[0]}`);
    }

    private _getInvalidBodyLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidBodyLambdaProxyResultCreator) {

            return this._overrideInvalidBodyLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {
            return createLambdaResponse(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR, '[Sudoo-Lambda-Verify] Invalid Body, Internal Server Error');
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, `[Sudoo-Lambda-Verify] Invalid Body, ${verifyResult.invalids[0]}`);
    }
}
