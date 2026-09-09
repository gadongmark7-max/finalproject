"use client"

import { useForm, type UseFormProps, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"


export function useZodForm<TSchema extends z.ZodType<FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>>, "resolver">,
) {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    mode: "onTouched",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    ...options,
  })
}
