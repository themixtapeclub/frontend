import { Metadata } from "next"
import Overview from "@modules/account/components/overview"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity",
}

export default async function OverviewTemplate() {
  return <Overview />
}
