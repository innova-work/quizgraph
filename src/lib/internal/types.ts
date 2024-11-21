import * as v from 'valibot';

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

// Basic types for question components
export const QuestionTypeEnumSchema = v.enum(QuestionTypeEnum, "Invalid question type");

// Options for select/multiSelect/checkboxGroup questions
export const OptionSchema = v.object({
  value: v.union([v.string(), v.number()]),
  label: v.string(),
  disabled: v.optional(v.boolean()),
});

export type Option = v.InferInput<typeof OptionSchema>;

// Type-specific validation rules
export const TextValidationSchema = v.object({
  minLength: v.optional(v.number()),
  maxLength: v.optional(v.number()),
  pattern: v.optional(v.string()), // regex pattern
  patternError: v.optional(v.string()), // custom error message for pattern
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
  min: v.optional(v.number()),
  max: v.optional(v.number(), 5),
});

export const SignatureValidationSchema = v.object({
  minWidth: v.optional(v.number()),
  maxWidth: v.optional(v.number()),
  required: v.optional(v.boolean()),
});

// Base question fields that are common to all question types
const baseQuestionFields = {
  id: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  required: v.optional(v.boolean(), false),
} as const;

// Question schema with type-specific validation
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

// Condition operator for transitions
export const ConditionOperatorEnumSchema = v.enum(ConditionOperatorEnum, "Not a valid operation");

export type ConditionOperator = v.InferInput<typeof ConditionOperatorEnumSchema>;

// Condition schema
export const ConditionSchema = v.object({
  questionId: v.string(),
  operator: ConditionOperatorEnumSchema,
  value: v.union([
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.union([v.string(), v.number(), v.boolean()])),
  ]),
  additionalValue: v.optional(v.union([v.string(), v.number()])),
});

export enum CombinationTypeEnum {
  AND = 'AND',
  OR = 'OR',
}

// Transition schema - defines where to go next based on conditions
export const TransitionSchema = v.object({
  conditions: v.array(ConditionSchema),
  nextNodeId: v.string(),
  combinationType: v.optional(v.enum(CombinationTypeEnum), CombinationTypeEnum.AND),
});

export type Transition = v.InferInput<typeof TransitionSchema>;

// Node schema
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

// Quiz schema
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

// Get the value schema based on question type
const getValueSchemaForQuestion = (question: Question) => {
  switch (question.type) {
    case 'text':
      return v.string();
    case 'number':
      return v.number();
    case 'select':
      return v.string();
    case 'multiSelect':
      return v.array(v.string());
    case 'checkbox':
      return v.boolean();
    case 'checkboxGroup':
      return v.array(v.string());
    case 'date':
      return v.date();
    case 'rating':
      return v.number();
    case 'file':
      return question.multiple ? v.array(v.unknown()) : v.unknown();
    case 'signature':
      return v.string();
    default:
      throw new Error(`Unknown question type: ${question.type}`);
  }
};

// Create a response schema for a specific question
const createQuestionResponseSchema = (question: Question) => {
  return v.object({
    questionId: v.string(),
    value: getValueSchemaForQuestion(question),
    timestamp: v.date(),
    isValid: v.boolean(),
    validationErrors: v.optional(v.array(v.string())),
  });
};

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


// Generic QuestionResponse schema
// Generic Response type
export type QuestionResponse<T extends Question> = {
  questionId: string;
  value: QuestionValue<T>;
  timestamp: Date;
  isValid: boolean;
  validationErrors?: string[];
};

// Type guards for question types
const isTextQuestion = (question: Question): question is Extract<Question, { type: 'text' }> =>
  question.type === 'text';

const isNumberQuestion = (question: Question): question is Extract<Question, { type: 'number' }> =>
  question.type === 'number';

const isSelectQuestion = (question: Question): question is Extract<Question, { type: 'select' }> =>
  question.type === 'select';

const isMultiSelectQuestion = (question: Question): question is Extract<Question, { type: 'multiSelect' }> =>
  question.type === 'multiSelect';

const isCheckboxQuestion = (question: Question): question is Extract<Question, { type: 'checkbox' }> =>
  question.type === 'checkbox';

const isCheckboxGroupQuestion = (question: Question): question is Extract<Question, { type: 'checkboxGroup' }> =>
  question.type === 'checkboxGroup';

const isDateQuestion = (question: Question): question is Extract<Question, { type: 'date' }> =>
  question.type === 'date';

const isRatingQuestion = (question: Question): question is Extract<Question, { type: 'rating' }> =>
  question.type === 'rating';

const isFileQuestion = (question: Question): question is Extract<Question, { type: 'file' }> =>
  question.type === 'file';

const isSignatureQuestion = (question: Question): question is Extract<Question, { type: 'signature' }> =>
  question.type === 'signature';

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

// Helper function to validate a quiz structure
export const validateQuiz = (quiz: Quiz): boolean => {
  try {
    v.parse(QuizSchema, quiz);
    return true;
  } catch (error) {
    console.error('Quiz validation failed:', error);
    return false;
  }
};

// Updated evaluate transition to use type guards
export const evaluateTransition = (
  transition: Transition,
  responses: Record<string, QuestionResponse<Question>>
): boolean => {
  const evaluateCondition = (condition: v.InferInput<typeof ConditionSchema>): boolean => {
    const response = responses[condition.questionId];
    if (!response) return false;

    switch (condition.operator) {
      case ConditionOperatorEnum.EQUALS:
        return response.value === condition.value;
      case ConditionOperatorEnum.NOT_EQUALS:
        return response.value !== condition.value;
      case ConditionOperatorEnum.CONTAINS:
        return Array.isArray(response.value) &&
          response.value.includes(condition.value);
      case ConditionOperatorEnum.NOT_CONTAINS:
        return Array.isArray(response.value) &&
          !response.value.includes(condition.value);
      case ConditionOperatorEnum.GREATER_THAN:
        return typeof response.value === 'number' &&
          response.value > (condition.value as number);
      case ConditionOperatorEnum.LESS_THAN:
        return typeof response.value === 'number' &&
          response.value < (condition.value as number);
      case ConditionOperatorEnum.BETWEEN:
        return typeof response.value === 'number' &&
          response.value > (condition.value as number) &&
          response.value < (condition.additionalValue as number ?? Infinity);
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

// Helper to create a type-safe response
export const createResponse = <T extends Question>(
  question: T,
  value: QuestionValue<T>,
  isValid: boolean = true,
  validationErrors: string[] = []
): QuestionResponse<T> => ({
  questionId: question.id,
  value,
  timestamp: new Date(),
  isValid,
  validationErrors,
});