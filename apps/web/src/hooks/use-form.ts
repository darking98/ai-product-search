import { FormProvider, useForm as RHCUseForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRHForm = <T extends z.ZodTypeAny>(schema: T) => {
  const methods = RHCUseForm<
    z.input<T> extends object ? z.input<T> : Record<string, unknown>,
    any,
    z.output<T>
  >({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: standardSchemaResolver(schema as unknown as any)
  })

  return { ...methods }
}

export { FormProvider }
