import * as v from 'valibot';

// ==================
// Enums
// ==================

export enum QuestionTypeEnum {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiSelect',
  Checkbox = 'checkbox',
  CheckboxGroup = 'checkboxGroup',
  Date = 'date',
  Rating = 'rating',
  File = 'file',
  Signature = 'signature',
}

export enum ConditionOperatorEnum {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  BETWEEN = 'between',
  MATCHES = 'matches',
}

export enum CombinationTypeEnum {
  AND = 'AND',
  OR = 'OR',
}

// ==================
// Basic Schemas
// ==================

export const QuestionTypeEnumSchema = v.enum(QuestionTypeEnum);
export const ConditionOperatorEnumSchema = v.enum(ConditionOperatorEnum);
export const CombinationTypeEnumSchema = v.enum(CombinationTypeEnum);

// Options for select/multiSelect/checkboxGroup questions
export const OptionSchema = v.object({
  value: v.union([v.string(), v.number()]),
  label: v.string(),
  disabled: v.optional(v.boolean()),
});

export type Option = v.InferInput<typeof OptionSchema>;

// ==================
// Validation Schemas
// ==================

export const TextValidationSchema = v.object({
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  pattern: v.optional(v.string()),
  patternError: v.optional(v.string()),
});

export const NumberValidationSchema = v.object({
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  integer: v.optional(v.boolean()),
  step: v.optional(v.number()),
});

export const DateValidationSchema = v.object({
  minDate: v.optional(v.date()),
  maxDate: v.optional(v.date()),
  disallowedDates: v.optional(v.array(v.date())),
});

export const FileValidationSchema = v.object({
  maxSize: v.optional(v.number()),
  allowedTypes: v.optional(v.array(v.string())),
});

export const MultiSelectValidationSchema = v.object({
  minSelected: v.optional(v.number()),
  maxSelected: v.optional(v.number()),
});

export const CheckboxGroupValidationSchema = v.object({
  minSelected: v.optional(v.number()),
  maxSelected: v.optional(v.number()),
});

export const RatingValidationSchema = v.object({
  min: v.optional(v.number(), 1),
  max: v.optional(v.number(), 5),
});

export const SignatureValidationSchema = v.object({
  minWidth: v.optional(v.number()),
  maxWidth: v.optional(v.number()),
  required: v.optional(v.boolean()),
});

// ==================
// Question Schemas
// ==================

const baseQuestionFields = {
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  required: v.optional(v.boolean(), false),
} as const;

export const QuestionSchema = v.union([
  // Text question
  v.object({
    ...baseQuestionFields,
    type: v.literal('text'),
    validation: v.optional(TextValidationSchema),
    placeholder: v.optional(v.string()),
    defaultValue: v.optional(v.string()),
  }),

  // Number question
  v.object({
    ...baseQuestionFields,
    type: v.literal('number'),
    validation: v.optional(NumberValidationSchema),
    placeholder: v.optional(v.string()),
    defaultValue: v.optional(v.number()),
  }),

  // Select question
  v.object({
    ...baseQuestionFields,
    type: v.literal('select'),
    options: v.array(OptionSchema),
    defaultValue: v.optional(v.string()),
    placeholder: v.optional(v.string()),
  }),

  // MultiSelect question
  v.object({
    ...baseQuestionFields,
    type: v.literal('multiSelect'),
    options: v.array(OptionSchema),
    validation: v.optional(MultiSelectValidationSchema),
    defaultValue: v.optional(v.array(v.string())),
    placeholder: v.optional(v.string()),
  }),

  // Checkbox question
  v.object({
    ...baseQuestionFields,
    type: v.literal('checkbox'),
    defaultValue: v.optional(v.boolean()),
  }),

  // CheckboxGroup question
  v.object({
    ...baseQuestionFields,
    type: v.literal('checkboxGroup'),
    options: v.array(OptionSchema),
    validation: v.optional(CheckboxGroupValidationSchema),
    defaultValue: v.optional(v.array(v.string())),
  }),

  // Date question
  v.object({
    ...baseQuestionFields,
    type: v.literal('date'),
    validation: v.optional(DateValidationSchema),
    defaultValue: v.optional(v.date()),
    placeholder: v.optional(v.string()),
  }),

  // Rating question
  v.object({
    ...baseQuestionFields,
    type: v.literal('rating'),
    validation: v.optional(RatingValidationSchema),
    defaultValue: v.optional(v.number()),
  }),

  // File question
  v.object({
    ...baseQuestionFields,
    type: v.literal('file'),
    validation: v.optional(FileValidationSchema),
    multiple: v.optional(v.boolean(), false),
  }),

  // Signature question
  v.object({
    ...baseQuestionFields,
    type: v.literal('signature'),
    validation: v.optional(SignatureValidationSchema),
  })
]);

export type Question = v.InferInput<typeof QuestionSchema>;

// ==================
// Response Types
// ==================

export const QuestionResponseSchema = v.object({
  questionId: v.string(),
  value: v.union([
    v.string(),
    v.number(),
    v.boolean(),
    v.date(),
    v.array(v.union([v.string(), v.number(), v.boolean(), v.date()])),
    v.null()
  ]),
  timestamp: v.date(),
  isValid: v.boolean(),
  validationErrors: v.optional(v.array(v.string())),
});

export type QuestionResponse = v.InferInput<typeof QuestionResponseSchema>;

// Helper type to extract the value type from a question
type QuestionValue<T extends Question> = T extends { type: 'text' }
  ? string
  : T extends { type: 'number' }
  ? number
  : T extends { type: 'select' }
  ? string
  : T extends { type: 'multiSelect' }
  ? string[]
  : T extends { type: 'checkbox' }
  ? boolean
  : T extends { type: 'checkboxGroup' }
  ? string[]
  : T extends { type: 'date' }
  ? Date
  : T extends { type: 'rating' }
  ? number
  : T extends { type: 'file' }
  ? File | File[]
  : T extends { type: 'signature' }
  ? string
  : never;

// ==================
// Transition & Node Types
// ==================

export const ConditionSchema = v.object({
  questionId: v.string(),
  operator: ConditionOperatorEnumSchema,
  value: v.union([
    v.string(),
    v.number(),
    v.boolean(),
    v.date(),
    v.array(v.union([v.string(), v.number(), v.boolean(), v.date()])),
  ]),
  additionalValue: v.optional(v.union([v.string(), v.number(), v.date()])),
});

export const TransitionSchema = v.object({
  conditions: v.array(ConditionSchema),
  nextNodeId: v.string(),
  combinationType: v.optional(CombinationTypeEnumSchema, CombinationTypeEnum.AND),
});

export type Transition = v.InferInput<typeof TransitionSchema>;

export const NodeSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  questions: v.array(QuestionSchema),
  transitions: v.array(TransitionSchema),
  isStart: v.optional(v.boolean()),
  isEnd: v.optional(v.boolean()),
  metadata: v.optional(v.record(v.string(), v.unknown())),
});

export type Node = v.InferInput<typeof NodeSchema>;

// ==================
// Quiz Schema
// ==================

export const QuizSchema = v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  version: v.string(),
  nodes: v.array(NodeSchema),
  settings: v.optional(v.object({
    allowBackTracking: v.optional(v.boolean()),
    showProgressBar: v.optional(v.boolean()),
    shuffleQuestions: v.optional(v.boolean()),
    theme: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
  })),
  metadata: v.optional(v.record(v.string(), v.unknown())),
});

export type Quiz = v.InferInput<typeof QuizSchema>;

// ==================
// Quiz State
// ==================

export const QuizStateSchema = v.object({
  quizId: v.string(),
  currentNodeId: v.string(),
  visitedNodes: v.array(v.string()),
  responses: v.record(v.string(), QuestionResponseSchema),
  startTime: v.date(),
  lastUpdated: v.date(),
  completed: v.boolean(),
  endNodeId: v.optional(v.string()),
});

export type QuizState = v.InferInput<typeof QuizStateSchema>;

// ==================
// Helper Functions
// ==================

export const validateQuiz = (quiz: Quiz): boolean => {
  try {
    v.parse(QuizSchema, quiz);
    return true;
  } catch (error) {
    console.error('Quiz validation failed:', error);
    return false;
  }
};

export const createResponse = <T extends Question>(
  question: T,
  value: QuestionValue<T>,
  isValid: boolean = true,
  validationErrors: string[] = []
): QuestionResponse => ({
  questionId: question.id,
  value: value as any, // Type assertion needed due to QuestionValue complexity
  timestamp: new Date(),
  isValid,
  validationErrors,
});

export const evaluateTransition = (
  transition: Transition,
  responses: Record<string, QuestionResponse>
): boolean => {
  const evaluateCondition = (condition: v.InferInput<typeof ConditionSchema>): boolean => {
    const response = responses[condition.questionId];
    if (!response) return false;

    const compareValues = (a: any, b: any): boolean => {
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      }
      return a === b;
    };

    switch (condition.operator) {
      case ConditionOperatorEnum.EQUALS:
        return compareValues(response.value, condition.value);
      case ConditionOperatorEnum.NOT_EQUALS:
        return !compareValues(response.value, condition.value);
      case ConditionOperatorEnum.CONTAINS:
        return Array.isArray(response.value) &&
          response.value.some(v => compareValues(v, condition.value));
      case ConditionOperatorEnum.NOT_CONTAINS:
        return Array.isArray(response.value) &&
          !response.value.some(v => compareValues(v, condition.value));
      case ConditionOperatorEnum.GREATER_THAN:
        return (
          response.value instanceof Date && condition.value instanceof Date
            ? response.value > condition.value
            : Number(response.value) > Number(condition.value)
        );
      case ConditionOperatorEnum.LESS_THAN:
        return (
          response.value instanceof Date && condition.value instanceof Date
            ? response.value < condition.value
            : Number(response.value) < Number(condition.value)
        );
      case ConditionOperatorEnum.BETWEEN:
        if (
          typeof condition.value === 'number' &&
          typeof condition.additionalValue === 'number'
        ) {
          return (
            Number(response.value) > condition.value &&
            Number(response.value) < condition.additionalValue
          );
        }
        if (
          condition.value instanceof Date &&
          condition.additionalValue instanceof Date
        ) {
          return (
            response.value instanceof Date &&
            response.value > condition.value &&
            response.value < condition.additionalValue
          );
        }
        return false;
      case ConditionOperatorEnum.MATCHES:
        return typeof response.value === 'string' &&
          new RegExp(condition.value as string).test(response.value);
      default:
        return false;
    }
  };

  return transition.combinationType === CombinationTypeEnum.OR
    ? transition.conditions.some(evaluateCondition)
    : transition.conditions.every(evaluateCondition);
};