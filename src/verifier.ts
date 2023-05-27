/**
 * @author WMXPY
 * @namespace Lambda_Verify
 * @description Verifier
 */

import { LambdaResponseManager } from "@sudoo/lambda";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic/http";
import { Pattern } from "@sudoo/pattern";
import { StringedResult, Verifier } from "@sudoo/verify";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback, Context } from "aws-lambda";
import { VerifiedAPIGatewayProxyHandler, VerifyLambdaProxyResultCreator } from "./declare";
import { extractAndParseRawBody } from "./util";

export type LambdaVerifierMixin = (verifier: LambdaVerifier) => void;

export class LambdaVerifier {

    public static create(
        lambdaManager: LambdaResponseManager = LambdaResponseManager.create(),
    ): LambdaVerifier {

        return new LambdaVerifier(lambdaManager);
    }

    private readonly _lambdaManager: LambdaResponseManager;

    private _allowEmptyHeader: boolean;
    private _allowEmptyParam: boolean;
    private _allowEmptyQuery: boolean;
    private _allowEmptyBody: boolean;

    private _headerPattern: Pattern | null;
    private _paramPattern: Pattern | null;
    private _queryPattern: Pattern | null;
    private _bodyPattern: Pattern | null;

    private _overrideNoHeaderLambdaProxyResult: APIGatewayProxyResult | null;
    private _overrideNoParamLambdaProxyResult: APIGatewayProxyResult | null;
    private _overrideNoQueryLambdaProxyResult: APIGatewayProxyResult | null;
    private _overrideNoBodyLambdaProxyResult: APIGatewayProxyResult | null;

    private _overrideInvalidHeaderLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;
    private _overrideInvalidParamLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;
    private _overrideInvalidQueryLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;
    private _overrideInvalidBodyLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;

    private constructor(lambdaManager: LambdaResponseManager) {

        this._lambdaManager = lambdaManager;

        this._allowEmptyHeader = false;
        this._allowEmptyParam = false;
        this._allowEmptyQuery = false;
        this._allowEmptyBody = false;

        this._headerPattern = null;
        this._paramPattern = null;
        this._queryPattern = null;
        this._bodyPattern = null;

        this._overrideNoHeaderLambdaProxyResult = null;
        this._overrideNoParamLambdaProxyResult = null;
        this._overrideNoQueryLambdaProxyResult = null;
        this._overrideNoBodyLambdaProxyResult = null;

        this._overrideInvalidHeaderLambdaProxyResultCreator = null;
        this._overrideInvalidParamLambdaProxyResultCreator = null;
        this._overrideInvalidQueryLambdaProxyResultCreator = null;
        this._overrideInvalidBodyLambdaProxyResultCreator = null;
    }

    public use(mixin: LambdaVerifierMixin): this {

        mixin(this);
        return this;
    }

    public setAllowEmptyHeader(allow: boolean): this {

        this._allowEmptyHeader = allow;
        return this;
    }

    public setAllowEmptyParam(allow: boolean): this {

        this._allowEmptyParam = allow;
        return this;
    }


    public setAllowEmptyQuery(allow: boolean): this {

        this._allowEmptyQuery = allow;
        return this;
    }

    public setAllowEmptyBody(allow: boolean): this {

        this._allowEmptyBody = allow;
        return this;
    }

    public setHeaderPattern(pattern: Pattern): this {

        this._headerPattern = pattern;
        return this;
    }

    public setParamPattern(pattern: Pattern): this {

        this._paramPattern = pattern;
        return this;
    }

    public setQueryPattern(pattern: Pattern): this {

        this._queryPattern = pattern;
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

    public setOverrideNoQueryLambdaProxyResult(result: APIGatewayProxyResult): this {

        this._overrideNoQueryLambdaProxyResult = result;
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

    public setOverrideInvalidQueryLambdaProxyResultCreator(creator: VerifyLambdaProxyResultCreator): this {

        this._overrideInvalidQueryLambdaProxyResultCreator = creator;
        return this;
    }

    public setOverrideInvalidBodyLambdaProxyResultCreator(creator: VerifyLambdaProxyResultCreator): this {

        this._overrideInvalidBodyLambdaProxyResultCreator = creator;
        return this;
    }

    public warpAPIGateWayProxyHandler(handler: VerifiedAPIGatewayProxyHandler): APIGatewayProxyHandler {

        return async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<APIGatewayProxyResult> => {

            if (!this._allowEmptyHeader && !Boolean(event.headers) && this._headerPattern) {

                return this._getNoHeaderLambdaProxyResult();
            }

            if (!this._allowEmptyParam && !Boolean(event.queryStringParameters) && this._paramPattern) {

                return this._getNoParamLambdaProxyResult();
            }

            if (!this._allowEmptyQuery && !Boolean(event.pathParameters) && this._queryPattern) {

                return this._getNoQueryLambdaProxyResult();
            }

            if (!this._allowEmptyBody && !Boolean(event.body) && this._bodyPattern) {

                return this._getNoBodyLambdaProxyResult();
            }

            try {

                const rawBody: any = extractAndParseRawBody(event);

                if (this._headerPattern) {

                    const headerVerifier: Verifier = Verifier.create(this._headerPattern);
                    const headerVerifyResult: StringedResult = headerVerifier.conclude(event.headers);

                    if (!headerVerifyResult.succeed) {

                        return this._getInvalidHeaderLambdaProxyResultCreator(headerVerifyResult);
                    }
                }

                if (this._paramPattern) {

                    const paramVerifier: Verifier = Verifier.create(this._paramPattern);
                    const paramVerifyResult: StringedResult = paramVerifier.conclude(event.queryStringParameters);

                    if (!paramVerifyResult.succeed) {

                        return this._getInvalidParamLambdaProxyResultCreator(paramVerifyResult);
                    }
                }

                if (this._queryPattern) {

                    const queryVerifier: Verifier = Verifier.create(this._queryPattern);
                    const queryVerifyResult: StringedResult = queryVerifier.conclude(event.pathParameters);

                    if (!queryVerifyResult.succeed) {

                        return this._getInvalidQueryLambdaProxyResultCreator(queryVerifyResult);
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
                    verifiedHeader: event.headers ?? {},
                    verifiedParams: event.queryStringParameters ?? {},
                    verifiedQuery: event.pathParameters ?? {},
                    verifiedBody: rawBody ?? {},
                }, context, callback));
            } catch (error) {

                const assertedError: any = error;

                return this._lambdaManager
                    .createBuilder()
                    .addBody("reason", assertedError.message)
                    .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
            }
        };
    }

    private _getNoHeaderLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoHeaderLambdaProxyResult) {
            return this._overrideNoHeaderLambdaProxyResult;
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", "[Sudoo-Lambda-Verify] Header Undefined")
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getNoParamLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoParamLambdaProxyResult) {
            return this._overrideNoParamLambdaProxyResult;
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", "[Sudoo-Lambda-Verify] Param Undefined")
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getNoQueryLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoQueryLambdaProxyResult) {
            return this._overrideNoQueryLambdaProxyResult;
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", "[Sudoo-Lambda-Verify] Query Undefined")
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getNoBodyLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoBodyLambdaProxyResult) {
            return this._overrideNoBodyLambdaProxyResult;
        }


        return this._lambdaManager
            .createBuilder()
            .addBody("reason", "[Sudoo-Lambda-Verify] Body Undefined")
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getInvalidHeaderLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidHeaderLambdaProxyResultCreator) {

            return this._overrideInvalidHeaderLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {

            return this._lambdaManager
                .createBuilder()
                .addBody("reason", "[Sudoo-Lambda-Verify] Invalid Header, Internal Server Error")
                .build(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", `[Sudoo-Lambda-Verify] Invalid Header, ${verifyResult.invalids[0]}`)
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getInvalidParamLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidParamLambdaProxyResultCreator) {

            return this._overrideInvalidParamLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {

            return this._lambdaManager
                .createBuilder()
                .addBody("reason", "[Sudoo-Lambda-Verify] Invalid Param, Internal Server Error")
                .build(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", `[Sudoo-Lambda-Verify] Invalid Param, ${verifyResult.invalids[0]}`)
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getInvalidQueryLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidQueryLambdaProxyResultCreator) {

            return this._overrideInvalidQueryLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {

            return this._lambdaManager
                .createBuilder()
                .addBody("reason", "[Sudoo-Lambda-Verify] Invalid Query, Internal Server Error")
                .build(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", `[Sudoo-Lambda-Verify] Invalid Query, ${verifyResult.invalids[0]}`)
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }

    private _getInvalidBodyLambdaProxyResultCreator(verifyResult: StringedResult): APIGatewayProxyResult {

        if (this._overrideInvalidBodyLambdaProxyResultCreator) {

            return this._overrideInvalidBodyLambdaProxyResultCreator(verifyResult);
        }

        if (!verifyResult.invalids[0]) {

            return this._lambdaManager
                .createBuilder()
                .addBody("reason", "[Sudoo-Lambda-Verify] Invalid Body, Internal Server Error")
                .build(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR);
        }

        return this._lambdaManager
            .createBuilder()
            .addBody("reason", `[Sudoo-Lambda-Verify] Invalid Body, ${verifyResult.invalids[0]}`)
            .build(HTTP_RESPONSE_CODE.BAD_REQUEST);
    }
}
