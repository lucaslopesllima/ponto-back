import mongoose, { type Document, type Types } from 'mongoose';
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly USER: "USER";
};
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
export declare const ContractType: {
    readonly CLT: "CLT";
    readonly PJ: "PJ";
    readonly COOPERADO: "COOPERADO";
};
export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];
export interface WorkSchedule {
    expectedEntrada1?: string;
    expectedSaida1?: string;
    expectedEntrada2?: string;
    expectedSaida2?: string;
    dailyMinutes?: number;
    toleranceLateMinutes?: number;
    /** Se false, finais de semana somem do espelho salvo dias com batidas */
    worksWeekends?: boolean;
    /** Se false, feriados nacionais somem do espelho salvo dias com batidas */
    worksHolidays?: boolean;
}
export interface NotificationPreferences {
    punchReminderEnabled?: boolean;
    punchReminderTimes?: string[];
    lateAlertEnabled?: boolean;
    adjustmentApprovalEnabled?: boolean;
}
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    /** Hash argon2 do segredo de login por integração (opcional) */
    hashLogin?: string | null;
    /** Espelha permissão de admin (sincronizado com `role === ADMIN`) */
    isAdmin: boolean;
    role: UserRoleType;
    /** BCP 47 (ex.: pt-BR, en-US); documentos antigos podem omitir (usa pt-BR na API) */
    locale?: string;
    timezone: string;
    contractType?: ContractTypeValue;
    /** Valor hora (R$); usado em PJ e Cooperado */
    hourlyRateBrl?: number | null;
    workSchedule: WorkSchedule;
    notificationPreferences: NotificationPreferences;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    organizationId?: Types.ObjectId;
    pushSubscription?: object | null;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=user.model.d.ts.map