/**
 * @author WMXPY
 * @namespace Lambda_Verify
 * @description Declare
 */

import { StringedResult } from "@sudoo/verify";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export type VerifyLambdaProxyResultCreator = (verifyResult: StringedResult) => APIGatewayProxyResult;

export type VerifiedAPIGatewayProxyEvent = APIGatewayProxyEvent & {

    readonly verifiedHeader: any;
    readonly verifiedParams: any;
    readonly verifiedBody: any;
};

export type VerifiedAPIGatewayProxyHandler = (event: VerifiedAPIGatewayProxyEvent, _context: Context) => APIGatewayProxyResult | Promise<APIGatewayProxyResult>;
