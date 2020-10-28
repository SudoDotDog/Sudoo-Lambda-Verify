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

    private _bodyPattern: Pattern | null;

    private _overrideNoBodyLambdaProxyResult: APIGatewayProxyResult | null;

    private _overrideInvalidBodyLambdaProxyResultCreator: VerifyLambdaProxyResultCreator | null;

    private constructor() {

        this._bodyPattern = null;

        this._overrideNoBodyLambdaProxyResult = null;

        this._overrideInvalidBodyLambdaProxyResultCreator = null;
    }

    public setBodyPattern(pattern: Pattern): this {

        this._bodyPattern = pattern;
        return this;
    }

    public setOverrideNoBodyLambdaProxyResult(result: APIGatewayProxyResult): this {

        this._overrideNoBodyLambdaProxyResult = result;
        return this;
    }

    public warpAPIGateWayProxyHandler(handler: VerifiedAPIGatewayProxyHandler): APIGatewayProxyHandler {

        return async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {

            if (event.body === null) {

                return this._getNoBodyLambdaProxyResult();
            }

            try {

                const rawBody: any = JSON.parse(event.body);

                if (this._bodyPattern) {

                    const bodyVerifier: Verifier = Verifier.create(this._bodyPattern);
                    const bodyVerifyResult: StringedResult = bodyVerifier.conclude(rawBody);

                    if (!bodyVerifyResult.succeed) {

                        return this._getInvalidBodyLambdaProxyResultCreator(bodyVerifyResult);
                    }
                }

                return await handler({
                    ...event,
                    verifiedHeader: '',
                    verifiedParams: '',
                    verifiedBody: rawBody,
                }, _context);
            } catch (error) {

                return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, error.message);
            }
        };
    }

    private _getNoBodyLambdaProxyResult(): APIGatewayProxyResult {

        if (this._overrideNoBodyLambdaProxyResult) {
            return this._overrideNoBodyLambdaProxyResult;
        }

        return createLambdaResponse(HTTP_RESPONSE_CODE.BAD_REQUEST, '[Sudoo-Lambda-Verify] Body Undefined');
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
