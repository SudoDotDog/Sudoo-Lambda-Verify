/**
 * @author WMXPY
 * @namespace Lambda_Verify
 * @description Declare
 */

import { StringedResult } from "@sudoo/verify";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from "aws-lambda";

export type VerifyLambdaProxyResultCreator = (verifyResult: StringedResult) => APIGatewayProxyResult;

export type VerifiedAPIGatewayProxyEvent<
    Header = any,
    Params = any,
    Query = any,
    Body = any,
    > = APIGatewayProxyEvent & {

        readonly verifiedHeader: Header;
        readonly verifiedParams: Params;
        readonly verifiedQuery: Query;
        readonly verifiedBody: Body;
    };

export type VerifiedAPIGatewayProxyHandler = (event: VerifiedAPIGatewayProxyEvent, _context: Context, callback: Callback<APIGatewayProxyResult>) => APIGatewayProxyResult | Promise<APIGatewayProxyResult>;
