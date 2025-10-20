import PublicNavBar from "@/components/PublicNavBar"
import PrivateNavBar from "@/components/PrivateNavBar"
import { currentUser } from "@clerk/nextjs/server"

export default async function MainLayout({
    children,
} : {
    children : React.ReactNode
}){

    const user= await currentUser()

    return <main className="relative">

        {/* {render  a privateNav bar or a public Navbar} */}

        {user ? <PrivateNavBar/> : <PublicNavBar/>}
        {/* {render the children} */}
        <section className="pt-36">
            {children}
        </section>

    </main>
}