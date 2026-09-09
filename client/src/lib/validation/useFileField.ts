"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { z } from "zod"

import { imageFile, mediaFile } from "@/lib/validation/fields"

type Result = {
  file: File | null
  preview: string | null
  error: string | undefined
  onSelect: (next: File | null) => void
  reset: () => void
  isValid: boolean
}

function useFileValidation(schema: z.ZodTypeAny, initialPreview: string | null = null): Result {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | undefined>(undefined)
  const [preview, setPreview] = useState<string | null>(initialPreview)
  const objectUrlRef = useRef<string | null>(null)

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  useEffect(() => () => clearObjectUrl(), [clearObjectUrl])

  const onSelect = (next: File | null) => {
    clearObjectUrl()
    if (!next) {
      setFile(null)
      setError(undefined)
      setPreview(initialPreview)
      return
    }
    const res = schema.safeParse(next)
    if (!res.success) {
      setFile(null)
      setError(res.error.issues[0]?.message ?? "That file can't be used")
      setPreview(initialPreview)
      return
    }
    const url = URL.createObjectURL(next)
    objectUrlRef.current = url
    setFile(next)
    setError(undefined)
    setPreview(url)
  }

  const reset = () => {
    clearObjectUrl()
    setFile(null)
    setError(undefined)
    setPreview(initialPreview)
  }

  return { file, preview, error, onSelect, reset, isValid: !!file && !error }
}

export function useImageField(opts?: { maxMB?: number; types?: string[]; initialPreview?: string | null }) {
  return useFileValidation(imageFile(opts), opts?.initialPreview ?? null)
}

export function useMediaField(opts?: { imageMB?: number; videoMB?: number }) {
  return useFileValidation(mediaFile(opts), null)
}
