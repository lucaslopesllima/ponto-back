import { describe, expect, it } from 'vitest';
import { nextExpectedKind } from './time-entry.service.js';
import { PunchKind } from '../models/time-entry.model.js';
describe('time-entry alternância', () => {
    it('primeira batida do dia é entrada', () => {
        expect(nextExpectedKind([])).toBe(PunchKind.ENTRADA);
    });
    it('após entrada vem saída', () => {
        expect(nextExpectedKind([{ kind: PunchKind.ENTRADA }])).toBe(PunchKind.SAIDA);
    });
    it('após par completo volta entrada', () => {
        expect(nextExpectedKind([
            { kind: PunchKind.ENTRADA },
            { kind: PunchKind.SAIDA },
        ])).toBe(PunchKind.ENTRADA);
    });
    it('após três batidas a próxima é saída', () => {
        expect(nextExpectedKind([
            { kind: PunchKind.ENTRADA },
            { kind: PunchKind.SAIDA },
            { kind: PunchKind.ENTRADA },
        ])).toBe(PunchKind.SAIDA);
    });
});
//# sourceMappingURL=time-entry.service.test.js.map