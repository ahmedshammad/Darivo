// Small shared boundary copy; full legacy translations stay out of Atlas client payloads.
export const errorCopy = {
  en: {
    errorTitle: 'Something interrupted your visit',
    errorBody: 'Please try again. Your saved collection is still here.',
    retry: 'Try again',
  },
  ar: {
    errorTitle: 'تعذّر إكمال زيارتك',
    errorBody: 'يرجى المحاولة مجدداً. مجموعتك المحفوظة ما زالت هنا.',
    retry: 'حاول مجدداً',
  },
} as const;
