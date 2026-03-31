import mongoose, { Schema } from 'mongoose';
export const UserRole = {
    ADMIN: 'ADMIN',
    USER: 'USER',
};
export const ContractType = {
    CLT: 'CLT',
    PJ: 'PJ',
    COOPERADO: 'COOPERADO',
};
const workScheduleSchema = new Schema({
    expectedEntrada1: String,
    expectedSaida1: String,
    expectedEntrada2: String,
    expectedSaida2: String,
    dailyMinutes: { type: Number, default: 480 },
    toleranceLateMinutes: { type: Number, default: 15 },
    worksWeekends: { type: Boolean, default: true },
    worksHolidays: { type: Boolean, default: true },
}, { _id: false });
const notificationPrefsSchema = new Schema({
    punchReminderEnabled: { type: Boolean, default: false },
    punchReminderTimes: [{ type: String }],
    lateAlertEnabled: { type: Boolean, default: true },
    adjustmentApprovalEnabled: { type: Boolean, default: true },
}, { _id: false });
const userSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 320,
    },
    passwordHash: { type: String, required: true },
    hashLogin: { type: String, default: null, select: false },
    isAdmin: { type: Boolean, default: false },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
    },
    locale: { type: String, default: 'pt-BR', maxlength: 32 },
    timezone: { type: String, default: 'America/Sao_Paulo' },
    contractType: {
        type: String,
        enum: Object.values(ContractType),
        default: ContractType.CLT,
    },
    hourlyRateBrl: { type: Number, default: null, min: 0 },
    workSchedule: { type: workScheduleSchema, default: () => ({}) },
    notificationPreferences: {
        type: notificationPrefsSchema,
        default: () => ({}),
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    organizationId: { type: Schema.Types.ObjectId },
    pushSubscription: { type: Schema.Types.Mixed, default: null },
    idGraf: { type: String, default: null, maxlength: 256 },
}, { timestamps: true });
userSchema.index({ organizationId: 1 });
userSchema.index({ idGraf: 1 }, { sparse: true });
userSchema.pre('save', function syncIsAdmin(next) {
    if (this.isModified('role') || this.isNew) {
        this.isAdmin = this.role === UserRole.ADMIN;
    }
    next();
});
export const UserModel = mongoose.model('User', userSchema);
//# sourceMappingURL=user.model.js.map