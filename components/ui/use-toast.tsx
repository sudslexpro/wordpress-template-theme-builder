"use client"

import { toast as sonnerToast, ToastT, type ToasterProps } from "sonner"

export type ToastProps = ToastT & {
  title?: string
  description?: string
  action?: React.ReactNode
}

export const toast = (
  props: ToastProps | string,
  options?: ToasterProps
) => {
  if (typeof props === "string") {
    return sonnerToast(props, options)
  }

  const { title, description, action, ...restProps } = props

  return sonnerToast({
    ...restProps,
    title,
    description,
    action
  })
}

export type { ToasterProps as ToastOptions } from "sonner"