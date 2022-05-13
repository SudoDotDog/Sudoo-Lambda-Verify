/**
 * @author WMXPY
 * @namespace Lambda_Verify
 * @description Util
 */

import { APIGatewayProxyEvent } from "aws-lambda";

export const extractAndParseRawBody = (event: APIGatewayProxyEvent): any => {

    if (typeof event.body !== 'string') {
        return null;
    }

    if (event.isBase64Encoded) {

        const decoded: string = Buffer.from(event.body, 'base64').toString();
        return JSON.parse(decoded);
    }

    return JSON.parse(event.body);
};
