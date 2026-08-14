import { Show, SignInButton, UserButton } from '@clerk/react'
import { NavLink } from 'react-router-dom'
import {navbar} from '../index'

const NavBar = () => {
  return (
    <>
<nav class="bg-neutral-primary fixed w-full z-20 top-0 start-0 ">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    <a href="https://vinbus.vn/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <span class="self-center text-2xl text-heading font-bold whitespace-nowrap text-green-600
        backdrop-blur-3xl
shadow-2xl px-2 py-1
rounded-2xl">VinBus</span>
    </a>
    <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <Show when="signed-out">
          <SignInButton className="mr-2 rounded-xl bg-neutral-600 px-2 py-1.5 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"/>
          {/* <SignUpButton className="rounded-xl bg-neutral-600 px-2 py-1.5 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"/> */}
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
        <button data-collapse-toggle="navbar-sticky" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-sticky" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
        </button>
    </div>
    <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1 bg-white/20
backdrop-blur-3xl
border border-white/10
shadow-2xl px-5 py-2.5
rounded-2xl" id="navbar-sticky">
      <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-400 rounded-base bg-neutral-secondary-soft md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-neutral-primary">
          {navbar.map((nav) => (
            <li key={nav.id}>
              <NavLink to={nav.link} end={nav.link === "/"}
              className={({ isActive }) => `block py-2 px-3 text-heading bg-brand rounded-sm md:bg-transparent md:text-fg-brand md:p-0 ${isActive ? "underline underline-offset-4 decoration-2" : ""}`}
              >
                  {nav.name}
              </NavLink>
            </li>
          ))}
      </ul>
    </div>
  </div>
</nav>

    </>
  )
}

export default NavBar
