import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    // Redirect root path to landing page
    throw redirect({
      to: '/landing',
    })
  },
})
