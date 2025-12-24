import { Metadata } from "next"
import ProfileClient from "@modules/account/components/profile-client"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your profile",
}

export default function Profile() {
  return <ProfileClient />
}
