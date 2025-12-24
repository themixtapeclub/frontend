// src/modules/layout/templates/nav/index.tsx
import Header from "@modules/layout/components/header"
import Monogram from "@modules/layout/components/header/monogram"

export default async function Nav() {
  return (
    <>
      <Monogram />
      <Header />
    </>
  )
}
