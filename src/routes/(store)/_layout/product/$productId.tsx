import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(store)/_layout/product/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(store)/_layout/product/$productId"!</div>
}
