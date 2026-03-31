import { z } from 'zod';
import ExcelJS from 'exceljs';
import { authenticate } from '../../plugins/auth.plugin.js';
import { getMirrorMonth } from '../../services/time-entry.service.js';
import { adminCanActOnUserByIdGraf, findById } from '../../services/user.service.js';
import { UserRole } from '../../models/user.model.js';
const querySchema = z.object({
    year: z.coerce.number().min(2000).max(2100),
    month: z.coerce.number().min(1).max(12),
    userId: z.string().optional(),
});
function toCsv(rows) {
    const maxP = Math.max(0, ...rows.map((r) => r.times.length));
    const punchHeaders = Array.from({ length: maxP }, (_, i) => `P${i + 1}`);
    const header = ['Data', ...punchHeaders, 'Total (min)', 'Em aberto', 'Status'].join(',');
    const lines = rows.map((r) => {
        const cells = [r.date];
        for (let i = 0; i < maxP; i++) {
            cells.push(r.times[i] ?? '');
        }
        cells.push(String(r.totalMinutes));
        cells.push(r.dayOpen ? 'sim' : 'não');
        cells.push(r.status);
        return cells.join(',');
    });
    return [header, ...lines].join('\n');
}
async function toXlsx(rows) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Espelho');
    const maxP = Math.max(0, ...rows.map((r) => r.times.length));
    const punchHeaders = Array.from({ length: maxP }, (_, i) => `P${i + 1}`);
    const columns = ['Data', ...punchHeaders, 'Total (min)', 'Em aberto', 'Status'];
    ws.addRow(columns);
    for (const r of rows) {
        const rowVals = [r.date];
        for (let i = 0; i < maxP; i++)
            rowVals.push(r.times[i] ?? '');
        rowVals.push(r.totalMinutes);
        rowVals.push(r.dayOpen ? 'sim' : 'não');
        rowVals.push(r.status);
        ws.addRow(rowVals);
    }
    const header = ws.getRow(1);
    header.font = { bold: true };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.columns.forEach((c) => {
        c.width = 14;
    });
    const bytes = await wb.xlsx.writeBuffer();
    return Buffer.from(bytes);
}
export async function reportsRoutes(app) {
    app.get('/reports/csv', { preHandler: [authenticate] }, async (request, reply) => {
        const q = querySchema.parse(request.query);
        const user = await findById(request.userId);
        if (!user)
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        const rows = await getMirrorMonth(user, q.year, q.month);
        const csv = toCsv(rows);
        reply.header('Content-Type', 'text/csv; charset=utf-8');
        reply.header('Content-Disposition', `attachment; filename="espelho-${q.year}-${String(q.month).padStart(2, '0')}.csv"`);
        return reply.send(csv);
    });
    app.get('/reports/xlsx', { preHandler: [authenticate] }, async (request, reply) => {
        const q = querySchema.parse(request.query);
        const user = await findById(request.userId);
        if (!user)
            return reply.status(401).send({ error: 'UNAUTHORIZED' });
        let reportUser = user;
        if (q.userId && q.userId !== String(user._id)) {
            if (user.role !== UserRole.ADMIN) {
                return reply.status(403).send({ error: 'FORBIDDEN' });
            }
            const target = await findById(q.userId);
            if (!adminCanActOnUserByIdGraf(user, target)) {
                return reply.status(403).send({ error: 'FORBIDDEN' });
            }
            if (!target)
                return reply.status(404).send({ error: 'NOT_FOUND' });
            reportUser = target;
        }
        const rows = await getMirrorMonth(reportUser, q.year, q.month);
        const xlsx = await toXlsx(rows);
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('Content-Disposition', `attachment; filename="espelho-${q.year}-${String(q.month).padStart(2, '0')}-${reportUser.name.replace(/\s+/g, '-').toLowerCase()}.xlsx"`);
        return reply.send(xlsx);
    });
}
//# sourceMappingURL=reports.routes.js.map