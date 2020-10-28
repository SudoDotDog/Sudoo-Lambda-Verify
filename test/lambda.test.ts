/**
 * @author WMXPY
 * @namespace Lambda_Verifier
 * @description Verifier
 * @override Unit Test
 */

import { expect } from "chai";
import * as Chance from "chance";
import { LambdaVerifier } from "../src";

describe('Given {Verifier} Class', (): void => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const chance: Chance.Chance = new Chance('lambda-verify-verifier');

    it('should be able to construct', (): void => {

        const verifier: LambdaVerifier = LambdaVerifier.create();

        expect(verifier).to.be.instanceOf(verifier);
    });
});
