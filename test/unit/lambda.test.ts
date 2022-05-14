/**
 * @author WMXPY
 * @namespace Lambda_Verifier
 * @description Verifier
 * @override Unit Test
 */

import { createLambdaResponse } from "@sudoo/lambda";
import { HTTP_RESPONSE_CODE } from "@sudoo/magic";
import { createStrictMapPattern, createStringPattern } from "@sudoo/pattern";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { expect } from "chai";
import * as Chance from "chance";
import { LambdaVerifier } from "../../src";

describe('Given {Verifier} Class', (): void => {

    const chance: Chance.Chance = new Chance('lambda-verify-verifier');

    it('should be able to construct', (): void => {

        const verifier: LambdaVerifier = LambdaVerifier.create();

        expect(verifier).to.be.instanceOf(LambdaVerifier);
    });

    it('should be able to verify header - happy path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: string = chance.string();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setHeaderPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            headers: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.OK,
            body: JSON.stringify({}),
        });
    });

    it('should be able to verify header - sad path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: number = chance.natural();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setHeaderPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            headers: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.BAD_REQUEST,
            body: JSON.stringify(`[Sudoo-Lambda-Verify] Invalid Header, Invalid Type of [${headerKey}]; Should be type of "string"; But got type of "number"`),
        });
    });

    it('should be able to verify params - happy path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: string = chance.string();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setParamPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            pathParameters: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.OK,
            body: JSON.stringify({}),
        });
    });

    it('should be able to verify params - sad path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: number = chance.natural();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setParamPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            pathParameters: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.BAD_REQUEST,
            body: JSON.stringify(`[Sudoo-Lambda-Verify] Invalid Param, Invalid Type of [${headerKey}]; Should be type of "string"; But got type of "number"`),
        });
    });

    it('should be able to verify query - happy path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: string = chance.string();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setQueryPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            queryStringParameters: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.OK,
            body: JSON.stringify({}),
        });
    });

    it('should be able to verify query - sad path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: number = chance.natural();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setQueryPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            queryStringParameters: {
                [headerKey]: headerValue,
            },
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.BAD_REQUEST,
            body: JSON.stringify(`[Sudoo-Lambda-Verify] Invalid Query, Invalid Type of [${headerKey}]; Should be type of "string"; But got type of "number"`),
        });
    });

    it('should be able to verify body - happy path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: string = chance.string();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setBodyPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            body: JSON.stringify({
                [headerKey]: headerValue,
            }),
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.OK,
            body: JSON.stringify({}),
        });
    });

    it('should be able to verify body - sad path', async (): Promise<void> => {

        const headerKey: string = chance.string();
        const headerValue: number = chance.natural();

        const verifier: LambdaVerifier = LambdaVerifier.create();
        verifier.setBodyPattern(createStrictMapPattern({
            [headerKey]: createStringPattern(),
        }));

        const wrapped: APIGatewayProxyHandler = verifier.warpAPIGateWayProxyHandler(() => {
            return createLambdaResponse(HTTP_RESPONSE_CODE.OK);
        });

        const result: APIGatewayProxyResult = await wrapped({
            body: JSON.stringify({
                [headerKey]: headerValue,
            }),
        } as any, null as any, null as any) as APIGatewayProxyResult;

        expect(result).to.be.deep.equal({
            statusCode: HTTP_RESPONSE_CODE.BAD_REQUEST,
            body: JSON.stringify(`[Sudoo-Lambda-Verify] Invalid Body, Invalid Type of [${headerKey}]; Should be type of "string"; But got type of "number"`),
        });
    });
});
