"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.almostEqual = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function almostEqualAssertion(expected, actual, message) {
    this.assert(expected.plus(new bignumber_js_1.default(1)).eq(actual) ||
        expected.plus(new bignumber_js_1.default(2)).eq(actual) ||
        actual.plus(new bignumber_js_1.default(1)).eq(expected) ||
        actual.plus(new bignumber_js_1.default(2)).eq(expected) ||
        expected.eq(actual), `${message} expected #{act} to be almost equal #{exp}`, `${message} expected #{act} to be different from #{exp}`, expected.toString(), actual.toString());
}
function almostEqual() {
    return function (chai, utils) {
        chai.Assertion.overwriteMethod('almostEqual', function (original) {
            return function (value, message) {
                if (utils.flag(this, 'bignumber')) {
                    var expected = new bignumber_js_1.default(value);
                    var actual = new bignumber_js_1.default(this._obj);
                    almostEqualAssertion.apply(this, [expected, actual, message]);
                }
                else {
                    original.apply(this, arguments);
                }
            };
        });
    };
}
exports.almostEqual = almostEqual;
//# sourceMappingURL=almost-equal.js.map