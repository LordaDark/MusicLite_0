"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var create_context_1 = require("../../../create-context");
exports.default = create_context_1.publicProcedure
    .input(zod_1.z.object({ name: zod_1.z.string() }))
    .query(function (_a) {
    var input = _a.input;
    return {
        hello: input.name,
        date: new Date(),
    };
});
