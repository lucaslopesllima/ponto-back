import mongoose, { Schema, type Document, type Types } from 'mongoose';

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const ContractType = {
  CLT: 'CLT',
  PJ: 'PJ',
  COOPERADO: 'COOPERADO',
} as const;
export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];

export interface WorkSchedule {
  expectedEntrada1?: string; // "08:00"
  expectedSaida1?: string;
  expectedEntrada2?: string;
  expectedSaida2?: string;
  dailyMinutes?: number; // jornada contratual em minutos
  toleranceLateMinutes?: number;
  /** Se false, finais de semana somem do espelho salvo dias com batidas */
  worksWeekends?: boolean;
  /** Se false, feriados nacionais somem do espelho salvo dias com batidas */
  worksHolidays?: boolean;
}

export interface NotificationPreferences {
  punchReminderEnabled?: boolean;
  punchReminderTimes?: string[]; // "HH:mm" no timezone do usuário
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

const workScheduleSchema = new Schema<WorkSchedule>(
  {
    expectedEntrada1: String,
    expectedSaida1: String,
    expectedEntrada2: String,
    expectedSaida2: String,
    dailyMinutes: { type: Number, default: 480 },
    toleranceLateMinutes: { type: Number, default: 15 },
    worksWeekends: { type: Boolean, default: true },
    worksHolidays: { type: Boolean, default: true },
  },
  { _id: false }
);

const notificationPrefsSchema = new Schema<NotificationPreferences>(
  {
    punchReminderEnabled: { type: Boolean, default: false },
    punchReminderTimes: [{ type: String }],
    lateAlertEnabled: { type: Boolean, default: true },
    adjustmentApprovalEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

userSchema.index({ organizationId: 1 });
userSchema.index({ idGraf: 1 }, { sparse: true });

userSchema.pre('save', function syncIsAdmin(next) {
  if (this.isModified('role') || this.isNew) {
    this.isAdmin = this.role === UserRole.ADMIN;
  }
  next();
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
